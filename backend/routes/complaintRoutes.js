const express = require('express');
const router = express.Router();
const {
    createComplaint,
    getAllComplaints,
    getMyComplaints,
    updateComplaintStatus,
    deleteComplaint,
} = require('../controllers/complaintController');
const { protect, admin, authorize } = require('../middleware/authMiddleware');

// Public/Student routes
router.get('/test', (req, res) => res.json({ message: 'Complaint routes working' }));
router.post('/', protect, createComplaint);
router.get('/my', protect, getMyComplaints);

// Admin routes  
router.get('/', protect, admin, authorize('complaints', 'view'), getAllComplaints);
router.put('/:id', protect, admin, authorize('complaints', 'edit'), updateComplaintStatus);
router.delete('/:id', protect, admin, authorize('complaints', 'delete'), deleteComplaint);

module.exports = router;
