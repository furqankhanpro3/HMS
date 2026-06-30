const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    supplier: {
      type: String,
      trim: true,
      default: "",
    },
    unitPrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    location: {
      type:String,default:""
    },
    unit: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    quantity: {
      type: Number,
      min: 0,
      default: 0,
    },
    discount: {
      type: Number,
      min: 0,
      default: 0,
    },
    category: {
      type: String,
      // trim: true,
      default: "",
    },
    condition: {
      type: String,
      default: "",
    },
    itemType: {
      type: String,
      // trim: true,
      default: "",
    },
    messSubCategory: {
      type: String,
      // trim: true,
      default: "",
    },
    messItem: {
      type: String,
      // trim: true,
      default: "",
    },
    totalPrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    purchase_date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  },
);

// Auto-calculate totalPrice before saving
inventorySchema.pre("save", function (next) {
  if (this.unitPrice && this.quantity) {
    const subtotal = this.unitPrice * this.quantity;
    this.totalPrice = subtotal - this.discount;
  }
  next();
});

const Purchase = mongoose.model("Inventory", inventorySchema);

module.exports = Purchase;
