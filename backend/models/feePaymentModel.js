const mongoose = require('mongoose');

const feePaymentSchema = new mongoose.Schema(
  {
    boardingNo: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    boarderName: {
      type: String,
      required: true,
      trim: true,
    },
    feeMonth: {
      type: String,
      required: true,
      enum: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ],
    },
    feeYear: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['cash', 'bank_transfer', 'cheque', 'mobile_wallet'],
    },
    transactionNo: {
      type: String,
      trim: true,
      default: null,
    },
    walletProvider: {
      type: String,
      trim: true,
      default: null,
    },
    receivingDate: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

feePaymentSchema.index({ boardingNo: 1, feeMonth: 1, feeYear: 1 });

module.exports = mongoose.model('FeePayment', feePaymentSchema);
