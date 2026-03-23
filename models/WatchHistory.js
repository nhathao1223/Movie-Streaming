const mongoose = require('mongoose');

const watchHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: [true, 'Movie is required']
  },
  progress: {
    type: Number,
    min: [0, 'Progress cannot be negative'],
    max: [100, 'Progress cannot exceed 100%'],
    default: 0
  },
  watchedAt: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number, // Duration watched in seconds
    min: [0, 'Duration cannot be negative'],
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for user-movie combination
watchHistorySchema.index({ user: 1, movie: 1 });

// Indexes for performance
watchHistorySchema.index({ user: 1 });
watchHistorySchema.index({ movie: 1 });
watchHistorySchema.index({ watchedAt: -1 });
watchHistorySchema.index({ isCompleted: 1 });

// Update isCompleted based on progress
watchHistorySchema.pre('save', function(next) {
  if (this.progress >= 90) {
    this.isCompleted = true;
  }
  next();
});

// Virtual for populated movie data
watchHistorySchema.virtual('movieData', {
  ref: 'Movie',
  localField: 'movie',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
watchHistorySchema.set('toJSON', { virtuals: true });
watchHistorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('WatchHistory', watchHistorySchema);