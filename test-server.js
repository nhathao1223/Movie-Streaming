const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

const connectDB = require('./config/db');
const { httpLogger, errorLogger } = require('./middleware/logger');

// Routes
const authRoutes = require('./routes/v1/auth');
const movieRoutes = require('./routes/v1/movies');
const userRoutes = require('./routes/v1/users');
const reviewRoutes = require('./routes/v1/reviews');
const genreRoutes = require('./routes/v1/genres');
const favoriteRoutes = require('./routes/v1/favorites');
const watchHistoryRoutes = require('./routes/v1/watchHistory');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet());
app.use(mongoSanitize());

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging middleware (only in non-test environment)
if (process.env.NODE_ENV !== 'test') {
  app.use(httpLogger);
}

// Routes v1 (no rate limiting in test)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/movies', movieRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/genres', genreRoutes);
app.use('/api/v1/favorites', favoriteRoutes);
app.use('/api/v1/watch-history', watchHistoryRoutes);

// Error logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(errorLogger);
}

// Error handling middleware
app.use(errorHandler);

module.exports = app;