const { Menu, MessAttendance } = require('../models/messModel');
const Student = require('../models/studentModel');
const { asyncHandler } = require('../middleware/errorMiddleware');
const Inventory =require ("../models/InventoryModel");
const getMessInventory = async (req, res) => {
  try {
    const inventoryItems = await Inventory.find({
      category: 'mess_inventory',
      messSubCategory: 'dry_grocery',
    });

    res.status(200).json({ success: true, data: inventoryItems });
  } catch (error) {
    console.error('❌ Error fetching mess inventory:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch mess inventory' });
  }
};
// @desc    Get weekly menu
// @route   GET /api/mess/menu
// @access  Public
const getMenu = asyncHandler(async (req, res) => {
    const menu = await Menu.find({});
    res.status(200).json(menu);
});

// @desc    Update menu for a day
// @route   PUT /api/mess/menu/:day
// @access  Private/Admin
const updateMenu = asyncHandler(async (req, res) => {
    const {
        breakfast,
        lunch,
        dinner,
    } = req.body;

    const menu = await Menu.findOneAndUpdate(
        { day: req.params.day },
        {
            breakfast,
            lunch,
            dinner,
        },
        { new: true, upsert: true }
    );
    res.status(200).json(menu);
});

// @desc    Mark mess attendance
// @route   POST /api/mess/attendance
// @access  Private
const markAttendance = asyncHandler(async (req, res) => {
    const { status, studentId, date } = req.body;

    let student;
    if (studentId) {
        student = await Student.findById(studentId);
    } else {
        student = await Student.findOne({ user: req.user.id });
    }

    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    // Check if record already exists for this date
    const searchQuery = {
        student: student._id
    };

    if (date) {
        // Create start and end of the date from the input
        const d = new Date(date);
        const start = new Date(d.setHours(0, 0, 0, 0));
        const end = new Date(d.setHours(23, 59, 59, 999));
        searchQuery.date = {
            $gte: start,
            $lte: end
        };
    } else {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        searchQuery.date = {
            $gte: start,
            $lte: end
        };
    }

    // Update existing or create new
    const attendance = await MessAttendance.findOneAndUpdate(
        searchQuery,
        {
            student: student._id,
            status,
            date: date ? new Date(date) : Date.now(),
            markedBy: req.user._id
        },
        { new: true, upsert: true } // upsert true so it creates if not exists
    );

    // Populate student and markedBy for the response to keep UI consistent
    const populatedAttendance = await MessAttendance.findById(attendance._id)
        .populate({
            path: 'student',
            populate: { path: 'user', select: 'name' }
        })
        .populate('markedBy', 'name email');

    res.status(201).json(populatedAttendance);
});

// @desc    Get attendance logs
// @route   GET /api/mess/attendance
// @access  Private/Admin
const getAttendanceLogs = asyncHandler(async (req, res) => {
    const logs = await MessAttendance.find({}).populate({
        path: 'student',
        populate: { path: 'user', select: 'name' }
    }).populate('markedBy', 'name');
    res.status(200).json(logs);
});

module.exports = {
    getMenu,
    updateMenu,
    markAttendance,
    getAttendanceLogs,getMessInventory
};
