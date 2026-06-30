const mongoose = require('mongoose');

const complaintSchema = mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Student',
        },
        category: {
            type: String,
            required: true,
            enum: ['Maintenance', 'Food', 'Cleanliness', 'Security', 'Other'],
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium',
        },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Resolved'],
            default: 'Pending',
        },
        adminRemark: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

// Index for faster student-based lookups
complaintSchema.index({ student: 1 });

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
