const Movie = require('../models/Movie');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../config/logger');

exports.getStats = async (req, res) => {
  try {
    logger.debug('Fetching movie statistics');
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

    sendSuccess(res, {
      totalMovies,
      totalViews: totalViews[0]?.totalViews || 0,
      genreDistribution: genreStats
    });
  } catch (error) {
    logger.error(`Get stats error: ${error.message}`);
    sendError(res, 'Server error', 500);
  }
};

exports.create = async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    logger.info(`Movie created: ${movie._id} - ${movie.title}`);
    sendSuccess(res, movie, 'Movie created', 201);
  } catch (error) {
    logger.error(`Create movie error: ${error.message}`);
    sendError(res, 'Server error', 500);
  }
};

exports.update = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!movie) {
      logger.warn(`Update movie failed: Movie not found - ${req.params.id}`);
      return sendError(res, 'Movie not found', 404);
    }

    logger.info(`Movie updated: ${movie._id}`);
    sendSuccess(res, movie, 'Movie updated');
  } catch (error) {
    logger.error(`Update movie error: ${error.message}`);
    sendError(res, 'Server error', 500);
  }
};

exports.delete = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!movie) {
      logger.warn(`Delete movie failed: Movie not found - ${req.params.id}`);
      return sendError(res, 'Movie not found', 404);
    }

    logger.info(`Movie deleted: ${movie._id}`);
    sendSuccess(res, null, 'Movie deleted');
  } catch (error) {
    logger.error(`Delete movie error: ${error.message}`);
    sendError(res, 'Server error', 500);
  }
};

exports.getPopular = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const movies = await Movie.find({ isActive: true })
      .sort({ viewCount: -1, rating: -1 })
      .limit(parseInt(limit));

    sendSuccess(res, movies);
  } catch (error) {
    sendError(res, 'Server error', 500);
  }
};

exports.getTrending = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const movies = await Movie.find({ 
      isActive: true,
      createdAt: { $gte: sevenDaysAgo }
    })
    .sort({ viewCount: -1, rating: -1 })
    .limit(parseInt(limit));

    sendSuccess(res, movies);
  } catch (error) {
    sendError(res, 'Server error', 500);
  }
};

exports.getTopRated = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const movies = await Movie.find({ isActive: true })
      .sort({ rating: -1, viewCount: -1 })
      .limit(parseInt(limit));

    sendSuccess(res, movies);
  } catch (error) {
    sendError(res, 'Server error', 500);
  }
};

exports.getAll = async (req, res) => {
  try {
    const {
      search, genre, year, minRating, maxRating,
      minDuration, maxDuration, director,
      sortBy = 'createdAt', sortOrder = 'desc',
      page = 1, limit = 10
    } = req.query;

    let query = { isActive: true };

    if (search) query.$text = { $search: search };
    if (genre) query.genre = { $in: [genre] };
    if (year) query.releaseYear = parseInt(year);
    if (minRating || maxRating) {
      query.rating = {};
      if (minRating) query.rating.$gte = parseFloat(minRating);
      if (maxRating) query.rating.$lte = parseFloat(maxRating);
    }
    if (minDuration || maxDuration) {
      query.duration = {};
      if (minDuration) query.duration.$gte = parseInt(minDuration);
      if (maxDuration) query.duration.$lte = parseInt(maxDuration);
    }
    if (director) query.director = { $regex: director, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const movies = await Movie.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Movie.countDocuments(query);

    sendSuccess(res, {
      movies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    sendError(res, 'Server error', 500);
  }
};

exports.getById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie || !movie.isActive) {
      return sendError(res, 'Movie not found', 404);
    }

    sendSuccess(res, movie);
  } catch (error) {
    sendError(res, 'Server error', 500);
  }
};

exports.create = async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    sendSuccess(res, movie, 'Movie created', 201);
  } catch (error) {
    sendError(res, 'Server error', 500);
  }
};

exports.update = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!movie) {
      return sendError(res, 'Movie not found', 404);
    }

    sendSuccess(res, movie, 'Movie updated');
  } catch (error) {
    sendError(res, 'Server error', 500);
  }
};

exports.delete = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!movie) {
      return sendError(res, 'Movie not found', 404);
    }

    sendSuccess(res, null, 'Movie deleted');
  } catch (error) {
    sendError(res, 'Server error', 500);
  }
};

exports.incrementView = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!movie) {
      return sendError(res, 'Movie not found', 404);
    }

    sendSuccess(res, movie, 'View count incremented');
  } catch (error) {
    sendError(res, 'Server error', 500);
  }
};
