const mongoose = require("mongoose");

const studentSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    boardingNumber: {
      type: String,
      required: [true, "Please add a boarding number"],
      unique: true,
    },
    fatherName: {
      type: String,
      required: [true, "Please add a father name"],
    },
    organizationName: {
      type: String,
    },
    occupation: {
      type: String,
    },
    fee: {
      type: Number,
    },
    discount: {
      type: Number,
      default: 0,
    },
    occupationOther: {
      type: String,
      default: "",
    },
    // program: {
    //     type: String,
    // },
    // department: {
    //     type: String,
    // },
    contact: {
      type: String,
    },
    parentContact: {
      type: String,
    },
    // year: {
    //     type: String,
    // },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Active", "Graduated", "Withdrawn"],
      default: "Active",
    },
    password: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtuals for related data
studentSchema.virtual("complaints", {
  ref: "Complaint",
  localField: "_id",
  foreignField: "student",
});

studentSchema.virtual("leaves", {
  ref: "Leave",
  localField: "_id",
  foreignField: "student",
});

studentSchema.virtual("attendance", {
  ref: "MessAttendance",
  localField: "_id",
  foreignField: "student",
});

// Indexes for performance
studentSchema.index({ room: 1 });
studentSchema.index({ hostel: 1 });

module.exports = mongoose.model("Student", studentSchema);
