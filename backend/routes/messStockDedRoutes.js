const express = require('express');
const router = express.Router();
const { protect, admin, authorize } = require('../middleware/authMiddleware');
const { deductStock } = require('../controllers/messStockDeductionController.js');

router.post('/', protect, admin, authorize('inventory', 'edit'), deductStock);

module.exports = router;
