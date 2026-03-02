const { body, validationResult } = require('express-validator');

const createMovieValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required'),
  body('description')
    .notEmpty()
    .withMessage('Description is required'),
  body('genre')
    .isArray()
    .withMessage('Genre must be an array'),
  body('director')
    .notEmpty()
    .withMessage('Director is required'),
  body('releaseYear')
    .isInt()
    .withMessage('Release year must be a number'),
  body('duration')
    .isInt()
    .withMessage('Duration must be a number')
];

const updateMovieValidation = [
  body('title').optional().notEmpty(),
  body('description').optional().notEmpty(),
  body('genre').optional().isArray(),
  body('director').optional().notEmpty(),
  body('releaseYear').optional().isInt(),
  body('duration').optional().isInt()
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  createMovieValidation,
  updateMovieValidation,
  validate
};
