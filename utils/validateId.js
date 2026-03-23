const mongoose = require('mongoose');
const { sendError } = require('./response');

/**
 * Middleware to validate MongoDB ObjectId parameters
 * @param {string} paramName - Name of the parameter to validate (default: 'id')
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id) {
      return sendError(res, `${paramName} parameter is required`, 400, 'MISSING_PARAMETER');
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, `Invalid ${paramName} format. Must be a valid MongoDB ObjectId (24 hex characters)`, 400, 'INVALID_ID');
    }

    next();
  };
};

/**
 * Check if a string is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean}
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Convert string to ObjectId if valid
 * @param {string} id - The ID to convert
 * @returns {mongoose.Types.ObjectId|null}
 */
const toObjectId = (id) => {
  if (isValidObjectId(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return null;
};

module.exports = {
  validateObjectId,
  isValidObjectId,
  toObjectId
};