const WatchHistory = require('../models/WatchHistory');
const Movie = require('../models/Movie');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../config/logger');
const mongoose = require('mongoose');

// Get user's watch history
exports.getWatchHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'watchedAt', sortOrder = 'desc' } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const watchHistory = await WatchHistory.find({ user: req.user._id })
      .populate({
        path: 'movie',
        select: 'title description genre releaseYear duration director cast rating poster viewCount isActive',
        populate: {
          path: 'genre',
          select: 'name slug'
        }
      })
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Filter out history with inactive movies
    const activeHistory = watchHistory.filter(history => history.movie && history.movie.isActive);
    
    const total = await WatchHistory.countDocuments({ user: req.user._id });
    
    logger.debug(`Retrieved ${activeHistory.length} watch history items for user ${req.user._id}`);
    
    sendSuccess(res, {
      watchHistory: activeHistory,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error(`Get watch history error: ${error.message}`);
    sendError(res, 'Server error', 500);
  }
};

// Add or update watch progress
exports.updateWatchProgress = async (req, res) => {
  try {
    const { movieId, progress, duration } = req.body;
    
    // Validate movieId format
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return sendError(res, 'Invalid movie ID format', 400);
    }
    
    // Validate progress
    if (progress < 0 || progress > 100) {
      return sendError(res, 'Progress must be between 0 and 100', 400);
    }
    
    // Check if movie exists and is active
    const movie = await Movie.findById(movieId);
    if (!movie || !movie.isActive) {
      return sendError(res, 'Movie not found', 404);
    }
    
    // Find existing watch history or create new one
    let watchHistory = await WatchHistory.findOne({
      user: req.user._id,
      movie: movieId
    });
    
    if (watchHistory) {
      // Update existing record
      watchHistory.progress = progress;
      watchHistory.duration = duration || watchHistory.duration;
      watchHistory.watchedAt = new Date();
      watchHistory.isCompleted = progress >= 90;
    } else {
      // Create new record
      watchHistory = new WatchHistory({
        user: req.user._id,
        movie: movieId,
        progress,
        duration: duration || 0,
        watchedAt: new Date(),
        isCompleted: progress >= 90
      });
    }
    
    await watchHistory.save();
    
    // Populate movie data for response
    await watchHistory.populate({
      path: 'movie',
      select: 'title poster duration',
      populate: {
        path: 'genre',
        select: 'name'
      }
    });
    
    logger.info(`Watch progress updated for user ${req.user._id}, movie ${movieId}: ${progress}%`);
    sendSuccess(res, watchHistory, 'Watch progress updated');
  } catch (error) {
    logger.error(`Update watch progress error: ${error.message}`);
    sendError(res, 'Server error', 500);
  }
};

// Get watch progress for a specific movie
exports.getMovieProgress = async (req, res) => {
  try {
    const { movieId } = req.params;
    
    // Validate movieId format
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return sendError(res, 'Invalid movie ID format', 400);
    }
    
    const watchHistory = await WatchHistory.findOne({
      user: req.user._id,
      movie: movieId
    }).populate('movie', 'title duration');
    
    if (!watchHistory) {
      return sendSuccess(res, {
        progress: 0,
        duration: 0,
        isCompleted: false,
        watchedAt: null
      });
    }
    
    sendSuccess(res, {
      progress: watchHistory.progress,
      duration: watchHistory.duration,
      isCompleted: watchHistory.isCompleted,
      watchedAt: watchHistory.watchedAt,
      movie: watchHistory.movie
    });
  } catch (error) {
    logger.error(`Get movie progress error: ${error.message}`);
    sendError(res, 'Server error', 500);
  }
};

