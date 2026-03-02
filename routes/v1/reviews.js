const express = require('express');
const reviewController = require('../../controllers/review.controller');
const { createReviewValidation, updateReviewValidation, validate } = require('../../validations/review.validation');
const { createLimiter } = require('../../middleware/rateLimiter');
const auth = require('../../middleware/auth');
const admin = require('../../middleware/admin');

const router = express.Router();

/**
 * @swagger
 * /api/v1/reviews:
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
 *     responses:
 *       201:
 *         description: Review created successfully
 */

/**
 * @swagger
 * /api/v1/reviews/user/my-reviews:
 *   get:
 *     summary: Get current user's reviews
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's reviews
 */

/**
 * @swagger
 * /api/v1/reviews/pending:
 *   get:
 *     summary: Get pending reviews (Admin only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending reviews
 */

/**
 * @swagger
 * /api/v1/reviews/movie/{movieId}:
 *   get:
 *     summary: Get all reviews for a movie
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie reviews with stats
 */

/**
 * @swagger
 * /api/v1/reviews/{id}:
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
 *     responses:
 *       200:
 *         description: Review updated successfully
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
 */

/**
 * @swagger
 * /api/v1/reviews/{id}/approve:
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
 */

router.post('/', createLimiter, auth, createReviewValidation, validate, reviewController.create);
router.get('/user/my-reviews', auth, reviewController.getMyReviews);
router.get('/pending', auth, admin, reviewController.getPending);
router.get('/movie/:movieId', reviewController.getByMovie);
router.put('/:id', auth, updateReviewValidation, validate, reviewController.update);
router.delete('/:id', auth, reviewController.delete);
router.put('/:id/approve', auth, admin, reviewController.approve);

module.exports = router;
