const mongoose = require('mongoose');
const config = require('./index');

let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  try {
    connectionPromise = mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    await connectionPromise;
    console.log('MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    connectionPromise = null;
    console.error('MongoDB connection error:', error.message);

    if (error.message.includes('queryTxt ETIMEOUT')) {
      console.error(
        'Atlas DNS TXT lookup timed out. Use a standard mongodb:// seedlist URI instead of mongodb+srv:// on this network.'
      );
    }

    throw error;
  }
};

module.exports = connectDB;
