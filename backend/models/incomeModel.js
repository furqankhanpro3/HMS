const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema(
  {
    sourceType: {
      type: String,
      enum: ['challan', 'custom'],
      required: true,
      default: 'custom',
    },
    challan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challan',
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
    paymentMethod: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['paid', 'partial', 'pending'],
      default: 'paid',
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

incomeSchema.index({ date: -1 });
incomeSchema.index({ category: 1 });
incomeSchema.index({ status: 1 });
incomeSchema.index({ paymentMethod: 1 });
incomeSchema.index({ sourceType: 1 });
incomeSchema.index({ title: 'text' });

module.exports = mongoose.model('Income', incomeSchema);
