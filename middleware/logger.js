const logger = require('../config/logger');

// HTTP request logging middleware
const httpLogger = (req, res, next) => {
  const start = Date.now();

  // Log request
  logger.http(`${req.method} ${req.originalUrl}`);

  // Log response when it's sent
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(
      `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};

// Error logging
const errorLogger = (err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl}`);
  next(err);
};

module.exports = {
  httpLogger,
  errorLogger
};
