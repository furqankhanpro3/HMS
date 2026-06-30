const mongoose = require('mongoose');

const hostelSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a hostel name'],
            unique: true,
        },
        totalRooms: {
            type: Number,
            required: [true, 'Please add total number of rooms'],
        },
        floors: {
            type: Number,
            required: [true, 'Please add total number of floors'],
            default: 1,
        },
        // category: {
        //     type: [String],
        //     required: [true, 'Please specify the category'],
        //     enum: ['1st Year', '2nd Year', 'BS'],
        //     default: ['BS'],
        // },
        // description: {
        //     type: String,
        // },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual for rooms belonging to this hostel
hostelSchema.virtual('rooms', {
    ref: 'Room',
    localField: '_id',
    foreignField: 'hostel',
});

module.exports = mongoose.model('Hostel', hostelSchema);
