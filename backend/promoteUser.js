const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/userModel');

// Load env vars from backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

const promoteUser = async () => {
    const identifier = process.argv[2];
    const role = process.argv[3] || 'admin';

    if (!identifier) {
        console.log('Usage: node promoteUser.js <email_or_collegeNumber> [role]');
        console.log('Roles: student, admin, superadmin');
        process.exit(1);
    }

    if (!['student', 'admin', 'superadmin'].includes(role)) {
        console.error('Invalid role. Use: student, admin, or superadmin');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const user = await User.findOne({
            $or: [
                { email: identifier },
                { collegeNumber: identifier }
            ]
        });

        if (!user) {
            console.error('User not found');
            process.exit(1);
        }

        user.role = role;
        user.isAdmin = (role === 'admin' || role === 'superadmin');
        await user.save();

        console.log(`Successfully promoted ${user.name} to ${role}`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

promoteUser();
