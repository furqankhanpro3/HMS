const mongoose = require('mongoose');
const dotenv = require('dotenv').config({ path: './.env' });

const cleanup = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hostel_db');
        console.log('Connected to MongoDB');

        const collections = await mongoose.connection.db.listCollections({ name: 'rooms' }).toArray();
        if (collections.length > 0) {
            console.log('Dropping old indexes on rooms collection...');
            try {
                // Drop the old roomNumber_1 index if it exists
                await mongoose.connection.db.collection('rooms').dropIndex('roomNumber_1');
                console.log('Successfully dropped roomNumber_1 index');
            } catch (err) {
                if (err.codeName === 'IndexNotFound') {
                    console.log('roomNumber_1 index not found, might have been dropped already.');
                } else {
                    console.error('Error dropping index:', err.message);
                }
            }
        }

        console.log('Cleanup complete. Please restart your server.');
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
};

cleanup();
