const mongoose = require('mongoose');

const menuSchema = mongoose.Schema(
    {
        day: {
            type: String,
            required: true,
            unique: true,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        },
        breakfast: { type: String, required: true },
        lunch: { type: String, required: true },
        dinner: { type: String, required: true },
    },
    { timestamps: true }
);

const attendanceSchema = mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Student',
        },
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },

        status: {
            type: String,
            required: true,
            enum: ['Present', 'Absent'],
            default: 'Present',
        },
        markedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
);

const Menu = mongoose.model('Menu', menuSchema);
const MessAttendance = mongoose.model('MessAttendance', attendanceSchema);

module.exports = { Menu, MessAttendance };
