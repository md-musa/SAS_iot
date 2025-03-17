const mongoose = require('mongoose');

const connectDB = async () => {

    try {
        await mongoose.connect(process.env.MONGODB_LOCAL_URI);
        console.log('-> Connected successfully with MongoDB...');
    } catch (err) {
        console.log(`-> Could not connected Error: ${err} `);
    }
};

module.exports = connectDB;