const mongoose = require('mongoose');
const config = require('./index');

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);

    if (error.message.includes('queryTxt ETIMEOUT')) {
      console.error(
        'Atlas DNS TXT lookup timed out. Use a standard mongodb:// seedlist URI instead of mongodb+srv:// on this network.'
      );
    }

    process.exit(1);
  }
};

module.exports = connectDB;
