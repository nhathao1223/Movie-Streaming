const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const userRoutes = require('../routes/v1/users');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Genre = require('../models/Genre');
const Favorite = require('../models/Favorite');
const WatchHistory = require('../models/WatchHistory');
const errorHandler = require('../middleware/errorHandler');
const generateToken = require('../utils/generateToken');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/v1/users', userRoutes);
app.use(errorHandler);

describe('Users Routes', () => {
  let testUser, adminUser, testMovie, testGenre, userToken, adminToken;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-streaming-test');
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Genre.deleteMany({});
    await Favorite.deleteMany({});
    await WatchHistory.deleteMany({});
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clean up
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Genre.deleteMany({});
    await Favorite.deleteMany({});
    await WatchHistory.deleteMany({});

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

  describe('GET /api/v1/users/profile', () => {
    it('should get user profile', async () => {
      const res = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.username).toBe('testuser');
      expect(res.body.data.email).toBe('test@example.com');
      expect(res.body.data.role).toBe('user');
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/v1/users/profile');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/v1/users/profile', () => {
    it('should update user profile', async () => {
      const updateData = {
        username: 'updateduser',
        email: 'updated@example.com'
      };

      const res = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.username).toBe('updateduser');
      expect(res.body.data.email).toBe('updated@example.com');
    });

    it('should not allow duplicate username', async () => {
      // Create another user
      await User.create({
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ username: 'existinguser' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Username already exists');
    });

    it('should not allow duplicate email', async () => {
      // Create another user
      await User.create({
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ email: 'existing@example.com' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Email already exists');
    });

    it('should validate email format', async () => {
      const res = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ email: 'invalid-email' });

      expect(res.statusCode).toBe(400);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .put('/api/v1/users/profile')
        .send({ username: 'newname' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/v1/users/change-password', () => {
    it('should change password with correct current password', async () => {
      const passwordData = {
        currentPassword: 'password123',
        newPassword: 'newpassword123'
      };

      const res = await request(app)
        .put('/api/v1/users/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send(passwordData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Password changed successfully');
    });

    it('should not change password with incorrect current password', async () => {
      const passwordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      };

      const res = await request(app)
        .put('/api/v1/users/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send(passwordData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Current password is incorrect');
    });

    it('should validate new password length', async () => {
      const passwordData = {
        currentPassword: 'password123',
        newPassword: '123'
      };

      const res = await request(app)
        .put('/api/v1/users/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send(passwordData);

      expect(res.statusCode).toBe(400);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .put('/api/v1/users/change-password')
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/users/stats', () => {
    beforeEach(async () => {
      // Add some favorites and watch history
      await Favorite.create({
        user: testUser._id,
        movie: testMovie._id
      });

      await WatchHistory.create({
        user: testUser._id,
        movie: testMovie._id,
        watchedAt: new Date(),
        progress: 75
      });
    });

    it('should get user statistics', async () => {
      const res = await request(app)
        .get('/api/v1/users/stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalFavorites).toBe(1);
      expect(res.body.data.totalWatched).toBe(1);
      expect(res.body.data.averageRating).toBeDefined();
      expect(res.body.data.favoriteGenres).toBeDefined();
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/v1/users/stats');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/users (Admin only)', () => {
    beforeEach(async () => {
      // Create additional users for testing
      await User.create([
        {
          username: 'user1',
          email: 'user1@example.com',
          password: 'password123',
          role: 'user'
        },
        {
          username: 'user2',
          email: 'user2@example.com',
          password: 'password123',
          role: 'user'
        }
      ]);
    });

    it('should allow admin to get all users', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.users.length).toBeGreaterThanOrEqual(4); // testUser, adminUser, user1, user2
      expect(res.body.data.pagination).toBeDefined();
    });

    it('should paginate users', async () => {
      const res = await request(app)
        .get('/api/v1/users?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.users).toHaveLength(2);
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.limit).toBe(2);
    });

    it('should search users by username or email', async () => {
      const res = await request(app)
        .get('/api/v1/users?search=user1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.users).toHaveLength(1);
      expect(res.body.data.users[0].username).toBe('user1');
    });

    it('should filter users by role', async () => {
      const res = await request(app)
        .get('/api/v1/users?role=admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.users).toHaveLength(1);
      expect(res.body.data.users[0].role).toBe('admin');
    });

    it('should not allow regular user to get all users', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/v1/users');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/users/:id (Admin only)', () => {
    it('should allow admin to get specific user', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.username).toBe('testuser');
      expect(res.body.data.email).toBe('test@example.com');
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/v1/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('User not found');
    });

    it('should not allow regular user to get other users', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${testUser._id}`);

      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/v1/users/:id/role (Admin only)', () => {
    it('should allow admin to update user role', async () => {
      const res = await request(app)
        .put(`/api/v1/users/${testUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('admin');
    });

    it('should validate role value', async () => {
      const res = await request(app)
        .put(`/api/v1/users/${testUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'invalid-role' });

      expect(res.statusCode).toBe(400);
    });

    it('should not allow regular user to update roles', async () => {
      const res = await request(app)
        .put(`/api/v1/users/${testUser._id}/role`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ role: 'admin' });

      expect(res.statusCode).toBe(403);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .put(`/api/v1/users/${testUser._id}/role`)
        .send({ role: 'admin' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('DELETE /api/v1/users/:id (Admin only)', () => {
    let userToDelete;

    beforeEach(async () => {
      userToDelete = await User.create({
        username: 'deleteme',
        email: 'deleteme@example.com',
        password: 'password123',
        role: 'user'
      });
    });

    it('should allow admin to delete user', async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${userToDelete._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User deleted successfully');
    });

    it('should not allow regular user to delete users', async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${userToDelete._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/v1/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${userToDelete._id}`);

      expect(res.statusCode).toBe(401);
    });
  });
});