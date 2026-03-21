const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const genreRoutes = require('../routes/v1/genres');
const Genre = require('../models/Genre');
const Movie = require('../models/Movie');
const User = require('../models/User');
const errorHandler = require('../middleware/errorHandler');
const generateToken = require('../utils/generateToken');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/v1/genres', genreRoutes);
app.use(errorHandler);

describe('Genres Routes', () => {
  let adminUser, adminToken;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-streaming-test');
  });

  afterAll(async () => {
    await Genre.deleteMany({});
    await Movie.deleteMany({});
    await User.deleteMany({});
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clean up
    await Genre.deleteMany({});
    await Movie.deleteMany({});
    await User.deleteMany({});

    // Create admin user
    adminUser = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });

    // Generate admin token
    adminToken = generateToken(adminUser._id);

    // Create test genres
    await Genre.create([
      { name: 'Action', slug: 'action' },
      { name: 'Comedy', slug: 'comedy' },
      { name: 'Drama', slug: 'drama' }
    ]);
  });

  describe('GET /api/v1/genres', () => {
    it('should get all genres', async () => {
      const res = await request(app)
        .get('/api/v1/genres');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.genres).toHaveLength(3);
      expect(res.body.data.genres[0]).toHaveProperty('name');
      expect(res.body.data.genres[0]).toHaveProperty('slug');
    });

    it('should paginate genres', async () => {
      const res = await request(app)
        .get('/api/v1/genres?page=1&limit=2');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.genres).toHaveLength(2);
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.limit).toBe(2);
      expect(res.body.data.pagination.total).toBe(3);
    });

    it('should search genres by name', async () => {
      const res = await request(app)
        .get('/api/v1/genres?search=act');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.genres).toHaveLength(1);
      expect(res.body.data.genres[0].name).toBe('Action');
    });

    it('should sort genres by name', async () => {
      const res = await request(app)
        .get('/api/v1/genres?sortBy=name&sortOrder=asc');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.genres[0].name).toBe('Action');
      expect(res.body.data.genres[1].name).toBe('Comedy');
      expect(res.body.data.genres[2].name).toBe('Drama');
    });
  });

  describe('GET /api/v1/genres/:id', () => {
    let genreId;

    beforeEach(async () => {
      const genre = await Genre.findOne({ name: 'Action' });
      genreId = genre._id;
    });

    it('should get a single genre', async () => {
      const res = await request(app)
        .get(`/api/v1/genres/${genreId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Action');
      expect(res.body.data.slug).toBe('action');
    });

    it('should return 404 for non-existent genre', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/v1/genres/${fakeId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Genre not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app)
        .get('/api/v1/genres/invalid-id');

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/v1/genres', () => {
    const genreData = {
      name: 'Horror',
      description: 'Scary movies that frighten and thrill'
    };

    it('should create a new genre (admin only)', async () => {
      const res = await request(app)
        .post('/api/v1/genres')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(genreData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Horror');
      expect(res.body.data.slug).toBe('horror');
      expect(res.body.data.description).toBe(genreData.description);
    });

    it('should not allow duplicate genre names', async () => {
      const res = await request(app)
        .post('/api/v1/genres')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Action' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Genre already exists');
    });

    it('should require admin authentication', async () => {
      const regularUser = await User.create({
        username: 'user',
        email: 'user@example.com',
        password: 'password123',
        role: 'user'
      });
      const userToken = generateToken(regularUser._id);

      const res = await request(app)
        .post('/api/v1/genres')
        .set('Authorization', `Bearer ${userToken}`)
        .send(genreData);

      expect(res.statusCode).toBe(403);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/v1/genres')
        .send(genreData);

      expect(res.statusCode).toBe(401);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/v1/genres')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
    });

    it('should validate name length', async () => {
      const res = await request(app)
        .post('/api/v1/genres')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'A' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('PUT /api/v1/genres/:id', () => {
    let genreId;

    beforeEach(async () => {
      const genre = await Genre.findOne({ name: 'Action' });
      genreId = genre._id;
    });

    it('should update a genre (admin only)', async () => {
      const updateData = {
        name: 'Action & Adventure',
        description: 'High-energy movies with thrills and excitement'
      };

      const res = await request(app)
        .put(`/api/v1/genres/${genreId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Action & Adventure');
      expect(res.body.data.slug).toBe('action-adventure');
      expect(res.body.data.description).toBe(updateData.description);
    });

    it('should not allow duplicate names when updating', async () => {
      const res = await request(app)
        .put(`/api/v1/genres/${genreId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Comedy' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Genre name already exists');
    });

    it('should require admin authentication', async () => {
      const regularUser = await User.create({
        username: 'user',
        email: 'user@example.com',
        password: 'password123',
        role: 'user'
      });
      const userToken = generateToken(regularUser._id);

      const res = await request(app)
        .put(`/api/v1/genres/${genreId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Genre' });

      expect(res.statusCode).toBe(403);
    });

    it('should return 404 for non-existent genre', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/v1/genres/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Genre' });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/v1/genres/:id', () => {
    let genreId;

    beforeEach(async () => {
      const genre = await Genre.findOne({ name: 'Comedy' });
      genreId = genre._id;
    });

    it('should delete a genre (admin only)', async () => {
      const res = await request(app)
        .delete(`/api/v1/genres/${genreId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Genre deleted successfully');
    });

    it('should not delete genre if it has associated movies', async () => {
      // Create a movie with this genre
      await Movie.create({
        title: 'Comedy Movie',
        description: 'A funny movie',
        genre: [genreId],
        director: 'Comedy Director',
        releaseYear: 2024,
        duration: 90,
        rating: 7.0,
        isActive: true
      });

      const res = await request(app)
        .delete(`/api/v1/genres/${genreId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Cannot delete genre with associated movies');
    });

    it('should require admin authentication', async () => {
      const regularUser = await User.create({
        username: 'user',
        email: 'user@example.com',
        password: 'password123',
        role: 'user'
      });
      const userToken = generateToken(regularUser._id);

      const res = await request(app)
        .delete(`/api/v1/genres/${genreId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should return 404 for non-existent genre', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/v1/genres/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/v1/genres/stats', () => {
    beforeEach(async () => {
      const actionGenre = await Genre.findOne({ name: 'Action' });
      const comedyGenre = await Genre.findOne({ name: 'Comedy' });

      // Create movies with genres
      await Movie.create([
        {
          title: 'Action Movie 1',
          description: 'An action movie',
          genre: [actionGenre._id],
          director: 'Action Director',
          releaseYear: 2024,
          duration: 120,
          rating: 8.0,
          isActive: true
        },
        {
          title: 'Action Movie 2',
          description: 'Another action movie',
          genre: [actionGenre._id],
          director: 'Action Director',
          releaseYear: 2024,
          duration: 110,
          rating: 7.5,
          isActive: true
        },
        {
          title: 'Comedy Movie',
          description: 'A comedy movie',
          genre: [comedyGenre._id],
          director: 'Comedy Director',
          releaseYear: 2024,
          duration: 90,
          rating: 7.0,
          isActive: true
        }
      ]);
    });

    it('should get genre statistics', async () => {
      const res = await request(app)
        .get('/api/v1/genres/stats');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalGenres).toBe(3);
      expect(res.body.data.genreMovieCounts).toBeDefined();
      expect(res.body.data.genreMovieCounts).toHaveLength(3);
      
      const actionGenreStats = res.body.data.genreMovieCounts.find(g => g.name === 'Action');
      expect(actionGenreStats.movieCount).toBe(2);
      
      const comedyGenreStats = res.body.data.genreMovieCounts.find(g => g.name === 'Comedy');
      expect(comedyGenreStats.movieCount).toBe(1);
    });
  });
});