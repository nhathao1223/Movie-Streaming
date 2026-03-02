const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  // Log error with context
  logger.error(`${err.name}: ${err.message} - ${req.method} ${req.originalUrl}`);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Invalid resource ID format';
    err.statusCode = 400;
    err.code = 'INVALID_ID';
    logger.warn(`CastError: Invalid ID format - ${req.originalUrl}`);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `${field} already exists`;
    err.statusCode = 400;
    err.code = 'DUPLICATE_FIELD';
    logger.warn(`Duplicate key error - ${field}`);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    logger.warn(`Validation error - ${JSON.stringify(messages)}`);
    
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: 'Validation failed',
        details: messages
      }
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    err.statusCode = 401;
    err.code = 'INVALID_TOKEN';
    err.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    err.statusCode = 401;
    err.code = 'TOKEN_EXPIRED';
    err.message = 'Token has expired';
  }

  // Send error response
  res.status(err.statusCode).json({
    success: false,
    error: {
      code: err.code || 'SERVER_ERROR',
      message: err.message || 'Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;