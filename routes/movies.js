const express = require('express');
const Movie = require('../models/Movie');
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// @route   GET /api/movies/stats
// @desc    Get movie statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const totalMovies = await Movie.countDocuments({ isActive: true });
    const totalViews = await Movie.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
    ]);

    const genreStats = await Movie.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$genre' },
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const yearStats = await Movie.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$releaseYear', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        totalMovies,
        totalViews: totalViews[0]?.totalViews || 0,
        genreDistribution: genreStats,
        yearDistribution: yearStats
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/movies/popular
// @desc    Get popular movies (most viewed)
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const movies = await Movie.find({ isActive: true })
      .sort({ viewCount: -1, rating: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: movies
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/movies/trending
// @desc    Get trending movies (most viewed in last 7 days)
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // For now, use viewCount as proxy for trending
    // In production, you'd track views with timestamps
    const movies = await Movie.find({ 
      isActive: true,
      createdAt: { $gte: sevenDaysAgo }
    })
    .sort({ viewCount: -1, rating: -1 })
    .limit(parseInt(limit));

    res.json({
      success: true,
      data: movies
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/movies/top-rated
// @desc    Get top rated movies
// @access  Public
router.get('/top-rated', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const movies = await Movie.find({ isActive: true })
      .sort({ rating: -1, viewCount: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: movies
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/movies
// @desc    Get all movies with search, filter, sort, pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      search,
      genre,
      year,
      minRating,
      maxRating,
      minDuration,
      maxDuration,
      director,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    let query = { isActive: true };

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by genre
    if (genre) {
      query.genre = { $in: [genre] };
    }

    // Filter by year
    if (year) {
      query.releaseYear = parseInt(year);
    }

    // Filter by rating range
    if (minRating || maxRating) {
      query.rating = {};
      if (minRating) query.rating.$gte = parseFloat(minRating);
      if (maxRating) query.rating.$lte = parseFloat(maxRating);
    }

    // Filter by duration range
    if (minDuration || maxDuration) {
      query.duration = {};
      if (minDuration) query.duration.$gte = parseInt(minDuration);
      if (maxDuration) query.duration.$lte = parseInt(maxDuration);
    }

    // Filter by director
    if (director) {
      query.director = { $regex: director, $options: 'i' };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const movies = await Movie.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Movie.countDocuments(query);

    res.json({
      success: true,
      data: movies,
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

// @route   POST /api/movies
// @desc    Create movie (Admin only)
// @access  Private/Admin
router.post('/', auth, admin, async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();

    res.status(201).json({
      success: true,
      data: movie
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/movies/:id
// @desc    Get single movie
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie || !movie.isActive) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json({
      success: true,
      data: movie
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/movies/:id
// @desc    Update movie (Admin only)
// @access  Private/Admin
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json({
      success: true,
      data: movie
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/movies/:id
// @desc    Delete movie (soft delete - Admin only)
// @access  Private/Admin
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json({
      success: true,
      message: 'Movie deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/movies/:id/view
// @desc    Increment view count
// @access  Private
router.put('/:id/view', auth, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Add to user's watch history
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: { watchHistory: { movie: req.params.id } }
      }
    );

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: { 
          watchHistory: { 
            movie: req.params.id,
            watchedAt: new Date()
          }
        }
      }
    );

    res.json({
      success: true,
      data: movie
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;