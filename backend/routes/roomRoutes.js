const express = require('express');
const router = express.Router();
const {
    getRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    addRoomInventory,
    updateRoomInventory,
    deleteRoomInventory,
} = require('../controllers/roomController');
const { protect, admin, authorize } = require('../middleware/authMiddleware');

router.get('/', getRooms);
router.post('/', protect, admin, authorize('hostels', 'create'), createRoom);
router.put('/:id', protect, admin, authorize('hostels', 'edit'), updateRoom);
router.delete('/:id', protect, admin, authorize('hostels', 'delete'), deleteRoom);
router.post('/:id/inventory', protect, admin, authorize('inventory', 'create'), addRoomInventory);
router.put('/:id/inventory/:itemId', protect, admin, authorize('inventory', 'edit'), updateRoomInventory);
router.delete('/:id/inventory/:itemId', protect, admin, authorize('inventory', 'delete'), deleteRoomInventory);

module.exports = router;
