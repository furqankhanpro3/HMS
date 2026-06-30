const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Access the native MongoDB driver
        const db = mongoose.connection.db;
        const collection = db.collection('users');

        // List indexes
        const indexes = await collection.indexes();
        console.log('Current Indexes:', indexes);

        // Drop the email index if it exists
        const emailIndex = indexes.find(idx => idx.key.email === 1);

        if (emailIndex) {
            console.log(`Found email index: ${emailIndex.name}. Dropping...`);
            await collection.dropIndex(emailIndex.name);
            console.log('Email index dropped successfully.');
        } else {
            console.log('No email index found.');
        }

        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();
