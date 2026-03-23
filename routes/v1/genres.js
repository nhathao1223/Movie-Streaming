const express = require('express');
const genreController = require('../../controllers/genre.controller');
const { createGenreValidation, updateGenreValidation, validate } = require('../../validations/genre.validation');
const { validateObjectId } = require('../../utils/validateId');
const { createLimiter } = require('../../middleware/rateLimiter');
const auth = require('../../middleware/auth');
const admin = require('../../middleware/admin');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Genre:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: Genre ID
 *         name:
 *           type: string
 *           description: Genre name
 *         slug:
 *           type: string
 *           description: URL-friendly genre name
 *         description:
 *           type: string
 *           description: Genre description
 *         isActive:
 *           type: boolean
 *           description: Whether genre is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/genres:
 *   get:
 *     summary: Get all genres
 *     tags: [Genres]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search genres by name or description
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: [true, false, all]
 *           default: true
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of genres
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Genre'
 *   post:
 *     summary: Create new genre (Admin only)
 *     tags: [Genres]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               description:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Genre created successfully
 *       400:
 *         description: Validation error or genre already exists
 *       403:
 *         description: Admin access required
 */

/**
 * @swagger
 * /api/v1/genres/stats:
 *   get:
 *     summary: Get genre statistics (Admin only)
 *     tags: [Genres]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Genre statistics
 *       403:
 *         description: Admin access required
 */

/**
 * @swagger
 * /api/v1/genres/slug/{slug}:
 *   get:
 *     summary: Get genre by slug
 *     tags: [Genres]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Genre slug
 *     responses:
 *       200:
 *         description: Genre details
 *       404:
 *         description: Genre not found
 */

/**
 * @swagger
 * /api/v1/genres/{id}:
 *   get:
 *     summary: Get genre by ID
 *     tags: [Genres]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Genre ID
 *     responses:
 *       200:
 *         description: Genre details
 *       404:
 *         description: Genre not found
 *   put:
 *     summary: Update genre (Admin only)
 *     tags: [Genres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Genre ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Genre updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Genre not found
 *   delete:
 *     summary: Delete genre (Admin only)
 *     tags: [Genres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Genre ID
 *     responses:
 *       200:
 *         description: Genre deleted successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Genre not found
 */

// Public routes
router.get('/', genreController.getAll);
router.get('/slug/:slug', genreController.getBySlug);
router.get('/:id', validateObjectId('id'), genreController.getById);

// Admin routes  
router.get('/admin/stats', auth, admin, genreController.getStats);
router.post('/', createLimiter, auth, admin, createGenreValidation, validate, genreController.create);
router.put('/:id', auth, admin, validateObjectId('id'), updateGenreValidation, validate, genreController.update);
router.delete('/:id', auth, admin, validateObjectId('id'), genreController.delete);

module.exports = router;