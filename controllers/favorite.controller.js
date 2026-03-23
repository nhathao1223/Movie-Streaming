const Favorite = require('../models/Favorite');
const Movie = require('../models/Movie');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../config/logger');
const mongoose = require('mongoose');

// Get user's favorites
exports.getFavorites = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const favorites = await Favorite.find({ user: req.user._id })
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
    
    // Filter out favorites with inactive movies
    const activeFavorites = favorites.filter(fav => fav.movie && fav.movie.isActive);
    
    const total = await Favorite.countDocuments({ user: req.user._id });
    
    logger.debug(`Retrieved ${activeFavorites.length} favorites for user ${req.user._id}`);
    
    sendSuccess(res, {
      favorites: activeFavorites,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error(`Get favorites error: ${error.message}`);
    sendError(res, 'Server error', 500);
  }
};

// Add movie to favorites
exports.addFavorite = async (req, res) => {
  try {
    const { movieId } = req.body;
    
    // Validate movieId format
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return sendError(res, 'Invalid movie ID format', 400);
    }
    
    // Check if movie exists and is active
    const movie = await Movie.findById(movieId);
    if (!movie || !movie.isActive) {
      return sendError(res, 'Movie not found', 404);
    }
    
    // Check if already in favorites
    const existingFavorite = await Favorite.findOne({
      user: req.user._id,
      movie: movieId
    });
    
    if (existingFavorite) {
      return sendError(res, 'Movie already in favorites', 400);
    }
    
    // Create favorite
    const favorite = new Favorite({
      user: req.user._id,
      movie: movieId
    });
    
    await favorite.save();
    
    // Populate movie data for response
    await favorite.populate({
      path: 'movie',
      select: 'title poster rating',
      populate: {
        path: 'genre',
        select: 'name'
      }
    });
    
    logger.info(`Movie ${movieId} added to favorites for user ${req.user._id}`);
    sendSuccess(res, favorite, 'Movie added to favorites', 201);
  } catch (error) {
    logger.error(`Add favorite error: ${error.message}`);
    if (error.code === 11000) {
      return sendError(res, 'Movie already in favorites', 400);
    }
    sendError(res, 'Server error', 500);
  }
};

// Remove movie from favorites
exports.removeFavorite = async (req, res) => {
  try {
    const { movieId } = req.params;
    
    // Validate movieId format
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return sendError(res, 'Invalid movie ID format', 400);
    }
    
    const favorite = await Favorite.findOneAndDelete({
      user: req.user._id,
      movie: movieId
    });
    
    if (!favorite) {
      return sendError(res, 'Movie not found in favorites', 404);
    }
    
    logger.info(`Movie ${movieId} removed from favorites for user ${req.user._id}`);
    sendSuccess(res, null, 'Movie removed from favorites');
  } catch (error) {
    logger.error(`Remove favorite error: ${error.message}`);
    sendError(res, 'Server error', 500);
  }
};

// Check if movie is in favorites
exports.checkFavorite = async (req, res) => {
  try {
    const { movieId } = req.params;
    
    // Validate movieId format
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return sendError(res, 'Invalid movie ID format', 400);
    }
    
    const favorite = await Favorite.findOne({
      user: req.user._id,
      movie: movieId
    });
    
    sendSuccess(res, {
      isFavorite: !!favorite,
      favoriteId: favorite?._id || null
    });
  } catch (error) {
    logger.error(`Check favorite error: ${error.message}`);
    sendError(res, 'Server error', 500);
  }
};

// Get favorite statistics for user
exports.getFavoriteStats = async (req, res) => {
  try {
    const totalFavorites = await Favorite.countDocuments({ user: req.user._id });
    
    // Get favorite genres
    const genreStats = await Favorite.aggregate([
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
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    sendSuccess(res, {
      totalFavorites,
      favoriteGenres: genreStats
    });
  } catch (error) {
    logger.error(`Get favorite stats error: ${error.message}`);
    sendError(res, 'Server error', 500);
  }
};