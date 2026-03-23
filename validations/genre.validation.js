const { body, validationResult } = require('express-validator');

const createGenreValidation = [
  body('name')
    .notEmpty()
    .withMessage('Genre name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Genre name must be 2-50 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .trim()
];

const updateGenreValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Genre name must be 2-50 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .trim(),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation failed',
      errors: errors.array() 
    });
  }
  next();
};

module.exports = {
  createGenreValidation,
  updateGenreValidation,
  validate
};