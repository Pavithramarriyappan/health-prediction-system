const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async (uri) => {
  if (!uri || !/^mongodb(\+srv)?:\/\//i.test(uri)) {
    logger.warn('MONGO_URI not set or invalid. Skipping MongoDB connection. Set MONGO_URI to a valid mongodb:// or mongodb+srv:// connection string in .env');
    return { connected: false };
  }
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('MongoDB connected');
    return { connected: true };
  } catch (err) {
    logger.error('MongoDB connection error', err);
    return { connected: false, error: err };
  }
};

module.exports = connectDB;
