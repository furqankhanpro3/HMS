const express = require('express');
const router = express.Router();

const { protect, admin, authorize } = require('../middleware/authMiddleware');
const {
  SearchBoardingNo,
  getStudentFeeInfo,
  getFeeLedger,
  recordPayment,
} = require('../controllers/feeController');

router.get('/search', protect, admin, authorize('fee', 'view'), SearchBoardingNo);
router.get('/student/:boardingNo', protect, admin, authorize('fee', 'view'), getStudentFeeInfo);
router.get('/ledger/:boardingNo', protect, admin, authorize('fee', 'view'), getFeeLedger);
router.post('/payment', protect, admin, authorize('fee', 'create'), recordPayment);

module.exports = router;
