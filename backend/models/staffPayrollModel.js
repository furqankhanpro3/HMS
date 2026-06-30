const mongoose = require('mongoose');

const staffPayrollSchema = mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Staff',
    },
    month: {
      type: String,
      required: [true, 'Please add a month'],
    },
    year: {
      type: Number,
      required: [true, 'Please add a year'],
    },
    basicPay: {
      type: Number,
      required: [true, 'Please add basic pay'],
    },
    allowances: {
      type: Number,
      default: 0,
    },
    deductions: {
      type: Number,
      default: 0,
    },
    netPay: {
      type: Number,
      required: [true, 'Please add net pay'],
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Paid'],
      default: 'Pending',
    },
    paidDate: {
      type: Date,
      default: null,
    },
    expense: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StaffPayroll', staffPayrollSchema);
