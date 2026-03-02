const express = require('express');
const userController = require('../../controllers/user.controller');
const auth = require('../../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     summary: Get user profile with stats
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile with statistics
 */

/**
 * @swagger
 * /api/v1/users/watch-history:
 *   get:
 *     summary: Get user's watch history
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's watch history
 *   post:
 *     summary: Add movie to watch history
 *     tags: [Users]
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
 *     responses:
 *       200:
 *         description: Added to watch history
 */

/**
 * @swagger
 * /api/v1/users/watch-history/{movieId}:
 *   delete:
 *     summary: Remove movie from watch history
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Removed from watch history
 */

/**
 * @swagger
 * /api/v1/users/favorites:
 *   get:
 *     summary: Get user's favorite movies
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's favorite movies
 *   post:
 *     summary: Add/remove movie from favorites
 *     tags: [Users]
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
 *     responses:
 *       200:
 *         description: Added/removed from favorites
 */

/**
 * @swagger
 * /api/v1/users/recommendations:
 *   get:
 *     summary: Get personalized movie recommendations
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Personalized recommendations
 */

router.get('/profile', auth, userController.getProfile);
router.post('/watch-history', auth, userController.addWatchHistory);
router.get('/watch-history', auth, userController.getWatchHistory);
router.delete('/watch-history/:movieId', auth, userController.removeWatchHistory);
router.post('/favorites', auth, userController.toggleFavorite);
router.get('/favorites', auth, userController.getFavorites);
router.get('/recommendations', auth, userController.getRecommendations);

module.exports = router;
