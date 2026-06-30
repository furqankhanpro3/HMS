const express = require("express");
const router = express.Router();
const { protect, admin, authorize } = require("../middleware/authMiddleware");
const {
  addInventory,
  getAllInventory,
  getFilteredInventory,
  updateInventory,
  deleteInventory,
} = require("../controllers/InventoryController");

router.get("/", protect, admin, authorize('inventory', 'view'), getAllInventory);
router.post("/", protect, admin, authorize('inventory', 'create'), addInventory);
router.put("/:id", protect, admin, authorize('inventory', 'edit'), updateInventory);
router.get("/filter", protect, admin, authorize('inventory', 'view'), getFilteredInventory);
router.delete("/:id", protect, admin, authorize('inventory', 'delete'), deleteInventory);

module.exports = router;
