/**
 * Sample data for API testing and documentation
 */

// Sample MongoDB ObjectIds for testing
const SAMPLE_IDS = {
  MOVIE_ID: '507f1f77bcf86cd799439011',
  USER_ID: '507f1f77bcf86cd799439012', 
  REVIEW_ID: '507f1f77bcf86cd799439013'
};

// Sample movie data for POST requests
const SAMPLE_MOVIE = {
  title: "The Dark Knight",
  description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
  genre: ["Action", "Crime", "Drama"],
  releaseYear: 2008,
  duration: 152,
  director: "Christopher Nolan",
  cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine"],
  rating: 9.0,
  poster: "https://example.com/posters/dark-knight.jpg",
  trailer: "https://example.com/trailers/dark-knight.mp4"
};

// Sample review data for POST requests
const SAMPLE_REVIEW = {
  movieId: SAMPLE_IDS.MOVIE_ID,
  rating: 5,
  title: "Masterpiece of Cinema",
  comment: "An incredible movie with outstanding performances and direction. Heath Ledger's Joker is unforgettable."
};

// Sample user data for registration
const SAMPLE_USER = {
  username: "moviefan123",
  email: "user@example.com",
  password: "password123"
};

// Sample login data
const SAMPLE_LOGIN = {
  email: "user@example.com",
  password: "password123"
};

// Admin login data
const ADMIN_LOGIN = {
  email: "admin@example.com",
  password: "admin123456"
};

// Test user login data  
const TEST_USER_LOGIN = {
  email: "testuser@example.com",
  password: "testpass123"
};

// Sample authentication headers
const SAMPLE_AUTH_HEADERS = {
  "Authorization": "Bearer YOUR_TOKEN_HERE",
  "Content-Type": "application/json"
};

// Sample request for adding to favorites
const SAMPLE_ADD_FAVORITE = {
  movieId: SAMPLE_IDS.MOVIE_ID
};

// Sample request for adding to watch history
const SAMPLE_ADD_WATCH_HISTORY = {
  movieId: SAMPLE_IDS.MOVIE_ID
};

// Sample review update data
const SAMPLE_REVIEW_UPDATE = {
  title: "Updated Review Title",
  comment: "Updated review comment with more details about the movie",
  rating: 4
};

module.exports = {
  SAMPLE_IDS,
  SAMPLE_MOVIE,
  SAMPLE_REVIEW,
  SAMPLE_USER,
  SAMPLE_LOGIN,
  ADMIN_LOGIN,
  TEST_USER_LOGIN,
  SAMPLE_AUTH_HEADERS,
  SAMPLE_ADD_FAVORITE,
  SAMPLE_ADD_WATCH_HISTORY,
  SAMPLE_REVIEW_UPDATE
};