const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    sourceType: {
      type: String,
      enum: ['inventory', 'custom'],
      required: true,
      default: 'custom',
    },
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    supplier: {
      type: String,
      trim: true,
      default: '',
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ sourceType: 1 });
expenseSchema.index({ title: 'text', supplier: 'text' });

module.exports = mongoose.model('Expense', expenseSchema);
