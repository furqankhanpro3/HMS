const express = require("express");
const router = express.Router();
const { protect, admin, authorize } = require("../middleware/authMiddleware");
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");

router.get("/", protect, admin, authorize('finance', 'view'), getExpenses);
router.post("/", protect, admin, authorize('finance', 'create'), createExpense);
router.put("/:id", protect, admin, authorize('finance', 'edit'), updateExpense);
router.delete("/:id", protect, admin, authorize('finance', 'delete'), deleteExpense);

module.exports = router;
