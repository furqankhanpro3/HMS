const mongoose = require('mongoose');

const roomSchema = mongoose.Schema(
    {
        roomNumber: {
            type: String,
            required: [true, 'Please add a room number'],
        },
        hostel: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Please add a hostel'],
            ref: 'Hostel',
        },
        seatType: {
            type: String,
            required: [true, 'Please add a seat type'],
            enum: ['Single', 'Double', 'Triple', 'Quad', 'Quin'],
        },
        floor: {
            type: String,
            required: [true, 'Please add a floor'],
            enum: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor'],
        },
        capacity: {
            type: Number,
            required: [true, 'Please add capacity'],
        },
        boardingFee: {
            type: Number,
            default: 0,
            min: 0,
        },
        currentOccupants: {
            type: Number,
            default: 0,
        },
        occupants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Student',
            },
        ],
        status: {
            type: String,
            enum: ['Available', 'Full', 'Maintenance'],
            default: 'Available',
        },
        inventory: [
            {
                name: {
                    type: String,
                    required: true,
                },
                inventoryItem: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Inventory',
                },
                quantity: {
                    type: Number,
                    required: true,
                    default: 1,
                },
                condition: {
                    type: String,
                    enum: ['Good', 'Fair', 'Poor'],
                    default: 'Good',
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Add compound index for room number uniqueness within a hostel
roomSchema.index({ roomNumber: 1, hostel: 1 }, { unique: true });

// Add index for hostel for faster lookups
roomSchema.index({ hostel: 1 });

// Add index for occupants for faster searching by student
roomSchema.index({ occupants: 1 });

module.exports = mongoose.model('Room', roomSchema);
