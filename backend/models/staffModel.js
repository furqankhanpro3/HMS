const mongoose = require('mongoose');

const staffSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    role: {
      type: String,
      required: [true, 'Please add a role'],
    },
    contact: {
      type: String,
      required: [true, 'Please add a contact number'],
    },
    email: {
      type: String,
      default: '',
    },
    basicPay: {
      type: Number,
      required: [true, 'Please add a basic salary/pay'],
    },
    status: {
      type: String,
      required: true,
      enum: ['Active', 'On Leave', 'Inactive'],
      default: 'Active',
    },
    joiningDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Staff', staffSchema);
