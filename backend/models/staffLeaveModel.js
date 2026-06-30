const mongoose = require('mongoose');

const staffLeaveSchema = mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Staff',
    },
    startDate: {
      type: Date,
      required: [true, 'Please add a start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please add an end date'],
    },
    reason: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      required: true,
      enum: ['Approved', 'Pending', 'Rejected'],
      default: 'Approved',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StaffLeave', staffLeaveSchema);
