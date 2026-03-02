const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Movie = require('../models/Movie');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a review for a movie
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movieId
 *               - rating
 *               - title
 *               - comment
 *             properties:
 *               movieId:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               title:
 *                 type: string
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Validation error or user already reviewed
 *       404:
 *         description: Movie not found
 */

/**
 * @swagger
 * /api/reviews/user/my-reviews:
 *   get:
 *     summary: Get current user's reviews
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's reviews
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/reviews/pending:
 *   get:
 *     summary: Get pending reviews (Admin only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending reviews
 *       403:
 *         description: Forbidden (Admin only)
 */

/**
 * @swagger
 * /api/reviews/movie/{movieId}:
 *   get:
 *     summary: Get all reviews for a movie
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *     responses:
 *       200:
 *         description: Movie reviews with stats
 */

/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     summary: Update a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               title:
 *                 type: string
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Review not found
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Review not found
 */

/**
 * @swagger
 * /api/reviews/{id}/approve:
 *   put:
 *     summary: Approve a review (Admin only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review approved
 *       403:
 *         description: Forbidden (Admin only)
 */

// @route   POST /api/reviews
// @desc    Create a review for a movie
// @access  Private
router.post('/', auth, [
  body('movieId').notEmpty().withMessage('Movie ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').isLength({ min: 5, max: 100 }).withMessage('Title must be 5-100 characters'),
  body('comment').isLength({ min: 10, max: 1000 }).withMessage('Comment must be 10-1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { movieId, rating, title, comment } = req.body;

    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Check if user already reviewed this movie
    const existingReview = await Review.findOne({
      movie: movieId,
      user: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You already reviewed this movie' });
    }

    // Create review
    const review = new Review({
      movie: movieId,
      user: req.user._id,
      rating,
      title,
      comment
    });

    await review.save();
    await review.populate('user', 'username');

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reviews/user/my-reviews
// @desc    Get current user's reviews
// @access  Private
router.get('/user/my-reviews', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('movie', 'title poster')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reviews/pending
// @desc    Get pending reviews (Admin only)
// @access  Private/Admin
router.get('/pending', auth, admin, async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: false })
      .populate('user', 'username')
      .populate('movie', 'title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reviews/movie/:movieId
// @desc    Get all reviews for a movie
// @access  Public
router.get('/movie/:movieId', async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({
      movie: req.params.movieId,
      isApproved: true
    })
    .populate('user', 'username')
    .sort({ [sortBy]: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Review.countDocuments({
      movie: req.params.movieId,
      isApproved: true
    });

    // Calculate average rating
    const ratingStats = await Review.aggregate([
      { $match: { movie: mongoose.Types.ObjectId(req.params.movieId), isApproved: true } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: reviews,
      stats: ratingStats[0] || { avgRating: 0, totalReviews: 0 },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private
router.put('/:id', auth, [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').optional().isLength({ min: 5, max: 100 }).withMessage('Title must be 5-100 characters'),
  body('comment').optional().isLength({ min: 10, max: 1000 }).withMessage('Comment must be 10-1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    // Update review
    review = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'username');

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review or is admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Review deleted'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/reviews/:id/approve
// @desc    Approve a review (Admin only)
// @access  Private/Admin
router.put('/:id/approve', auth, admin, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).populate('user', 'username');

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;