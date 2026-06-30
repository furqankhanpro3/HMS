const express = require('express');
const router = express.Router();
const {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    updateLeaveStatus,
} = require('../controllers/leaveController');
const { protect, admin, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, applyLeave);
router.get('/me', protect, getMyLeaves);
router.get('/', protect, admin, authorize('leaves', 'view'), getAllLeaves);
router.put('/:id', protect, admin, authorize('leaves', 'edit'), updateLeaveStatus);

module.exports = router;
