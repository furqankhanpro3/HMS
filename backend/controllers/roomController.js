const Room = require('../models/roomModel');
const Hostel = require('../models/hostelModel');
const Student = require('../models/studentModel');
const User = require('../models/userModel');
const { asyncHandler } = require('../middleware/errorMiddleware');

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
const getRooms = asyncHandler(async (req, res) => {
    const { search } = req.query;
    let filter = {};

    if (search && search.trim() !== '') {
        const queryStr = search.trim();
        
        const matchingUsers = await User.find({
            name: { $regex: queryStr, $options: 'i' }
        }).select('_id');
        const userIds = matchingUsers.map(u => u._id);

        const matchingStudents = await Student.find({
            $or: [
                { user: { $in: userIds } },
                { boardingNumber: { $regex: queryStr, $options: 'i' } }
            ]
        }).select('_id');
        const studentIds = matchingStudents.map(s => s._id);

        filter = {
            $or: [
                { roomNumber: { $regex: queryStr, $options: 'i' } },
                { occupants: { $in: studentIds } }
            ]
        };
    }

    const rooms = await Room.find(filter)
        .populate('hostel', 'name')
        .populate({
            path: 'occupants',
            select: 'boardingNumber fatherName contact',
            populate: {
                path: 'user',
                select: 'name email'
            }
        });
    res.status(200).json(rooms);
});

// @desc    Create a room
// @route   POST /api/rooms
// @access  Private/Admin
const createRoom = asyncHandler(async (req, res) => {
    const { roomNumber, hostel, seatType, floor, capacity, boardingFee } = req.body;

    if (!roomNumber || !hostel || !seatType || !floor || !capacity) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    const roomExists = await Room.findOne({ roomNumber, hostel });
    if (roomExists) {
        res.status(400);
        throw new Error('Room number already exists in this hostel');
    }

    const hostelDoc = await Hostel.findById(hostel);
    if (!hostelDoc) {
        res.status(404);
        throw new Error('Hostel not found');
    }

    const currentRoomCount = await Room.countDocuments({ hostel });
    if (currentRoomCount >= hostelDoc.totalRooms) {
        res.status(400);
        throw new Error(`Cannot add more rooms. Hostel limit of ${hostelDoc.totalRooms} rooms reached.`);
    }

    const room = await Room.create({
        roomNumber,
        hostel,
        seatType,
        floor,
        capacity,
        boardingFee: boardingFee !== undefined ? Number(boardingFee) : 0,
    });

    res.status(201).json(room);
});

// @desc    Update a room
// @route   PUT /api/rooms/:id
// @access  Private/Admin
const updateRoom = asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id);

    if (!room) {
        res.status(404);
        throw new Error('Room not found');
    }

    const { roomNumber, hostel } = req.body;

    // Check if new room number already exists in the target hostel
    if (roomNumber || hostel) {
        const targetHostel = hostel || room.hostel;
        const targetRoomNumber = roomNumber || room.roomNumber;

        const roomExists = await Room.findOne({
            roomNumber: targetRoomNumber,
            hostel: targetHostel,
            _id: { $ne: req.params.id }
        });

        if (roomExists) {
            res.status(400);
            throw new Error('Room number already exists in this hostel');
        }
    }

    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });

    res.status(200).json(updatedRoom);
});

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
const deleteRoom = asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id);

    if (!room) {
        res.status(404);
        throw new Error('Room not found');
    }

    await room.deleteOne();

    res.status(200).json({ id: req.params.id });
});

// @desc    Add item to room inventory
// @route   POST /api/rooms/:id/inventory
// @access  Private/Admin
const addRoomInventory = asyncHandler(async (req, res) => {
    const { name, quantity, condition, inventoryItem } = req.body;
    const room = await Room.findById(req.params.id);

    if (!room) {
        res.status(404);
        throw new Error('Room not found');
    }

    if (!name || !quantity) {
        res.status(400);
        throw new Error('Please add name and quantity');
    }

    // Check if an item with the same inventoryItem already exists in the room
    const existingItem = room.inventory.find(item => 
        (inventoryItem && item.inventoryItem && item.inventoryItem.toString() === inventoryItem.toString()) ||
        (!inventoryItem && !item.inventoryItem && item.name === name)
    );

    if (existingItem) {
        existingItem.quantity += Number(quantity);
    } else {
        room.inventory.push({ name, quantity, condition: condition || 'Good', inventoryItem });
    }

    await room.save();

    await room.populate({
        path: 'occupants',
        select: 'collegeNumber',
        populate: {
            path: 'user',
            select: 'name'
        }
    });

    res.status(200).json(room);
});

// @desc    Update room inventory item
// @route   PUT /api/rooms/:id/inventory/:itemId
// @access  Private/Admin
const updateRoomInventory = asyncHandler(async (req, res) => {
    const { name, quantity, condition, inventoryItem } = req.body;
    const room = await Room.findById(req.params.id);

    if (!room) {
        res.status(404);
        throw new Error('Room not found');
    }

    const item = room.inventory.id(req.params.itemId);
    if (!item) {
        res.status(404);
        throw new Error('Inventory item not found');
    }

    if (name) item.name = name;
    if (quantity !== undefined) item.quantity = quantity;
    if (condition) item.condition = condition;
    if (inventoryItem) item.inventoryItem = inventoryItem;

    await room.save();

    await room.populate({
        path: 'occupants',
        select: 'collegeNumber',
        populate: {
            path: 'user',
            select: 'name'
        }
    });

    res.status(200).json(room);
});

// @desc    Delete room inventory item
// @route   DELETE /api/rooms/:id/inventory/:itemId
// @access  Private/Admin
const deleteRoomInventory = asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id);

    if (!room) {
        res.status(404);
        throw new Error('Room not found');
    }

    room.inventory.pull({ _id: req.params.itemId });
    await room.save();

    await room.populate({
        path: 'occupants',
        select: 'collegeNumber',
        populate: {
            path: 'user',
            select: 'name'
        }
    });

    res.status(200).json(room);
});

module.exports = {
    getRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    addRoomInventory,
    updateRoomInventory,
    deleteRoomInventory,
};
