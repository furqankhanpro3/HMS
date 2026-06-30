const express = require('express');
const router = express.Router();
const { getHostels, createHostel, updateHostel, deleteHostel } = require('../controllers/hostelController');
const { protect, admin, authorize } = require('../middleware/authMiddleware');

router.route('/').get(protect, getHostels).post(protect, admin, authorize('hostels', 'create'), createHostel);
router.route('/:id').put(protect, admin, authorize('hostels', 'edit'), updateHostel).delete(protect, admin, authorize('hostels', 'delete'), deleteHostel);

module.exports = router;
