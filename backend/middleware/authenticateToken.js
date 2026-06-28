const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
      (err, decoded) => {
        if (err) {
          logger.warn('Invalid token attempt');
          return res.status(403).json({
            success: false,
            message: 'Invalid or expired token'
          });
        }

        if (!decoded.isActive) {
          logger.warn('Inactive token attempt');
          return res.status(403).json({
            success: false,
            message: 'Account is deactivated'
          });
        }

        req.adminId = decoded.id;
        req.adminRole = decoded.role;
        next();
      }
    );
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

module.exports = authenticateToken;
