const Complaint = require('../models/complaintModel');
const Student = require('../models/studentModel');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Student/Admin)
const createComplaint = async (req, res) => {
    try {
        console.log('Received complaint submission:', req.body);
        const { student, category, description, priority } = req.body;

        if (!student || !category || !description) {
            return res.status(400).json({
                message: 'Please provide all required fields',
                received: { student, category, description }
            });
        }

        const complaint = await Complaint.create({
            student,
            category,
            description,
            priority: priority || 'Medium',
        });

        const populatedComplaint = await Complaint.findById(complaint._id)
            .populate({
                path: 'student',
                populate: [
                    { path: 'user', select: 'name email' },
                    { path: 'room', populate: { path: 'hostel', select: 'name' } }
                ]
            });

        res.status(201).json(populatedComplaint);
    } catch (error) {
        console.error('Create Complaint Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private (Admin only)
const getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate({
                path: 'student',
                populate: [
                    { path: 'user', select: 'name email collegeNumber' },
                    { path: 'room', populate: { path: 'hostel', select: 'name' } }
                ]
            })
            .sort({ createdAt: -1 });

        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current student's complaints
// @route   GET /api/complaints/my
// @access  Private (Student)
const getMyComplaints = async (req, res) => {
    try {
        const { studentId } = req.query;

        if (!studentId) {
            return res.status(400).json({ message: 'Student ID is required' });
        }

        const complaints = await Complaint.find({ student: studentId })
            .populate({
                path: 'student',
                populate: [
                    { path: 'user', select: 'name email' },
                    { path: 'room', populate: { path: 'hostel', select: 'name' } }
                ]
            })
            .sort({ createdAt: -1 });

        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id
// @access  Private (Admin only)
const updateComplaintStatus = async (req, res) => {
    try {
        const { status, adminRemarks, priority } = req.body;

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        if (status) complaint.status = status;
        if (adminRemark !== undefined) complaint.adminRemark = adminRemark;
        if (priority) complaint.priority = priority;

        const updatedComplaint = await complaint.save();

        const populatedComplaint = await Complaint.findById(updatedComplaint._id)
            .populate({
                path: 'student',
                populate: [
                    { path: 'user', select: 'name email collegeNumber' },
                    { path: 'room', populate: { path: 'hostel', select: 'name' } }
                ]
            });

        res.json(populatedComplaint);
    } catch (error) {
        console.error('Update Complaint Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private (Admin only)
const deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        await complaint.deleteOne();
        res.json({ message: 'Complaint removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createComplaint,
    getAllComplaints,
    getMyComplaints,
    updateComplaintStatus,
    deleteComplaint,
};
