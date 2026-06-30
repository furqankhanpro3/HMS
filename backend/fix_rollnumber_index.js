const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Access the native MongoDB driver
        const db = mongoose.connection.db;
        const collection = db.collection('students');

        // List indexes
        const indexes = await collection.indexes();
        console.log('Current Indexes:', indexes);

        // Drop the rollNumber index if it exists
        const rollNumberIndex = indexes.find(idx => idx.key.rollNumber === 1);

        if (rollNumberIndex) {
            console.log(`Found rollNumber index: ${rollNumberIndex.name}. Dropping...`);
            await collection.dropIndex(rollNumberIndex.name);
            console.log('RollNumber index dropped successfully.');
        } else {
            console.log('No rollNumber index found.');
        }

        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();
