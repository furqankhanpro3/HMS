const express = require('express');
const router = express.Router();
const { protect, admin, authorize } = require('../middleware/authMiddleware');
const { createChallan, getAllChallans, getMyChallans } = require('../controllers/challanController');

router.get('/', protect, admin, authorize('fee', 'view'), getAllChallans);
router.get('/me', protect, getMyChallans);
router.post('/', protect, admin, authorize('fee', 'create'), createChallan);

module.exports = router;
