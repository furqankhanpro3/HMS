const express = require('express');
const router = express.Router();
const {
    getStudents,
    registerStudent,
    getMyProfile,
    updateStudent,
    deleteStudent,
} = require('../controllers/studentController');
const { protect, admin, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, admin, authorize('admissions', 'view'), getStudents);
router.post('/', protect, admin, authorize('admissions', 'create'), registerStudent);
router.get('/me', protect, getMyProfile);
router.put('/:id', protect, admin, authorize('admissions', 'edit'), updateStudent);
router.delete('/:id', protect, admin, authorize('admissions', 'delete'), deleteStudent);

module.exports = router;
