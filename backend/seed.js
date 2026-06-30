const mongoose = require('mongoose');
const User = require('./models/userModel');
const Student = require('./models/studentModel');
const connectDB = require('./config/db');

require('dotenv').config();

const fullPermissions = () => ({
  dashboard: { view: true, create: true, edit: true, delete: true },
  admissions: { view: true, create: true, edit: true, delete: true },
  hostels: { view: true, create: true, edit: true, delete: true },
  inventory: { view: true, create: true, edit: true, delete: true },
  mess: { view: true, create: true, edit: true, delete: true },
  complaints: { view: true, create: true, edit: true, delete: true },
  leaves: { view: true, create: true, edit: true, delete: true },
  fee: { view: true, create: true, edit: true, delete: true },
  finance: { view: true, create: true, edit: true, delete: true },
  admins: { view: true, create: true, edit: true, delete: true },
  staff: { view: true, create: true, edit: true, delete: true },
});

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Student.deleteMany();

    // Create admin
    const admin = new User({
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: 'admin123',
      isAdmin: true,
      role: 'admin',
      permissions: fullPermissions(),
    });
    await admin.save();
    console.log('Admin created');

    // Create superadmin
    const superAdmin = new User({
      name: 'Super Admin',
      email: 'superadmin@gmail.com',
      password: 'super123',
      isAdmin: true,
      role: 'superadmin',
      permissions: fullPermissions(),
    });
    await superAdmin.save();
    console.log('Superadmin created');

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();