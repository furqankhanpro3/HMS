const express = require("express");
const router = express.Router();
const { protect, admin, authorize } = require("../middleware/authMiddleware");
const {
  getIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
} = require("../controllers/incomeController");

router.get("/", protect, admin, authorize('finance', 'view'), getIncomes);
router.post("/", protect, admin, authorize('finance', 'create'), createIncome);
router.put("/:id", protect, admin, authorize('finance', 'edit'), updateIncome);
router.delete("/:id", protect, admin, authorize('finance', 'delete'), deleteIncome);

module.exports = router;
