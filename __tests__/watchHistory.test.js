const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const watchHistoryRoutes = require('../routes/v1/watchHistory');
const WatchHistory = require('../models/WatchHistory');
const Movie = require('../models/Movie');
const User = require('../models/User');
const Genre = require('../models/Genre');
const errorHandler = require('../middleware/errorHandler');
const generateToken = require('../utils/generateToken');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/v1/watch-history', watchHistoryRoutes);
app.use(errorHandler);

describe('Watch History Routes', () => {
  let testUser, testMovie, testGenre, authToken;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-streaming-test');
  });

  afterAll(async () => {
    await WatchHistory.deleteMany({});
    await Movie.deleteMany({});
    await User.deleteMany({});
    await Genre.deleteMany({});
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clean up
    await WatchHistory.deleteMany({});
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

  describe('GET /api/v1/watch-history', () => {
    it('should get empty watch history', async () => {
      const res = await request(app)
        .get('/api/v1/watch-history')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.watchHistory).toHaveLength(0);
      expect(res.body.data.pagination.total).toBe(0);
    });

    it('should get user watch history with pagination', async () => {
      await WatchHistory.create({
        user: testUser._id,
        movie: testMovie._id,
        watchedAt: new Date(),
        progress: 75
      });

      const res = await request(app)
        .get('/api/v1/watch-history?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.watchHistory).toHaveLength(1);
      expect(res.body.data.watchHistory[0].movie.title).toBe('Test Movie');
      expect(res.body.data.watchHistory[0].progress).toBe(75);
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.total).toBe(1);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/v1/watch-history');

      expect(res.statusCode).toBe(401);
    });

    it('should sort watch history by watchedAt desc by default', async () => {
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

      const now = new Date();
      const earlier = new Date(now.getTime() - 60000); // 1 minute earlier

      await WatchHistory.create({
        user: testUser._id,
        movie: testMovie._id,
        watchedAt: earlier,
        progress: 50
      });

      await WatchHistory.create({
        user: testUser._id,
        movie: movie2._id,
        watchedAt: now,
        progress: 25
      });

      const res = await request(app)
        .get('/api/v1/watch-history')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.watchHistory).toHaveLength(2);
      expect(res.body.data.watchHistory[0].movie.title).toBe('Test Movie 2');
      expect(res.body.data.watchHistory[1].movie.title).toBe('Test Movie');
    });
  });

  describe('POST /api/v1/watch-history', () => {
    it('should add movie to watch history', async () => {
      const watchData = {
        movieId: testMovie._id.toString(),
        progress: 45
      };

      const res = await request(app)
        .post('/api/v1/watch-history')
        .set('Authorization', `Bearer ${authToken}`)
        .send(watchData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Added to watch history');
      expect(res.body.data.movie.title).toBe('Test Movie');
      expect(res.body.data.progress).toBe(45);
    });

    it('should update existing watch history entry', async () => {
      // Create initial watch history
      await WatchHistory.create({
        user: testUser._id,
        movie: testMovie._id,
        watchedAt: new Date(),
        progress: 30
      });

      const watchData = {
        movieId: testMovie._id.toString(),
        progress: 75
      };

      const res = await request(app)
        .post('/api/v1/watch-history')
        .set('Authorization', `Bearer ${authToken}`)
        .send(watchData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Watch history updated');
      expect(res.body.data.progress).toBe(75);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/v1/watch-history')
        .send({ movieId: testMovie._id.toString(), progress: 50 });

      expect(res.statusCode).toBe(401);
    });

    it('should validate progress range (0-100)', async () => {
      const res = await request(app)
        .post('/api/v1/watch-history')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ movieId: testMovie._id.toString(), progress: 150 });

      expect(res.statusCode).toBe(400);
    });

    it('should return 404 for non-existent movie', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/api/v1/watch-history')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ movieId: fakeId.toString(), progress: 50 });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Movie not found');
    });

    it('should return 400 for invalid movie ID format', async () => {
      const res = await request(app)
        .post('/api/v1/watch-history')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ movieId: 'invalid-id', progress: 50 });

      expect(res.statusCode).toBe(400);
    });

    it('should require movieId and progress', async () => {
      const res = await request(app)
        .post('/api/v1/watch-history')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/v1/watch-history/:movieId', () => {
    beforeEach(async () => {
      await WatchHistory.create({
        user: testUser._id,
        movie: testMovie._id,
        watchedAt: new Date(),
        progress: 60
      });
    });

    it('should remove movie from watch history', async () => {
      const res = await request(app)
        .delete(`/api/v1/watch-history/${testMovie._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Removed from watch history');
    });

    it('should return 404 if movie not in watch history', async () => {
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
        .delete(`/api/v1/watch-history/${anotherMovie._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Movie not found in watch history');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .delete(`/api/v1/watch-history/${testMovie._id}`);

      expect(res.statusCode).toBe(401);
    });

    it('should return 400 for invalid movie ID format', async () => {
      const res = await request(app)
        .delete('/api/v1/watch-history/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/watch-history/stats', () => {
    beforeEach(async () => {
      await WatchHistory.create({
        user: testUser._id,
        movie: testMovie._id,
        watchedAt: new Date(),
        progress: 100
      });

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

      await WatchHistory.create({
        user: testUser._id,
        movie: movie2._id,
        watchedAt: new Date(),
        progress: 50
      });
    });

    it('should get watch history statistics', async () => {
      const res = await request(app)
        .get('/api/v1/watch-history/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalWatched).toBe(2);
      expect(res.body.data.totalCompleted).toBe(1);
      expect(res.body.data.averageProgress).toBeGreaterThan(0);
      expect(res.body.data.watchTimeMinutes).toBeGreaterThan(0);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/v1/watch-history/stats');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/watch-history/continue-watching', () => {
    beforeEach(async () => {
      // Create completed movie (should not appear)
      await WatchHistory.create({
        user: testUser._id,
        movie: testMovie._id,
        watchedAt: new Date(),
        progress: 100
      });

      // Create in-progress movie (should appear)
      const movie2 = await Movie.create({
        title: 'In Progress Movie',
        description: 'A movie in progress',
        genre: [testGenre._id],
        director: 'Test Director',
        releaseYear: 2024,
        duration: 90,
        rating: 7.5,
        isActive: true
      });

      await WatchHistory.create({
        user: testUser._id,
        movie: movie2._id,
        watchedAt: new Date(),
        progress: 45
      });
    });

    it('should get continue watching list (progress < 95%)', async () => {
      const res = await request(app)
        .get('/api/v1/watch-history/continue-watching')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].movie.title).toBe('In Progress Movie');
      expect(res.body.data[0].progress).toBe(45);
    });

    it('should limit results to specified limit', async () => {
      const res = await request(app)
        .get('/api/v1/watch-history/continue-watching?limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(5);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/v1/watch-history/continue-watching');

      expect(res.statusCode).toBe(401);
    });
  });
});