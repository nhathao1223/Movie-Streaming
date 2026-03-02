const { body, validationResult } = require('express-validator');

const createReviewValidation = [
  body('movieId')
    .notEmpty()
    .withMessage('Movie ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be 5-100 characters'),
  body('comment')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be 10-1000 characters')
];

const updateReviewValidation = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .optional()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be 5-100 characters'),
  body('comment')
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be 10-1000 characters')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  createReviewValidation,
  updateReviewValidation,
  validate
};
