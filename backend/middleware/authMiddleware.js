const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
    // Get token from cookie or header
    let token; // Declare token with let or const

    // The original code already checks req.cookies?.token
    token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer') ? req.headers.authorization.split(' ')[1] : null);
    if (token) {
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            return next(new Error('Not authorized'));
        }
    }

    if (!token) {
        res.status(401);
        return next(new Error('Not authorized, no token'));
    }
};

const admin = (req, res, next) => {
    if (req.user && (req.user.isAdmin || req.user.role === 'admin' || req.user.role === 'superadmin')) {
        next();
    } else {
        res.status(401);
        next(new Error('Not authorized as an admin'));
    }
};

const superAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'superadmin') {
        next();
    } else {
        res.status(401);
        next(new Error('Not authorized as a super admin'));
    }
};

// Module-based access control: checks req.user.permissions[module][action]
const authorize = (module, action = 'view') => (req, res, next) => {
    if (!req.user) {
        res.status(401);
        return next(new Error('Not authorized'));
    }
    if (req.user.role === 'superadmin') {
        return next();
    }
    const allowed = req.user.permissions?.[module]?.[action] === true;
    if (allowed) {
        return next();
    }
    res.status(403);
    return next(new Error(`Access denied: ${action} permission required for ${module}`));
};

module.exports = { protect, admin, superAdmin, authorize };
