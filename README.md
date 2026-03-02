# Movie Streaming Platform - Backend API

A RESTful API for a movie streaming platform built with Node.js, Express.js, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based user authentication
- **Movie Management**: CRUD operations for movies with search, filtering, sorting, and pagination
- **User Interactions**: Watch history, favorites, and view count tracking
- **Recommendations**: Basic recommendation system based on user behavior
- **Error Handling**: Centralized error handling middleware
- **Validation**: Input validation using express-validator
- **Security**: Helmet.js for HTTP headers, rate limiting, input validation

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: bcryptjs, helmet.js, express-rate-limit

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd movie-streaming-api
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/movie-streaming
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

4. Start MongoDB service on your machine

5. Load sample data and create admin
```bash
npm run seed          # Load sample movies
npm run create-admin  # Create admin user (admin/admin123456)
```

6. Run the application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user info (Protected)

### Movies
- `GET /movies` - Get all movies (with search, filter, sort, pagination)
- `GET /movies/popular` - Get popular movies (most viewed)
- `GET /movies/trending` - Get trending movies (last 7 days)
- `GET /movies/top-rated` - Get top rated movies
- `GET /movies/stats` - Get movie statistics
- `GET /movies/:id` - Get single movie
- `POST /movies` - Create new movie (Protected)
- `PUT /movies/:id` - Update movie (Protected)
- `DELETE /movies/:id` - Delete movie (Protected)
- `PUT /movies/:id/view` - Increment view count (Protected)

### User Features
- `GET /users/profile` - Get user profile with stats (Protected)
- `POST /users/watch-history` - Add movie to watch history (Protected)
- `GET /users/watch-history` - Get user's watch history (Protected)
- `DELETE /users/watch-history/:movieId` - Remove from watch history (Protected)
- `POST /users/favorites` - Add/remove movie from favorites (Protected)
- `GET /users/favorites` - Get user's favorite movies (Protected)
- `GET /users/recommendations` - Get personalized recommendations (Protected)

### Reviews
- `POST /reviews` - Create a review (Protected)
- `GET /reviews/movie/:movieId` - Get reviews for a movie (Public)
- `GET /reviews/user/my-reviews` - Get current user's reviews (Protected)
- `PUT /reviews/:id` - Update a review (Protected)
- `DELETE /reviews/:id` - Delete a review (Protected)
- `PUT /reviews/:id/approve` - Approve review (Protected/Admin)
- `GET /reviews/pending` - Get pending reviews (Protected/Admin)

## Advanced Query Parameters for Movies

- `search` - Search in title, description, and genre
- `genre` - Filter by genre
- `year` - Filter by release year
- `minRating` - Minimum rating filter
- `maxRating` - Maximum rating filter
- `minDuration` - Minimum duration in minutes
- `maxDuration` - Maximum duration in minutes
- `director` - Filter by director name
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - Sort order: asc/desc (default: desc)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

Examples:
- `GET /api/v1/movies?search=action&genre=Action&minRating=8&sortBy=rating&sortOrder=desc`
- `GET /api/v1/movies?director=nolan&minDuration=120&maxDuration=180`

## Authentication

Include JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Versioning

This API uses versioning to ensure backward compatibility:
- Current version: **v1** (`/api/v1/`)
- All endpoints are prefixed with `/api/v1/`
- Future versions will be available at `/api/v2/`, etc.

This allows us to introduce breaking changes in new versions without affecting existing clients.

## Testing with Swagger UI

1. Start the server: `npm run dev`
2. Open your browser and go to: `http://localhost:5000`
3. Click on "Swagger UI" button
4. Register a new user: `POST /api/auth/register`
5. Login to get JWT token: `POST /api/auth/login`
6. Click "Authorize" button and paste your token
7. Test all endpoints interactively

See [SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md) for detailed Swagger usage instructions.

## Testing with Postman

1. Register a new user: `POST /api/auth/register`
2. Login to get JWT token: `POST /api/auth/login`
3. Use the token in Authorization header for protected routes
4. Create some movies using `POST /api/movies`
5. Test movie search, filtering, and user features

## Project Structure

```
├── config/
│   └── db.js                    # Database connection
├── controllers/
│   ├── auth.controller.js       # Authentication logic
│   ├── movie.controller.js      # Movie operations
│   ├── user.controller.js       # User features
│   └── review.controller.js     # Review management
├── middleware/
│   ├── auth.js                  # JWT authentication
│   ├── admin.js                 # Admin authorization
│   └── errorHandler.js          # Error handling
├── models/
│   ├── User.js
│   ├── Movie.js
│   └── Review.js
├── routes/
│   ├── auth.js
│   ├── movies.js
│   ├── users.js
│   └── reviews.js
├── utils/
│   ├── response.js              # Response helpers
│   └── generateToken.js         # Token generation
├── validations/
│   ├── auth.validation.js
│   ├── movie.validation.js
│   └── review.validation.js
├── scripts/
│   ├── seedData.js
│   └── createAdmin.js
├── server.js
├── swagger.js
└── package.json
```

## Architecture

This project follows the **MVC (Model-View-Controller) pattern**:

- **Models**: Database schemas (User, Movie, Review)
- **Controllers**: Business logic for each feature
- **Routes**: API endpoints and routing
- **Middleware**: Authentication, authorization, error handling, rate limiting
- **Utils**: Helper functions and utilities
- **Validations**: Input validation schemas

## Security

This API includes multiple security layers:
- **Helmet.js**: HTTP headers protection
- **Rate Limiting**: Prevents brute force and abuse
- **Input Validation**: Sanitizes all user inputs
- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Secure token-based auth
- **CORS**: Controlled cross-origin requests

See [SECURITY.md](./SECURITY.md) for detailed security information.

## Logging

Structured logging with Winston:
- **Multiple log levels**: error, warn, info, http, debug
- **File logging**: Separate error and combined logs
- **Console output**: Colored real-time logs
- **Error tracking**: Detailed error context and stack traces

See [LOGGING.md](./LOGGING.md) for logging documentation.

## Testing

Comprehensive test suite with Jest and Supertest:
- **16+ test cases** covering authentication and movies
- **Unit tests** for critical paths
- **Integration tests** for API endpoints
- **Error handling** validation

Run tests:
```bash
npm test              # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

See [TIER1_IMPROVEMENTS.md](./TIER1_IMPROVEMENTS.md) for details.

## Next Steps

- Add admin role and permissions
- Implement movie categories/playlists
- Add movie ratings and reviews
- Implement advanced recommendation algorithms
- Add file upload for movie posters/trailers
- Add email verification
- Implement rate limiting
- Add comprehensive testing