const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { asyncHandler } = require('../middleware/errorMiddleware');

const MODULES = [
  'dashboard',
  'admissions',
  'hostels',
  'inventory',
  'mess',
  'complaints',
  'leaves',
  'fee',
  'finance',
  'admins',
];

const sanitizePermissions = (input = {}) => {
  const permissions = {};
  MODULES.forEach((module) => {
    permissions[module] = {
      view: !!input[module]?.view,
      create: !!input[module]?.create,
      edit: !!input[module]?.edit,
      delete: !!input[module]?.delete,
    };
  });
  return permissions;
};

// @desc    Register new user (admin/superadmin only from admin panel)
// @route   POST /api/admin
// @access  Private/SuperAdmin
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, permissions } = req.body;

    if (!name || !email || !password || !role) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    if (!['admin', 'superadmin'].includes(role)) {
        res.status(400);
        throw new Error('Invalid admin role');
    }

    if (role === 'superadmin' && req.user?.role !== 'superadmin') {
        res.status(403);
        throw new Error('Only a superadmin can create superadmin accounts');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Superadmins get full permissions; admins receive sanitized permissions
    const userPermissions = role === 'superadmin'
        ? sanitizePermissions(Object.fromEntries(MODULES.map((m) => [m, { view: true, create: true, edit: true, delete: true }])))
        : sanitizePermissions(permissions);

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role,
        isAdmin: true,
        permissions: userPermissions,
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            permissions: user.permissions,
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/admin/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { loginId, password, loginType } = req.body;

    if (!loginId || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Build query based on login type
    let query;
    if (loginType === 'student') {
        // Students log in with boardingNumber or email
        query = {
            role: 'student',
            $or: [
                { boardingNumber: loginId },
                { email: loginId }
            ]
        };
    } else {
        // Admins log in with email only
        query = {
            role: { $in: ['admin', 'superadmin'] },
            email: loginId
        };
    }

    const user = await User.findOne(query);

    if (user && (await user.matchPassword(password))) {
        const token = generateToken(user._id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            boardingNumber: user.boardingNumber,
            isAdmin: user.isAdmin,
            role: user.role,
            permissions: user.permissions,
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

// @desc    Get user data
// @route   GET /api/admin/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json(user);
});

// @desc    Update current user profile (email/password)
// @route   PUT /api/admin/me
// @access  Private/Admin
const updateProfile = asyncHandler(async (req, res) => {
    const { email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (email !== undefined) {
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            res.status(400);
            throw new Error('Valid email is required');
        }
        const existing = await User.findOne({ email, _id: { $ne: user._id } });
        if (existing) {
            res.status(400);
            throw new Error('Email already in use');
        }
        user.email = email;
    }

    if (newPassword) {
        if (!currentPassword) {
            res.status(400);
            throw new Error('Current password is required to set a new password');
        }
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            res.status(401);
            throw new Error('Current password is incorrect');
        }
        user.password = newPassword;
    }

    const updatedUser = await user.save();

    res.json({
        _id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isAdmin: updatedUser.isAdmin,
        permissions: updatedUser.permissions,
    });
});

// @desc    Get all admins
// @route   GET /api/admin/all
// @access  Private/SuperAdmin
const getUsers = asyncHandler(async (req, res) => {
    console.log('GET /api/admin/all hit by user:', req.user.email);
    const users = await User.find({ role: { $in: ['admin', 'superadmin'] } }).select('-password');
    console.log(`Found ${users.length} admins`);
    res.status(200).json(users);
});

// @desc    Update user
// @route   PUT /api/admin/:id
// @access  Private/SuperAdmin
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Only superadmins can manage superadmin accounts
    if (req.user.role !== 'superadmin' && (user.role === 'superadmin' || role === 'superadmin')) {
        res.status(403);
        throw new Error('Only a superadmin can manage superadmin accounts');
    }

    const { name, email, password, role, permissions } = req.body;

    if (name !== undefined) user.name = name || user.name;
    if (email !== undefined) {
        const existing = await User.findOne({ email, _id: { $ne: user._id } });
        if (existing) {
            res.status(400);
            throw new Error('Email already in use');
        }
        user.email = email;
    }
    if (password) {
        user.password = password;
    }
    if (role !== undefined) {
        if (!['admin', 'superadmin'].includes(role)) {
            res.status(400);
            throw new Error('Invalid admin role');
        }
        user.role = role;
        // Recompute permissions when role changes
        user.permissions = role === 'superadmin'
            ? sanitizePermissions(Object.fromEntries(MODULES.map((m) => [m, { view: true, create: true, edit: true, delete: true }])))
            : sanitizePermissions(permissions);
    } else if (permissions !== undefined && user.role !== 'superadmin') {
        user.permissions = sanitizePermissions(permissions);
    }

    const updatedUser = await user.save();

    res.json({
        _id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isAdmin: updatedUser.isAdmin,
        permissions: updatedUser.permissions,
    });
});

// @desc    Delete user
// @route   DELETE /api/admin/:id
// @access  Private/SuperAdmin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (req.user.role !== 'superadmin' && user.role === 'superadmin') {
            res.status(403);
            throw new Error('Only a superadmin can delete superadmin accounts');
        }
        if (user.role === 'superadmin') {
            res.status(400);
            throw new Error('Superadmin cannot be deleted');
        }
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Logout user / Clear cookie
// @route   POST /api/admin/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
        path: '/',
    });
    res.status(200).json({ message: 'Logged out successfully' });
});

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    updateProfile,
    getUsers,
    updateUser,
    deleteUser,
};
