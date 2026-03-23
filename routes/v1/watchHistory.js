const express = require('express');
const watchHistoryController = require('../../controllers/watchHistory.controller');
const { updateWatchProgressValidation, validate } = require('../../validations/watchHistory.validation');
const { validateObjectId } = require('../../utils/validateId');
const { createLimiter } = require('../../middleware/rateLimiter');
const auth = require('../../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     WatchHistory:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Watch history ID
 *         user:
 *           type: string
 *           description: User ID
 *         movie:
 *           $ref: '#/components/schemas/Movie'
 *         progress:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Watch progress percentage
 *         duration:
 *           type: number
 *           minimum: 0
 *           description: Duration watched in seconds
 *         watchedAt:
 *           type: string
 *           format: date-time
 *           description: Last watched time
 *         isCompleted:
 *           type: boolean
 *           description: Whether movie is completed (progress >= 90%)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/watch-history:
 *   get:
 *     summary: Get user's watch history
 *     tags: [Watch History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: watchedAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: User's watch history
 *       401:
 *         description: Authentication required
 *   post:
 *     summary: Update watch progress
 *     tags: [Watch History]
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
 *               - progress
 *             properties:
 *               movieId:
 *                 type: string
 *                 description: Movie ID
 *               progress:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Watch progress percentage
 *               duration:
 *                 type: number
 *                 minimum: 0
 *                 description: Duration watched in seconds
 *     responses:
 *       200:
 *         description: Watch progress updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Movie not found
 */

/**
 * @swagger
 * /api/v1/watch-history/continue-watching:
 *   get:
 *     summary: Get continue watching list (movies with progress < 90%)
 *     tags: [Watch History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items to return
 *     responses:
 *       200:
 *         description: Continue watching list
 *       401:
 *         description: Authentication required
 */

/**
 * @swagger
 * /api/v1/watch-history/completed:
 *   get:
 *     summary: Get completed movies (progress >= 90%)
 *     tags: [Watch History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Completed movies
 *       401:
 *         description: Authentication required
 */

/**
 * @swagger
 * /api/v1/watch-history/stats:
 *   get:
 *     summary: Get user's watch statistics
 *     tags: [Watch History]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Watch statistics
 *       401:
 *         description: Authentication required
 */

/**
 * @swagger
 * /api/v1/watch-history/{movieId}:
 *   get:
 *     summary: Get watch progress for specific movie
 *     tags: [Watch History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: Movie ID
 *     responses:
 *       200:
 *         description: Movie watch progress
 *       401:
 *         description: Authentication required
 *   delete:
 *     summary: Remove movie from watch history
 *     tags: [Watch History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: Movie ID
 *     responses:
 *       200:
 *         description: Movie removed from watch history
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Movie not found in watch history
 */

// All routes require authentication
router.use(auth);

// Watch history routes
router.get('/', watchHistoryController.getWatchHistory);
router.post('/', createLimiter, updateWatchProgressValidation, validate, watchHistoryController.updateWatchProgress);
router.get('/continue-watching', watchHistoryController.getContinueWatching);
router.get('/completed', watchHistoryController.getCompletedMovies);
router.get('/stats', watchHistoryController.getWatchStats);
router.get('/:movieId', validateObjectId('movieId'), watchHistoryController.getMovieProgress);
router.delete('/:movieId', validateObjectId('movieId'), watchHistoryController.removeFromHistory);

module.exports = router;