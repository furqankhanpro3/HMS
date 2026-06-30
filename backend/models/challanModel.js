const mongoose = require("mongoose");

const challanSchema = new mongoose.Schema(
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
    fatherName: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
      type: String,
      required: true,
      trim: true,
    },

    // Payment
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    receivedAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    balanceAmount: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      required: true,enum: ["cash", "bank_transfer", "cheque", "mobile_wallet"],
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
  enum: [null,"easypaisa", "jazzcash", "sadapay","nayapay","upaisa","other"],
  // e.g. "EasyPaisa", "JazzCash", "SadaPay"
},
    // Fee period
    feeMonth: {
      type: String,
      required: true,
      enum: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    },
    feeYear: {
      type: Number,
      required: true,
    },

    // Dates
    receivingDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      default: null,
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },

    // Status
    status: {
      type: String,
      enum: ["paid", "partial", "pending"],
      default: "pending",
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Auto-compute balanceAmount and status before saving
challanSchema.pre("save", function (next) {
  this.balanceAmount = this.totalAmount - this.receivedAmount;

  if (this.receivedAmount >= this.totalAmount) {
    this.status = "paid";
  } else if (this.receivedAmount > 0) {
    this.status = "partial";
  } else {
    this.status = "pending";
  }

  next();
});

// Compound index: one challan per boarder per month/year
challanSchema.index(
  { boardingNo: 1, feeMonth: 1, feeYear: 1 },
  { unique: true }
);

module.exports = mongoose.model("Challan", challanSchema);