// Get continue watching list (movies with progress < 90%)
exports.getContinueWatching = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const continueWatching = await WatchHistory.find({
      user: req.user._id,
      progress: { $gt: 0, $lt: 90 }
    })
    .populate({
      path: 'movie',
      select: 'title description genre releaseYear duration director cast rating poster viewCount isActive',
      populate: {
        path: 'genre',
        select: 'name slug'
      }
    })
    .sort({ watchedAt: -1 })
    .limit(parseInt(limit));
    
    // Filter out history with inactive movies
    const activeContinueWatching = continueWatching.filter(history => history.movie && history.movie.isActive);
    
    logger.debug(`Retrieved ${activeContinueWatching.length} continue watching items for user ${req.user._id}`);
    sendSuccess(res, activeContinueWatching);
  } catch (error) {
    logger.error(`Get continue watching error: ${error.message}`);
    sendError(res, 'Server error', 500);
  }
};

// Get completed movies
exports.getCompletedMovies = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const completedMovies = await WatchHistory.find({
      user: req.user._id,
      isCompleted: true
    })
    .populate({
      path: 'movie',
      select: 'title description genre releaseYear duration director cast rating poster viewCount isActive',
      populate: {
        path: 'genre',
        select: 'name slug'
      }
    })
    .sort({ watchedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
    
    // Filter out history with inactive movies
    const activeCompletedMovies = completedMovies.filter(history => history.movie && history.movie.isActive);
    
    const total = await WatchHistory.countDocuments({
      user: req.user._id,
      isCompleted: true
    });
    
    sendSuccess(res, {
      completedMovies: activeCompletedMovies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error(`Get completed movies error: ${error.message}`);
    sendError(res, 'Server error', 500);
  }
};

// Get watch statistics for user
exports.getWatchStats = async (req, res) => {
  try {
    const totalWatched = await WatchHistory.countDocuments({ user: req.user._id });
    const completedMovies = await WatchHistory.countDocuments({ 
      user: req.user._id, 
      isCompleted: true 
    });
    
    // Calculate total watch time
    const watchTimeStats = await WatchHistory.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user._id) } },
      {
        $group: {
          _id: null,
          totalWatchTime: { $sum: '$duration' }
        }
      }
    ]);
    
    const totalWatchTime = watchTimeStats[0]?.totalWatchTime || 0;
    
    // Get favorite genres from watch history
    const genreStats = await WatchHistory.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user._id) } },
      {
        $lookup: {
          from: 'movies',
          localField: 'movie',
          foreignField: '_id',
          as: 'movieData'
        }
      },
      { $unwind: '$movieData' },
      { $unwind: '$movieData.genre' },
      {
        $lookup: {
          from: 'genres',
          localField: 'movieData.genre',
          foreignField: '_id',
          as: 'genreData'
        }
      },
      { $unwind: '$genreData' },
      {
        $group: {
          _id: '$genreData._id',
          name: { $first: '$genreData.name' },
          count: { $sum: 1 },
          totalWatchTime: { $sum: '$duration' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    sendSuccess(res, {
      totalWatched,
      completedMovies,
      totalWatchTime: Math.round(totalWatchTime / 60), // Convert to minutes
      favoriteGenres: genreStats
    });
  } catch (error) {
    logger.error(`Get watch stats error: ${error.message}`);
    sendError(res, 'Server error', 500);
  }
};

// Remove movie from watch history
exports.removeFromHistory = async (req, res) => {
  try {
    const { movieId } = req.params;
    
    // Validate movieId format
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return sendError(res, 'Invalid movie ID format', 400);
    }
    
    const watchHistory = await WatchHistory.findOneAndDelete({
      user: req.user._id,
      movie: movieId
    });
    
    if (!watchHistory) {
      return sendError(res, 'Movie not found in watch history', 404);
    }
    
    logger.info(`Movie ${movieId} removed from watch history for user ${req.user._id}`);
    sendSuccess(res, null, 'Movie removed from watch history');
  } catch (error) {
    logger.error(`Remove from history error: ${error.message}`);
    sendError(res, 'Server error', 500);
  }
};