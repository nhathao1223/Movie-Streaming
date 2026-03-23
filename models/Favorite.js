const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: [true, 'Movie is required']
  }
}, {
  timestamps: true
});

// Compound unique index to prevent duplicate favorites
favoriteSchema.index({ user: 1, movie: 1 }, { unique: true });

// Indexes for performance
favoriteSchema.index({ user: 1 });
favoriteSchema.index({ movie: 1 });
favoriteSchema.index({ createdAt: -1 });

// Virtual for populated movie data
favoriteSchema.virtual('movieData', {
  ref: 'Movie',
  localField: 'movie',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
favoriteSchema.set('toJSON', { virtuals: true });
favoriteSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Favorite', favoriteSchema);