const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const modulePermissionSchema = new mongoose.Schema(
  {
    view: { type: Boolean, default: false },
    create: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Allow nulls while maintaining uniqueness
    },
    boardingNumber: {
      type: String,
      required: false, // ✅ not required for admin/superadmin
      unique: true,
      sparse: true, // ✅ allows multiple nulls without unique conflict
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    role: {
      type: String,
      required: true,
      enum: ['student', 'admin', 'superadmin'],
    },
    permissions: {
      dashboard: { type: modulePermissionSchema, default: () => ({}) },
      admissions: { type: modulePermissionSchema, default: () => ({}) },
      hostels: { type: modulePermissionSchema, default: () => ({}) },
      inventory: { type: modulePermissionSchema, default: () => ({}) },
      mess: { type: modulePermissionSchema, default: () => ({}) },
      complaints: { type: modulePermissionSchema, default: () => ({}) },
      leaves: { type: modulePermissionSchema, default: () => ({}) },
      fee: { type: modulePermissionSchema, default: () => ({}) },
      finance: { type: modulePermissionSchema, default: () => ({}) },
      admins: { type: modulePermissionSchema, default: () => ({}) },
      staff: { type: modulePermissionSchema, default: () => ({}) },
    },
  },
  {
    timestamps: true,
  }
);

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
