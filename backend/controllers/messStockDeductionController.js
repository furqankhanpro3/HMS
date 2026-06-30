const Inventory = require("../models/InventoryModel");
const MessStockDeduction = require("../models/messStockDeductionModel");

const deductStock = async (req, res) => {
  try {
    const deductions = req.body;
    // console.log(deductions);
    if (!deductions || !Array.isArray(deductions)) {
      return res.status(400).json({
        success: false,
        message: "Invalid deductions data",
      });
    }

    for (const item of deductions) {
      // Update inventory stock
      await Inventory.findByIdAndUpdate(
        item.itemId,
        {
          $set: {
            quantity: item.remainingAmount,
          },
        },
        { new: true },
      );

      // Save deduction history
      await MessStockDeduction.create({
        inventoryItem: item.itemId,
        itemName: item.itemName,
        currentStock: item.currentStock,
        deductAmount: item.deductAmount,
        remainingAmount: item.remainingAmount,
      });
    }

    res.status(200).json({
      success: true,
      message: "Stock deducted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  deductStock,
};
