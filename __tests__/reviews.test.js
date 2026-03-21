const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const reviewRoutes = require('../routes/v1/reviews');
const Review = require('../models/Review');
const Movie = require('../models/Movie');
const User = require('../models/User');
const Genre = require('../models/Genre');
const errorHandler = require('../middleware/errorHandler');
const generateToken = require('../utils/generateToken');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/v1/reviews', reviewRoutes);
app.use(errorHandler);

describe('Reviews Routes', () => {
  let testUser, adminUser, testMovie, testGenre, userToken, adminToken;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-streaming-test');
  });

  afterAll(async () => {
    await Review.deleteMany({});
    await Movie.deleteMany({});
    await User.deleteMany({});
    await Genre.deleteMany({});
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clean up
    await Review.deleteMany({});
    await Movie.deleteMany({});
    await User.deleteMany({});
    await Genre.deleteMany({});

    // Create test genre
    testGenre = await Genre.create({
      name: 'Action',
      slug: 'action'
    });

    // Create test users
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    });

    adminUser = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
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

    // Generate auth tokens
    userToken = generateToken(testUser._id);
    adminToken = generateToken(adminUser._id);
  });

  describe('GET /api/v1/reviews/movie/:movieId', () => {
    beforeEach(async () => {
      await Review.create({
        user: testUser._id,
        movie: testMovie._id,
        rating: 5,
        title: 'Great Movie',
        comment: 'This is a great movie with excellent acting.',
        isApproved: true
      });
    });

    it('should get reviews for a movie', async () => {
      const res = await request(app)
        .get(`/api/v1/reviews/movie/${testMovie._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reviews).toHaveLength(1);
      expect(res.body.data.reviews[0].title).toBe('Great Movie');
      expect(res.body.data.reviews[0].user.username).toBe('testuser');
    });

    it('should only return approved reviews', async () => {
      await Review.create({
        user: testUser._id,
        movie: testMovie._id,
        rating: 3,
        title: 'Pending Review',
        comment: 'This review is pending approval.',
        isApproved: false
      });

      const res = await request(app)
        .get(`/api/v1/reviews/movie/${testMovie._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.reviews).toHaveLength(1);
      expect(res.body.data.reviews[0].title).toBe('Great Movie');
    });

    it('should paginate reviews', async () => {
      const res = await request(app)
        .get(`/api/v1/reviews/movie/${testMovie._id}?page=1&limit=5`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.limit).toBe(5);
    });

    it('should return 400 for invalid movie ID', async () => {
      const res = await request(app)
        .get('/api/v1/reviews/movie/invalid-id');

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/v1/reviews', () => {
    const reviewData = {
      movieId: '',
      rating: 5,
      title: 'Excellent Movie',
      comment: 'This movie exceeded my expectations with great storytelling.'
    };

    beforeEach(() => {
      reviewData.movieId = testMovie._id.toString();
    });

    it('should create a new review', async () => {
      const res = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Excellent Movie');
      expect(res.body.data.rating).toBe(5);
      expect(res.body.data.isApproved).toBe(false);
    });

    it('should not allow duplicate reviews from same user', async () => {
      // Create first review
      await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData);

      // Try to create second review
      const res = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('You have already reviewed this movie');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/v1/reviews')
        .send(reviewData);

      expect(res.statusCode).toBe(401);
    });

    it('should validate rating range (1-5)', async () => {
      const res = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...reviewData, rating: 6 });

      expect(res.statusCode).toBe(400);
    });

    it('should validate title length', async () => {
      const res = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...reviewData, title: 'Hi' });

      expect(res.statusCode).toBe(400);
    });

    it('should validate comment length', async () => {
      const res = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...reviewData, comment: 'Short' });

      expect(res.statusCode).toBe(400);
    });

    it('should return 404 for non-existent movie', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...reviewData, movieId: fakeId.toString() });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Movie not found');
    });
  });

  describe('PUT /api/v1/reviews/:id', () => {
    let reviewId;

    beforeEach(async () => {
      const review = await Review.create({
        user: testUser._id,
        movie: testMovie._id,
        rating: 4,
        title: 'Good Movie',
        comment: 'This is a good movie with decent acting.',
        isApproved: false
      });
      reviewId = review._id;
    });

    it('should update own review', async () => {
      const updateData = {
        rating: 5,
        title: 'Great Movie Updated',
        comment: 'Updated: This is an excellent movie with outstanding acting.'
      };

      const res = await request(app)
        .put(`/api/v1/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Great Movie Updated');
      expect(res.body.data.rating).toBe(5);
    });

    it('should not allow updating other user\'s review', async () => {
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password123'
      });
      const otherToken = generateToken(otherUser._id);

      const res = await request(app)
        .put(`/api/v1/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Hacked Review' });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe('Access denied. You can only update your own reviews');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .put(`/api/v1/reviews/${reviewId}`)
        .send({ title: 'Updated Title' });

      expect(res.statusCode).toBe(401);
    });

    it('should return 404 for non-existent review', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/v1/reviews/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Updated Title' });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/v1/reviews/:id', () => {
    let reviewId;

    beforeEach(async () => {
      const review = await Review.create({
        user: testUser._id,
        movie: testMovie._id,
        rating: 4,
        title: 'Good Movie',
        comment: 'This is a good movie.',
        isApproved: true
      });
      reviewId = review._id;
    });

    it('should allow user to delete own review', async () => {
      const res = await request(app)
        .delete(`/api/v1/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Review deleted successfully');
    });

    it('should allow admin to delete any review', async () => {
      const res = await request(app)
        .delete(`/api/v1/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should not allow regular user to delete other\'s review', async () => {
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password123'
      });
      const otherToken = generateToken(otherUser._id);

      const res = await request(app)
        .delete(`/api/v1/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .delete(`/api/v1/reviews/${reviewId}`);

      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/v1/reviews/:id/approve', () => {
    let reviewId;

    beforeEach(async () => {
      const review = await Review.create({
        user: testUser._id,
        movie: testMovie._id,
        rating: 4,
        title: 'Pending Review',
        comment: 'This review needs approval.',
        isApproved: false
      });
      reviewId = review._id;
    });

    it('should allow admin to approve review', async () => {
      const res = await request(app)
        .put(`/api/v1/reviews/${reviewId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isApproved).toBe(true);
    });

    it('should not allow regular user to approve review', async () => {
      const res = await request(app)
        .put(`/api/v1/reviews/${reviewId}/approve`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .put(`/api/v1/reviews/${reviewId}/approve`);

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/reviews/pending', () => {
    beforeEach(async () => {
      await Review.create({
        user: testUser._id,
        movie: testMovie._id,
        rating: 4,
        title: 'Pending Review',
        comment: 'This review needs approval.',
        isApproved: false
      });

      await Review.create({
        user: testUser._id,
        movie: testMovie._id,
        rating: 5,
        title: 'Approved Review',
        comment: 'This review is approved.',
        isApproved: true
      });
    });

    it('should allow admin to get pending reviews', async () => {
      const res = await request(app)
        .get('/api/v1/reviews/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reviews).toHaveLength(1);
      expect(res.body.data.reviews[0].title).toBe('Pending Review');
      expect(res.body.data.reviews[0].isApproved).toBe(false);
    });

    it('should not allow regular user to get pending reviews', async () => {
      const res = await request(app)
        .get('/api/v1/reviews/pending')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/v1/reviews/pending');

      expect(res.statusCode).toBe(401);
    });
  });
});