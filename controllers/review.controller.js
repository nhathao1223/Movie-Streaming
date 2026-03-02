const Review = require('../models/Review');
const Movie = require('../models/Movie');
const mongoose = require('mongoose');
const { sendSuccess, sendError } = require('../utils/response');

exports.create = async (req, res) => {
  try {
    const { movieId, rating, title, comment } = req.body;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return sendError(res, 'Movie not found', 404);
    }

    const existingReview = await Review.findOne({
      movie: movieId,
      user: req.user._id
    });

    if (existingReview) {
      return sendError(res, 'You already reviewed this movie', 400);
    }

    const review = new Review({
      movie: movieId,
      user: req.user._id,
      rating,
      title,
      comment
    });

    await review.save();
    await review.populate('user', 'username');

    sendSuccess(res, review, 'Review created', 201);
  } catch (error) {
    sendError(res, 'Server error', 500);
  }
};

exports.getByMovie = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({
      movie: req.params.movieId,
      isApproved: true
    })
    .populate('user', 'username')
    .sort({ [sortBy]: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Review.countDocuments({
      movie: req.params.movieId,
      isApproved: true
    });

    const ratingStats = await Review.aggregate([
      { $match: { movie: mongoose.Types.ObjectId(req.params.movieId), isApproved: true } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    sendSuccess(res, {
      reviews,
      stats: ratingStats[0] || { avgRating: 0, totalReviews: 0 },
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

exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('movie', 'title poster')
      .sort({ createdAt: -1 });

    sendSuccess(res, reviews);
  } catch (error) {
    sendError(res, 'Server error', 500);
  }
};

exports.getPending = async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: false })
      .populate('user', 'username')
      .populate('movie', 'title')
      .sort({ createdAt: -1 });

    sendSuccess(res, reviews);
  } catch (error) {
    sendError(res, 'Server error', 500);
  }
};

exports.update = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return sendError(res, 'Review not found', 404);
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized', 403);
    }

    review = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'username');

    sendSuccess(res, review, 'Review updated');
  } catch (error) {
    sendError(res, 'Server error', 500);
  }
};

exports.delete = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return sendError(res, 'Review not found', 404);
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized', 403);
    }

    await Review.findByIdAndDelete(req.params.id);

    sendSuccess(res, null, 'Review deleted');
  } catch (error) {
    sendError(res, 'Server error', 500);
  }
};

exports.approve = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).populate('user', 'username');

    sendSuccess(res, review, 'Review approved');
  } catch (error) {
    sendError(res, 'Server error', 500);
  }
};
