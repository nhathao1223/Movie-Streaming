# Movie Streaming Platform - Backend API

A RESTful API for a movie streaming platform built with Node.js, Express.js, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based user authentication
- **Movie Management**: CRUD operations for movies with search, filtering, sorting, and pagination
- **User Interactions**: Watch history, favorites, and view count tracking
- **Recommendations**: Basic recommendation system based on user behavior
- **Error Handling**: Centralized error handling middleware
- **Validation**: Input validation using express-validator

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: bcryptjs for password hashing

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

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info (Protected)

### Movies
- `GET /api/movies` - Get all movies (with search, filter, sort, pagination)
- `GET /api/movies/popular` - Get popular movies (most viewed)
- `GET /api/movies/trending` - Get trending movies (last 7 days)
- `GET /api/movies/top-rated` - Get top rated movies
- `GET /api/movies/stats` - Get movie statistics
- `GET /api/movies/:id` - Get single movie
- `POST /api/movies` - Create new movie (Protected)
- `PUT /api/movies/:id` - Update movie (Protected)
- `DELETE /api/movies/:id` - Delete movie (Protected)
- `PUT /api/movies/:id/view` - Increment view count (Protected)

### User Features
- `GET /api/users/profile` - Get user profile with stats (Protected)
- `POST /api/users/watch-history` - Add movie to watch history (Protected)
- `GET /api/users/watch-history` - Get user's watch history (Protected)
- `DELETE /api/users/watch-history/:movieId` - Remove from watch history (Protected)
- `POST /api/users/favorites` - Add/remove movie from favorites (Protected)
- `GET /api/users/favorites` - Get user's favorite movies (Protected)
- `GET /api/users/recommendations` - Get personalized recommendations (Protected)

### Reviews
- `POST /api/reviews` - Create a review (Protected)
- `GET /api/reviews/movie/:movieId` - Get reviews for a movie (Public)
- `GET /api/reviews/user/my-reviews` - Get current user's reviews (Protected)
- `PUT /api/reviews/:id` - Update a review (Protected)
- `DELETE /api/reviews/:id` - Delete a review (Protected)
- `PUT /api/reviews/:id/approve` - Approve review (Protected/Admin)
- `GET /api/reviews/pending` - Get pending reviews (Protected/Admin)

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
- `limit` - Items per page (default: 10)

Examples:
- `GET /api/movies?search=action&genre=Action&minRating=8&sortBy=rating&sortOrder=desc`
- `GET /api/movies?director=nolan&minDuration=120&maxDuration=180`

## Authentication

Include JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

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
- **Middleware**: Authentication, authorization, error handling
- **Utils**: Helper functions and utilities
- **Validations**: Input validation schemas

## Next Steps

- Add admin role and permissions
- Implement movie categories/playlists
- Add movie ratings and reviews
- Implement advanced recommendation algorithms
- Add file upload for movie posters/trailers
- Add email verification
- Implement rate limiting
- Add comprehensive testing