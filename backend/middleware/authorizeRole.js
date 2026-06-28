const logger = require('../utils/logger');

const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    const role = req.adminRole;

    if (!role || !allowedRoles.includes(role)) {
      logger.warn(`Unauthorized access attempt by role: ${role || 'unknown'}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

module.exports = authorizeRole;
