const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const favoriteRoutes = require('../routes/v1/favorites');
const Favorite = require('../models/Favorite');
const Movie = require('../models/Movie');
const User = require('../models/User');
const Genre = require('../models/Genre');
const auth = require('../middleware/auth');
const errorHandler = require('../middleware/errorHandler');
const generateToken = require('../utils/generateToken');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/v1/favorites', favoriteRoutes);
app.use(errorHandler);

describe('Favorites Routes', () => {
  let testUser, testMovie, testGenre, authToken;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-streaming-test');
  });

  afterAll(async () => {
    await Favorite.deleteMany({});
    await Movie.deleteMany({});
    await User.deleteMany({});
    await Genre.deleteMany({});
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clean up
    await Favorite.deleteMany({});
    await Movie.deleteMany({});
    await User.deleteMany({});
    await Genre.deleteMany({});

    // Create test genre
    testGenre = await Genre.create({
      name: 'Action',
      slug: 'action'
    });

    // Create test user
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });

    // Create test movie
    testMovie = await Movie.create({
      title: 'Test Movie',
      description: 'A test movie',
      genre: [testGenre._id],
      director: 'Test Director',
      releaseYear: 2024,
      duration: 120,
      rating: 8.5,
      isActive: true
    });

    // Generate auth token
    authToken = generateToken(testUser._id);
  });

  describe('GET /api/v1/favorites', () => {
    it('should get empty favorites list', async () => {
      const res = await request(app)
        .get('/api/v1/favorites')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.favorites).toHaveLength(0);
      expect(res.body.data.pagination.total).toBe(0);
    });

    it('should get user favorites with pagination', async () => {
      // Add movie to favorites
      await Favorite.create({
        user: testUser._id,
        movie: testMovie._id
      });

      const res = await request(app)
        .get('/api/v1/favorites?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.favorites).toHaveLength(1);
      expect(res.body.data.favorites[0].movie.title).toBe('Test Movie');
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.total).toBe(1);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/v1/favorites');

      expect(res.statusCode).toBe(401);
    });

    it('should sort favorites by createdAt desc by default', async () => {
      // Create multiple favorites
      const movie2 = await Movie.create({
        title: 'Test Movie 2',
        description: 'Another test movie',
        genre: [testGenre._id],
        director: 'Test Director',
        releaseYear: 2024,
        duration: 90,
        rating: 7.5,
        isActive: true
      });

      await Favorite.create({
        user: testUser._id,
        movie: testMovie._id
      });

      // Wait a bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      await Favorite.create({
        user: testUser._id,
        movie: movie2._id
      });

      const res = await request(app)
        .get('/api/v1/favorites?sortBy=createdAt&sortOrder=desc')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.favorites).toHaveLength(2);
      expect(res.body.data.favorites[0].movie.title).toBe('Test Movie 2');
    });
  });

  describe('POST /api/v1/favorites', () => {
    it('should add movie to favorites', async () => {
      const res = await request(app)
        .post('/api/v1/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ movieId: testMovie._id.toString() });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Movie added to favorites');
      expect(res.body.data.movie.title).toBe('Test Movie');
    });

    it('should not add duplicate movie to favorites', async () => {
      // Add movie first time
      await request(app)
        .post('/api/v1/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ movieId: testMovie._id.toString() });

      // Try to add same movie again
      const res = await request(app)
        .post('/api/v1/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ movieId: testMovie._id.toString() });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Movie already in favorites');
    });

    it('should return 404 for non-existent movie', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/api/v1/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ movieId: fakeId.toString() });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Movie not found');
    });

    it('should return 400 for invalid movie ID format', async () => {
      const res = await request(app)
        .post('/api/v1/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ movieId: 'invalid-id' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/v1/favorites')
        .send({ movieId: testMovie._id.toString() });

      expect(res.statusCode).toBe(401);
    });

    it('should require movieId in request body', async () => {
      const res = await request(app)
        .post('/api/v1/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/v1/favorites/:movieId', () => {
    beforeEach(async () => {
      await Favorite.create({
        user: testUser._id,
        movie: testMovie._id
      });
    });

    it('should remove movie from favorites', async () => {
      const res = await request(app)
        .delete(`/api/v1/favorites/${testMovie._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Movie removed from favorites');
    });

    it('should return 404 if movie not in favorites', async () => {
      const anotherMovie = await Movie.create({
        title: 'Another Movie',
        description: 'Another test movie',
        genre: [testGenre._id],
        director: 'Test Director',
        releaseYear: 2024,
        duration: 90,
        rating: 7.0,
        isActive: true
      });

      const res = await request(app)
        .delete(`/api/v1/favorites/${anotherMovie._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Movie not found in favorites');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .delete(`/api/v1/favorites/${testMovie._id}`);

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/favorites/:movieId', () => {
    it('should check if movie is in favorites (true)', async () => {
      await Favorite.create({
        user: testUser._id,
        movie: testMovie._id
      });

      const res = await request(app)
        .get(`/api/v1/favorites/${testMovie._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isFavorite).toBe(true);
      expect(res.body.data.favoriteId).toBeDefined();
    });

    it('should check if movie is in favorites (false)', async () => {
      const res = await request(app)
        .get(`/api/v1/favorites/${testMovie._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isFavorite).toBe(false);
      expect(res.body.data.favoriteId).toBeNull();
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get(`/api/v1/favorites/${testMovie._id}`);

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/favorites/stats', () => {
    beforeEach(async () => {
      await Favorite.create({
        user: testUser._id,
        movie: testMovie._id
      });
    });

    it('should get favorite statistics', async () => {
      const res = await request(app)
        .get('/api/v1/favorites/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalFavorites).toBe(1);
      expect(res.body.data.favoriteGenres).toBeDefined();
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/v1/favorites/stats');

      expect(res.statusCode).toBe(401);
    });
  });
});