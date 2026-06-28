const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  logger.error(err.stack || err.message || err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
};
