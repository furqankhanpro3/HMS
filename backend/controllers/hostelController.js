const Hostel = require('../models/hostelModel');
const { asyncHandler } = require('../middleware/errorMiddleware');

// @desc    Get all hostels
// @route   GET /api/hostels
// @access  Private
const getHostels = asyncHandler(async (req, res) => {
    const hostels = await Hostel.find({});
    res.status(200).json(hostels);
});

// @desc    Create a hostel
// @route   POST /api/hostels
// @access  Private/Admin
const createHostel = asyncHandler(async (req, res) => {
    const { name, totalRooms, floors } = req.body;

    if (!name || !totalRooms || !floors ) {
        res.status(400);
        throw new Error('Please add name, total rooms, floors');
    }

    const hostelExists = await Hostel.findOne({ name });
    if (hostelExists) {
        res.status(400);
        throw new Error('Hostel already exists');
    }

    const hostel = await Hostel.create({
        name,
        totalRooms,
        floors,
        // description,
    });

    res.status(201).json(hostel);
});

// @desc    Update a hostel
// @route   PUT /api/hostels/:id
// @access  Private/Admin
const updateHostel = asyncHandler(async (req, res) => {
    const hostel = await Hostel.findById(req.params.id);

    if (!hostel) {
        res.status(404);
        throw new Error('Hostel not found');
    }

    const updatedHostel = await Hostel.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });

    res.status(200).json(updatedHostel);
});

// @desc    Delete a hostel
// @route   DELETE /api/hostels/:id
// @access  Private/Admin
const deleteHostel = asyncHandler(async (req, res) => {
    const hostel = await Hostel.findById(req.params.id);

    if (!hostel) {
        res.status(404);
        throw new Error('Hostel not found');
    }

    await hostel.deleteOne();

    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getHostels,
    createHostel,
    updateHostel,
    deleteHostel,
};
