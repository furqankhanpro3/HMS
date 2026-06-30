const mongoose = require('mongoose');

const leaveSchema = mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Student',
        },
        startDate: {
            type: Date,
            required: [true, 'Please add a start date'],
        },
        endDate: {
            type: Date,
            required: [true, 'Please add an end date'],
        },
        reason: {
            type: String,
            required: [true, 'Please add a reason for leave'],
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending',
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        remark: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// Index for student
leaveSchema.index({ student: 1 });

module.exports = mongoose.model('Leave', leaveSchema);
