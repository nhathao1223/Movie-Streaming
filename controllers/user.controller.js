const User = require('../models/User');
const Movie = require('../models/Movie');
const { sendSuccess, sendError } = require('../utils/response');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('favorites', 'title poster rating')
      .populate('watchHistory.movie', 'title poster rating')
      .select('-password');

    const totalWatched = user.watchHistory.length;
    const totalFavorites = user.favorites.length;
    
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

    sendSuccess(res, {
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
    });
  } catch (error) {
    sendError(res, 'Server error', 500);
  }
};

exports.addWatchHistory = async (req, res) => {
  try {
    const { movieId } = req.body;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return sendError(res, 'Movie not found', 404);
    }

    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { watchHistory: { movie: movieId } } }
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

    sendSuccess(res, null, 'Added to watch history');
  } catch (error) {
    sendError(res, 'Server error', 500);
  }
};

exports.getWatchHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('watchHistory.movie')
      .sort({ 'watchHistory.watchedAt': -1 });

    sendSuccess(res, user.watchHistory);
  } catch (error) {
    sendError(res, 'Server error', 500);
  }
};

exports.removeWatchHistory = async (req, res) => {
  try {
    const { movieId } = req.params;

    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { watchHistory: { movie: movieId } } }
    );

    sendSuccess(res, null, 'Removed from watch history');
  } catch (error) {
    sendError(res, 'Server error', 500);
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const { movieId } = req.body;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return sendError(res, 'Movie not found', 404);
    }

    const user = await User.findById(req.user._id);
    const isFavorite = user.favorites.includes(movieId);

    if (isFavorite) {
      await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { favorites: movieId } }
      );
      sendSuccess(res, null, 'Removed from favorites');
    } else {
      await User.findByIdAndUpdate(
        req.user._id,
        { $push: { favorites: movieId } }
      );
      sendSuccess(res, null, 'Added to favorites');
    }
  } catch (error) {
    sendError(res, 'Server error', 500);
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    sendSuccess(res, user.favorites);
  } catch (error) {
    sendError(res, 'Server error', 500);
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('watchHistory.movie')
      .populate('favorites');

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

    const allGenres = [...watchedGenres, ...favoriteGenres];
    const genreCount = {};
    allGenres.forEach(genre => {
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    });

    const topGenres = Object.keys(genreCount)
      .sort((a, b) => genreCount[b] - genreCount[a])
      .slice(0, 3);

    const watchedMovieIds = user.watchHistory.map(item => item.movie._id);
    const favoriteMovieIds = user.favorites.map(movie => movie._id);
    const excludeIds = [...watchedMovieIds, ...favoriteMovieIds];

    const recommendations = await Movie.find({
      genre: { $in: topGenres },
      _id: { $nin: excludeIds },
      isActive: true
    })
    .sort({ rating: -1, viewCount: -1 })
    .limit(10);

    sendSuccess(res, recommendations);
  } catch (error) {
    sendError(res, 'Server error', 500);
  }
};
