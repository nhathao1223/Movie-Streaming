const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  genre: [{
    type: String,
    required: true
  }],
  releaseYear: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  director: {
    type: String,
    required: true
  },
  cast: [{
    type: String
  }],
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  poster: {
    type: String, // URL to poster image
    default: ''
  },
  trailer: {
    type: String, // URL to trailer video
    default: ''
  },
  viewCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
movieSchema.index({ title: 'text', description: 'text', genre: 'text' });
movieSchema.index({ genre: 1 });
movieSchema.index({ releaseYear: 1 });
movieSchema.index({ rating: -1 });
movieSchema.index({ viewCount: -1 });
movieSchema.index({ director: 1 });
movieSchema.index({ isActive: 1 });
movieSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Movie', movieSchema);