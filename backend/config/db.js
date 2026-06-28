const mongoose = require('mongoose');
const logger = require('../utils/logger');

const fallbackLocalUri = 'mongodb://localhost:27017/health_prediction_db';

const resolveMongoUri = (uri) => {
  if (!uri) {
    return fallbackLocalUri;
  }

  const password = process.env.MONGO_PASSWORD || process.env.MONGO_DB_PASSWORD;
  let resolvedUri = uri;

  if (password) {
    resolvedUri = resolvedUri
      .replace('<db_password>', password)
      .replace('<password>', password)
      .replace('${MONGO_PASSWORD}', password)
      .replace('${MONGO_DB_PASSWORD}', password);
  }

  if (
    resolvedUri.includes('YOUR_NEW_PASSWORD') ||
    resolvedUri.includes('YOUR_PASSWORD') ||
    resolvedUri.includes('your-password') ||
    resolvedUri.includes('<db_password>') ||
    resolvedUri.includes('<password>') ||
    resolvedUri.includes('${MONGO_PASSWORD}') ||
    resolvedUri.includes('${MONGO_DB_PASSWORD}')
  ) {
    logger.warn('MONGO_URI contains a placeholder password. Falling back to local MongoDB. Replace it with your real Atlas password to use Atlas.');
    return fallbackLocalUri;
  }

  return resolvedUri;
};

const connectDB = async (uri) => {
  const resolvedUri = resolveMongoUri(uri);
  const isAtlas = resolvedUri && resolvedUri.includes('mongodb+srv://');

  if (!resolvedUri || !/^mongodb(\+srv)?:\/\//i.test(resolvedUri)) {
    logger.warn('MONGO_URI not set or invalid. Skipping MongoDB connection. Set MONGO_URI to a valid mongodb:// or mongodb+srv:// connection string in .env');
    return { connected: false };
  }

  try {
    await mongoose.connect(resolvedUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    logger.info('MongoDB connected' + (isAtlas ? ' (Atlas)' : ' (Local)'));
    return { connected: true };
  } catch (err) {
    if (isAtlas) {
      logger.warn('Atlas connection failed. Falling back to local MongoDB.');
      logger.warn('To fix: Add your IP to MongoDB Atlas whitelist: https://www.mongodb.com/docs/atlas/security-whitelist/');
      logger.warn('Or add 0.0.0.0/0 for development (less secure)');
      
      // Try local fallback
      try {
        await mongoose.connect(fallbackLocalUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        logger.info('MongoDB connected (Local fallback)');
        return { connected: true };
      } catch (localErr) {
        logger.warn('Local MongoDB also unavailable. Server running without database.');
        return { connected: false, error: localErr };
      }
    } else {
      logger.error('MongoDB connection error', err);
      return { connected: false, error: err };
    }
  }
};

module.exports = connectDB;
