const express = require('express');
const favoriteController = require('../../controllers/favorite.controller');
const { addFavoriteValidation, validate } = require('../../validations/favorite.validation');
const { validateObjectId } = require('../../utils/validateId');
const { createLimiter } = require('../../middleware/rateLimiter');
const auth = require('../../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Favorite:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Favorite ID
 *         user:
 *           type: string
 *           description: User ID
 *         movie:
 *           $ref: '#/components/schemas/Movie'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/favorites:
 *   get:
 *     summary: Get user's favorite movies
 *     tags: [Favorites]
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
 *           default: createdAt
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
 *         description: User's favorite movies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     favorites:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Favorite'
 *                     pagination:
 *                       type: object
 *       401:
 *         description: Authentication required
 *   post:
 *     summary: Add movie to favorites
 *     tags: [Favorites]
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
 *             properties:
 *               movieId:
 *                 type: string
 *                 description: Movie ID to add to favorites
 *     responses:
 *       201:
 *         description: Movie added to favorites
 *       400:
 *         description: Movie already in favorites or validation error
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Movie not found
 */

/**
 * @swagger
 * /api/v1/favorites/stats:
 *   get:
 *     summary: Get user's favorite statistics
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favorite statistics
 *       401:
 *         description: Authentication required
 */

/**
 * @swagger
 * /api/v1/favorites/{movieId}:
 *   get:
 *     summary: Check if movie is in favorites
 *     tags: [Favorites]
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
 *         description: Favorite status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     isFavorite:
 *                       type: boolean
 *                     favoriteId:
 *                       type: string
 *       401:
 *         description: Authentication required
 *   delete:
 *     summary: Remove movie from favorites
 *     tags: [Favorites]
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
 *         description: Movie removed from favorites
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Movie not found in favorites
 */

// All routes require authentication
router.use(auth);

// Favorite routes
router.get('/', favoriteController.getFavorites);
router.post('/', createLimiter, addFavoriteValidation, validate, favoriteController.addFavorite);
router.get('/stats', favoriteController.getFavoriteStats);
router.get('/:movieId', validateObjectId('movieId'), favoriteController.checkFavorite);
router.delete('/:movieId', validateObjectId('movieId'), favoriteController.removeFavorite);

module.exports = router;