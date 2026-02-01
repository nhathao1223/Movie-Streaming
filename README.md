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

5. Run the application
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
- `GET /api/movies/:id` - Get single movie
- `POST /api/movies` - Create new movie (Protected)
- `PUT /api/movies/:id/view` - Increment view count (Protected)

### User Features
- `POST /api/users/watch-history` - Add movie to watch history (Protected)
- `GET /api/users/watch-history` - Get user's watch history (Protected)
- `POST /api/users/favorites` - Add/remove movie from favorites (Protected)
- `GET /api/users/favorites` - Get user's favorite movies (Protected)
- `GET /api/users/recommendations` - Get personalized recommendations (Protected)

## Query Parameters for Movies

- `search` - Search in title, description, and genre
- `genre` - Filter by genre
- `year` - Filter by release year
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - Sort order: asc/desc (default: desc)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

Example: `GET /api/movies?search=action&genre=Action&sortBy=rating&sortOrder=desc&page=1&limit=5`

## Authentication

Include JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Testing with Postman

1. Register a new user: `POST /api/auth/register`
2. Login to get JWT token: `POST /api/auth/login`
3. Use the token in Authorization header for protected routes
4. Create some movies using `POST /api/movies`
5. Test movie search, filtering, and user features

## Project Structure

```
├── models/
│   ├── User.js          # User model
│   └── Movie.js         # Movie model
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── movies.js        # Movie routes
│   └── users.js         # User feature routes
├── middleware/
│   ├── auth.js          # JWT authentication middleware
│   └── errorHandler.js  # Error handling middleware
├── server.js            # Main server file
├── package.json
└── README.md
```

## Next Steps

- Add admin role and permissions
- Implement movie categories/playlists
- Add movie ratings and reviews
- Implement advanced recommendation algorithms
- Add file upload for movie posters/trailers
- Add email verification
- Implement rate limiting
- Add comprehensive testing