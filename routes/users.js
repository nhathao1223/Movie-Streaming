const express = require('express');
const User = require('../models/User');
const Movie = require('../models/Movie');
const auth = require('../middleware/auth');

const router = express.Router();

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