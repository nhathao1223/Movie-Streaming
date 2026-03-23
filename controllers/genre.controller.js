const Genre = require('../models/Genre');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../config/logger');
const mongoose = require('mongoose');

// Get all genres
exports.getAll = async (req, res) => {
  try {
    const { search, isActive = true } = req.query;
    
    let query = {};
    
    // Filter by active status
    if (isActive !== 'all') {
      query.isActive = isActive === 'true';
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const genres = await Genre.find(query)
      .sort({ name: 1 })
      .select('name slug description isActive createdAt');
    
    logger.debug(`Retrieved ${genres.length} genres`);
    sendSuccess(res, genres);
  } catch (error) {
    logger.error(`Get genres error: ${error.message}`);
    sendError(res, 'Server error', 500);
  }
};

// Get single genre
exports.getById = async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 'Invalid genre ID format', 400);
    }
    
    const genre = await Genre.findById(req.params.id);
    
    if (!genre) {
      return sendError(res, 'Genre not found', 404);
    }
    
    logger.debug(`Genre retrieved: ${genre._id}`);
    sendSuccess(res, genre);
  } catch (error) {
    logger.error(`Get genre by ID error: ${error.message}`);
    sendError(res, 'Server error', 500);
  }
};

// Get genre by slug
exports.getBySlug = async (req, res) => {
  try {
    const genre = await Genre.findOne({ 
      slug: req.params.slug,
      isActive: true 
    });
    
    if (!genre) {
      return sendError(res, 'Genre not found', 404);
    }
    
    logger.debug(`Genre retrieved by slug: ${genre.slug}`);
    sendSuccess(res, genre);
  } catch (error) {
    logger.error(`Get genre by slug error: ${error.message}`);
    sendError(res, 'Server error', 500);
  }
};

// Create genre (Admin only)
exports.create = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Check if genre already exists
    const existingGenre = await Genre.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    
    if (existingGenre) {
      return sendError(res, 'Genre already exists', 400);
    }
    
    const genre = new Genre({
      name,
      description
    });
    
    await genre.save();
    
    logger.info(`Genre created: ${genre._id} - ${genre.name}`);
    sendSuccess(res, genre, 'Genre created successfully', 201);
  } catch (error) {
    logger.error(`Create genre error: ${error.message}`);
    if (error.code === 11000) {
      return sendError(res, 'Genre name already exists', 400);
    }
    sendError(res, 'Server error', 500);
  }
};

// Update genre (Admin only)
exports.update = async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 'Invalid genre ID format', 400);
    }
    
    const { name, description, isActive } = req.body;
    
    // Check if new name conflicts with existing genre
    if (name) {
      const existingGenre = await Genre.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      
      if (existingGenre) {
        return sendError(res, 'Genre name already exists', 400);
      }
    }
    
    const genre = await Genre.findByIdAndUpdate(
      req.params.id,
      { name, description, isActive },
      { new: true, runValidators: true }
    );
    
    if (!genre) {
      return sendError(res, 'Genre not found', 404);
    }
    
    logger.info(`Genre updated: ${genre._id}`);
    sendSuccess(res, genre, 'Genre updated successfully');
  } catch (error) {
    logger.error(`Update genre error: ${error.message}`);
    if (error.code === 11000) {
      return sendError(res, 'Genre name already exists', 400);
    }
    sendError(res, 'Server error', 500);
  }
};

// Delete genre (Admin only)
exports.delete = async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 'Invalid genre ID format', 400);
    }
    
    // Soft delete - set isActive to false
    const genre = await Genre.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!genre) {
      return sendError(res, 'Genre not found', 404);
    }
    
    logger.info(`Genre deleted: ${genre._id}`);
    sendSuccess(res, null, 'Genre deleted successfully');
  } catch (error) {
    logger.error(`Delete genre error: ${error.message}`);
    sendError(res, 'Server error', 500);
  }
};

// Get genre statistics (Admin only)
exports.getStats = async (req, res) => {
  try {
    const Movie = require('../models/Movie');
    
    const stats = await Genre.aggregate([
      {
        $lookup: {
          from: 'movies',
          localField: '_id',
          foreignField: 'genre',
          as: 'movies'
        }
      },
      {
        $project: {
          name: 1,
          slug: 1,
          isActive: 1,
          movieCount: { $size: '$movies' },
          createdAt: 1
        }
      },
      {
        $sort: { movieCount: -1 }
      }
    ]);
    
    const totalGenres = await Genre.countDocuments({ isActive: true });
    const totalMovies = await Movie.countDocuments({ isActive: true });
    
    sendSuccess(res, {
      totalGenres,
      totalMovies,
      genreStats: stats
    });
  } catch (error) {
    logger.error(`Get genre stats error: ${error.message}`);
    sendError(res, 'Server error', 500);
  }
};