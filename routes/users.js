const express = require('express');
const User = require('../models/User');
const Movie = require('../models/Movie');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile with stats
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile with statistics
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/users/watch-history:
 *   get:
 *     summary: Get user's watch history
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's watch history
 *       401:
 *         description: Unauthorized
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
 *       404:
 *         description: Movie not found
 */

/**
 * @swagger
 * /api/users/watch-history/{movieId}:
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
 * /api/users/favorites:
 *   get:
 *     summary: Get user's favorite movies
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's favorite movies
 *       401:
 *         description: Unauthorized
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
 *       404:
 *         description: Movie not found
 */

/**
 * @swagger
 * /api/users/recommendations:
 *   get:
 *     summary: Get personalized movie recommendations
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Personalized recommendations
 *       401:
 *         description: Unauthorized
 */

// @route   POST /api/users/watch-history
// @desc    Add movie to watch history
// @access  Private
router.post('/watch-history', auth, async (req, res) => {
  try {
    const { movieId } = req.body;

    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Add to watch history (remove if already exists to avoid duplicates)
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: { watchHistory: { movie: movieId } },
      }
    );

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: { 
          watchHistory: { 
            movie: movieId,
            watchedAt: new Date()
          }
        }
      }
    );

    res.json({
      success: true,
      message: 'Added to watch history'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/profile
// @desc    Get user profile with stats
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('favorites', 'title poster rating')
      .populate('watchHistory.movie', 'title poster rating')
      .select('-password');

    // Calculate user stats
    const totalWatched = user.watchHistory.length;
    const totalFavorites = user.favorites.length;
    
    // Get favorite genres
    const favoriteGenres = {};
    user.watchHistory.forEach(item => {
      if (item.movie && item.movie.genre) {
        item.movie.genre.forEach(genre => {
          favoriteGenres[genre] = (favoriteGenres[genre] || 0) + 1;
        });
      }
    });

    const topGenres = Object.keys(favoriteGenres)
      .sort((a, b) => favoriteGenres[b] - favoriteGenres[a])
      .slice(0, 3);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt
        },
        stats: {
          totalWatched,
          totalFavorites,
          topGenres
        },
        recentWatched: user.watchHistory.slice(0, 5),
        favorites: user.favorites.slice(0, 5)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/watch-history/:movieId
// @desc    Remove movie from watch history
// @access  Private
router.delete('/watch-history/:movieId', auth, async (req, res) => {
  try {
    const { movieId } = req.params;

    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { watchHistory: { movie: movieId } } }
    );

    res.json({
      success: true,
      message: 'Removed from watch history'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/watch-history
// @desc    Get user's watch history
// @access  Private
router.get('/watch-history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('watchHistory.movie')
      .sort({ 'watchHistory.watchedAt': -1 });

    res.json({
      success: true,
      data: user.watchHistory
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/favorites
// @desc    Add/remove movie from favorites
// @access  Private
router.post('/favorites', auth, async (req, res) => {
  try {
    const { movieId } = req.body;

    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const user = await User.findById(req.user._id);
    const isFavorite = user.favorites.includes(movieId);

    if (isFavorite) {
      // Remove from favorites
      await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { favorites: movieId } }
      );
      res.json({
        success: true,
        message: 'Removed from favorites'
      });
    } else {
      // Add to favorites
      await User.findByIdAndUpdate(
        req.user._id,
        { $push: { favorites: movieId } }
      );
      res.json({
        success: true,
        message: 'Added to favorites'
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/favorites
// @desc    Get user's favorite movies
// @access  Private
router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');

    res.json({
      success: true,
      data: user.favorites
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/recommendations
// @desc    Get movie recommendations based on user behavior
// @access  Private
router.get('/recommendations', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('watchHistory.movie')
      .populate('favorites');

    // Get genres from watch history and favorites
    const watchedGenres = [];
    const favoriteGenres = [];

    user.watchHistory.forEach(item => {
      if (item.movie && item.movie.genre) {
        watchedGenres.push(...item.movie.genre);
      }
    });

    user.favorites.forEach(movie => {
      if (movie.genre) {
        favoriteGenres.push(...movie.genre);
      }
    });

    // Combine and count genre preferences
    const allGenres = [...watchedGenres, ...favoriteGenres];
    const genreCount = {};
    allGenres.forEach(genre => {
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    });

    // Get top 3 preferred genres
    const topGenres = Object.keys(genreCount)
      .sort((a, b) => genreCount[b] - genreCount[a])
      .slice(0, 3);

    // Get watched movie IDs to exclude from recommendations
    const watchedMovieIds = user.watchHistory.map(item => item.movie._id);
    const favoriteMovieIds = user.favorites.map(movie => movie._id);
    const excludeIds = [...watchedMovieIds, ...favoriteMovieIds];

    // Find recommendations
    const recommendations = await Movie.find({
      genre: { $in: topGenres },
      _id: { $nin: excludeIds },
      isActive: true
    })
    .sort({ rating: -1, viewCount: -1 })
    .limit(10);

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;