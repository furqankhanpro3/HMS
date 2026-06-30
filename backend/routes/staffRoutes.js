const express = require('express');
const router = express.Router();
const {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffLeaves,
  createStaffLeave,
  deleteStaffLeave,
  getPayrollSheet,
  updatePayrollEntry,
  payPayrollEntry,
  deletePayrollEntry,
} = require('../controllers/staffController');
const { protect, admin, authorize } = require('../middleware/authMiddleware');

// Staff CRUD
router.get('/', protect, admin, authorize('staff', 'view'), getStaff);
router.post('/', protect, admin, authorize('staff', 'create'), createStaff);
router.put('/:id', protect, admin, authorize('staff', 'edit'), updateStaff);
router.delete('/:id', protect, admin, authorize('staff', 'delete'), deleteStaff);

// Staff Leaves
router.get('/leaves', protect, admin, authorize('staff', 'view'), getStaffLeaves);
router.post('/leaves', protect, admin, authorize('staff', 'create'), createStaffLeave);
router.delete('/leaves/:id', protect, admin, authorize('staff', 'delete'), deleteStaffLeave);

// Staff Payroll
router.get('/payroll', protect, admin, authorize('staff', 'view'), getPayrollSheet);
router.put('/payroll/:id', protect, admin, authorize('staff', 'edit'), updatePayrollEntry);
router.post('/payroll/:id/pay', protect, admin, authorize('staff', 'edit'), payPayrollEntry);
router.delete('/payroll/:id', protect, admin, authorize('staff', 'delete'), deletePayrollEntry);

module.exports = router;
