const express = require('express');
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

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true
  }
}));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/movies', movieRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/reviews', reviewRoutes);

// Error logging middleware
app.use(errorLogger);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});