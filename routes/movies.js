const express = require('express');
const movieController = require('../controllers/movie.controller');
const { createMovieValidation, updateMovieValidation, validate } = require('../validations/movie.validation');
const { createLimiter } = require('../middleware/rateLimiter');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

/**
 * @swagger
 * /api/movies/stats:
 *   get:
 *     summary: Get movie statistics
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: Movie statistics
 */

/**
 * @swagger
 * /api/movies/popular:
 *   get:
 *     summary: Get popular movies (most viewed)
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of popular movies
 */

/**
 * @swagger
 * /api/movies/trending:
 *   get:
 *     summary: Get trending movies (last 7 days)
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of trending movies
 */

/**
 * @swagger
 * /api/movies/top-rated:
 *   get:
 *     summary: Get top rated movies
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of top rated movies
 */

/**
 * @swagger
 * /api/movies:
 *   get:
 *     summary: Get all movies with search, filter, sort, pagination
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: number
 *       - in: query
 *         name: minDuration
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxDuration
 *         schema:
 *           type: integer
 *       - in: query
 *         name: director
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
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
 *     responses:
 *       200:
 *         description: List of movies with pagination
 *   post:
 *     summary: Create new movie (Admin only)
 *     tags: [Movies]
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
 *         description: Movie created successfully
 */

/**
 * @swagger
 * /api/movies/{id}:
 *   get:
 *     summary: Get single movie
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie details
 *   put:
 *     summary: Update movie (Admin only)
 *     tags: [Movies]
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
 *         description: Movie updated successfully
 *   delete:
 *     summary: Delete movie (Admin only)
 *     tags: [Movies]
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
 *         description: Movie deleted successfully
 */

/**
 * @swagger
 * /api/movies/{id}/view:
 *   put:
 *     summary: Increment view count
 *     tags: [Movies]
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
 *         description: View count incremented
 */

router.get('/stats', movieController.getStats);
router.get('/popular', movieController.getPopular);
router.get('/trending', movieController.getTrending);
router.get('/top-rated', movieController.getTopRated);
router.get('/', movieController.getAll);
router.post('/', createLimiter, auth, admin, createMovieValidation, validate, movieController.create);
router.get('/:id', movieController.getById);
router.put('/:id', auth, admin, updateMovieValidation, validate, movieController.update);
router.delete('/:id', auth, admin, movieController.delete);
router.put('/:id/view', auth, movieController.incrementView);

module.exports = router;