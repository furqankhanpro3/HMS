const Leave = require('../models/leaveModel');
const Student = require('../models/studentModel');
const { asyncHandler } = require('../middleware/errorMiddleware');

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private
const applyLeave = asyncHandler(async (req, res) => {
    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
        res.status(404);
        throw new Error('Student profile not found');
    }

    const leave = await Leave.create({
        student: student._id,
        startDate,
        endDate,
        reason,
    });

    res.status(201).json(leave);
});

// @desc    Get student's leave requests
// @route   GET /api/leaves/me
// @access  Private
const getMyLeaves = asyncHandler(async (req, res) => {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
        res.status(404);
        throw new Error('Student profile not found');
    }

    const leaves = await Leave.find({ student: student._id });
    res.status(200).json(leaves);
});

// @desc    Get all leave requests (Admin)
// @route   GET /api/leaves
// @access  Private/Admin
const getAllLeaves = asyncHandler(async (req, res) => {
    const leaves = await Leave.find({}).populate({
        path: 'student',
        populate: { path: 'user', select: 'name rollNumber' }
    });
    res.status(200).json(leaves);
});

// @desc    Update leave status (Admin)
// @route   PUT /api/leaves/:id
// @access  Private/Admin
const updateLeaveStatus = asyncHandler(async (req, res) => {
    const { status, remark } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status');
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
        res.status(404);
        throw new Error('Leave request not found');
    }

    leave.status = status;
    leave.remark = remark || '';
    leave.approvedBy = req.user.id;
    await leave.save();

    res.status(200).json(leave);
});

module.exports = {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    updateLeaveStatus,
};
