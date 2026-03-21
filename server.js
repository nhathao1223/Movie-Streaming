const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
require('dotenv').config();

const connectDB = require('./config/db');
const logger = require('./config/logger');
const { httpLogger, errorLogger } = require('./middleware/logger');
const { apiLimiter } = require('./middleware/rateLimiter');
const authRoutes = require('./routes/v1/auth');
const movieRoutes = require('./routes/v1/movies');
const userRoutes = require('./routes/v1/users');
const reviewRoutes = require('./routes/v1/reviews');
const genreRoutes = require('./routes/v1/genres');
const favoriteRoutes = require('./routes/v1/favorites');
const watchHistoryRoutes = require('./routes/v1/watchHistory');
const sampleRoutes = require('./routes/v1/samples');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet()); // Set security HTTP headers
app.use(mongoSanitize()); // Prevent NoSQL injection

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Limit request body size
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging middleware
app.use(httpLogger);

// Rate limiting
app.use('/api/', apiLimiter); // Apply rate limiter to all API routes

// Debug middleware to log all requests (only for API routes)
app.use('/api', (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Swagger UI - serve at both root and /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,
    tryItOutEnabled: true
  }
}));

// Serve Swagger UI at root path as well
app.use('/', swaggerUi.serve);
app.get('/', swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,
    tryItOutEnabled: true
  }
}));

// Routes v1 (primary)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/movies', movieRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/genres', genreRoutes);
app.use('/api/v1/favorites', favoriteRoutes);
app.use('/api/v1/watch-history', watchHistoryRoutes);
app.use('/api/v1/samples', sampleRoutes);

// Legacy routes (for backward compatibility) - optional
const legacyAuthRoutes = require('./routes/auth');
const legacyMovieRoutes = require('./routes/movies');
const legacyUserRoutes = require('./routes/users');
const legacyReviewRoutes = require('./routes/reviews');

app.use('/api/auth', legacyAuthRoutes);
app.use('/api/movies', legacyMovieRoutes);
app.use('/api/users', legacyUserRoutes);
app.use('/api/reviews', legacyReviewRoutes);

// API health check endpoint
app.get('/health', (req, res) => {
  res.json({
    message: 'Movie Streaming API is running',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      swagger: '/ or /api-docs',
      auth: '/api/v1/auth',
      movies: '/api/v1/movies',
      users: '/api/v1/users',
      reviews: '/api/v1/reviews',
      genres: '/api/v1/genres',
      favorites: '/api/v1/favorites',
      watchHistory: '/api/v1/watch-history',
      samples: '/api/v1/samples'
    }
  });
});

// API health check
app.get('/api', (req, res) => {
  res.json({
    message: 'Movie Streaming API is running',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      swagger: '/api-docs',
      auth: '/api/v1/auth',
      movies: '/api/v1/movies',
      users: '/api/v1/users',
      reviews: '/api/v1/reviews',
      genres: '/api/v1/genres',
      favorites: '/api/v1/favorites',
      watchHistory: '/api/v1/watch-history',
      samples: '/api/v1/samples'
    }
  });
});

// Quick seed endpoint for testing
app.post('/api/seed', async (req, res) => {
  try {
    const Movie = require('./models/Movie');
    
    // Clear existing movies
    await Movie.deleteMany({});
    
    // Sample movies
    const sampleMovies = [
      {
        title: "The Shawshank Redemption",
        description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        genre: ["Drama"],
        releaseYear: 1994,
        duration: 142,
        director: "Frank Darabont",
        cast: ["Tim Robbins", "Morgan Freeman"],
        rating: 9.3
      },
      {
        title: "The Dark Knight",
        description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
        genre: ["Action", "Crime", "Drama"],
        releaseYear: 2008,
        duration: 152,
        director: "Christopher Nolan",
        cast: ["Christian Bale", "Heath Ledger"],
        rating: 9.0
      },
      {
        title: "Inception",
        description: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.",
        genre: ["Action", "Sci-Fi", "Thriller"],
        releaseYear: 2010,
        duration: 148,
        director: "Christopher Nolan",
        cast: ["Leonardo DiCaprio", "Marion Cotillard"],
        rating: 8.7
      }
    ];
    
    await Movie.insertMany(sampleMovies);
    
    res.json({
      success: true,
      message: 'Sample data created successfully',
      count: sampleMovies.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating sample data',
      error: error.message
    });
  }
});

// Error logging middleware
app.use(errorLogger);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});