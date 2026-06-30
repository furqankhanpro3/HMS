const express = require('express');
const router = express.Router();
const {
    getMenu,
    updateMenu,
    markAttendance,
    getAttendanceLogs,
    getMessInventory,
} = require('../controllers/messController');
const { protect, admin, authorize } = require('../middleware/authMiddleware');

router.get('/menu', getMenu);
router.put('/menu/:day', protect, admin, authorize('mess', 'edit'), updateMenu);
router.post('/attendance', protect, admin, authorize('mess', 'create'), markAttendance);
router.get('/attendance', protect, getAttendanceLogs);
router.get('/inventory', getMessInventory);

module.exports = router;
