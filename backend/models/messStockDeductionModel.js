const mongoose = require("mongoose");

const messStockDeduction = new mongoose.Schema(
  {
    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },

    itemName: {
      type: String,
      required: true,
    },

    currentStock: {
      type: Number,
      required: true,
    },

    deductAmount: {
      type: Number,
      required: true,
    },

    remainingAmount: {
      type: Number,
      required: true,
    },

    deductedAt: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "MessStockDeduction",
  messStockDeduction
);