const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../test-server');
const Movie = require('../models/Movie');
const Genre = require('../models/Genre');

describe('Movie Routes', () => {
  let actionGenreId, dramaGenreId, comedyGenreId;
  let testMovie;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-streaming-test');
    
    // Create test genres
    const actionGenre = await Genre.create({ name: 'Action', description: 'Action movies' });
    const dramaGenre = await Genre.create({ name: 'Drama', description: 'Drama movies' });
    const comedyGenre = await Genre.create({ name: 'Comedy', description: 'Comedy movies' });
    
    actionGenreId = actionGenre._id;
    dramaGenreId = dramaGenre._id;
    comedyGenreId = comedyGenre._id;

    // Test data with proper genre ObjectIds
    testMovie = {
      title: 'Test Movie',
      description: 'A test movie description',
      genre: [actionGenreId, dramaGenreId],
      director: 'Test Director',
      releaseYear: 2024,
      duration: 120,
      rating: 8.5
    };
  });

  afterAll(async () => {
    await Movie.deleteMany({});
    await Genre.deleteMany({});
    await mongoose.disconnect();
  });

  afterEach(async () => {
    await Movie.deleteMany({});
  });

  describe('GET /api/v1/movies', () => {
    beforeEach(async () => {
      await Movie.create(testMovie);
      await Movie.create({
        ...testMovie,
        title: 'Another Movie',
        genre: [comedyGenreId]
      });
    });

    it('should get all movies', async () => {
      const res = await request(app)
        .get('/api/v1/movies');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.movies.length).toBeGreaterThan(0);
    });

    it('should filter movies by genre', async () => {
      const res = await request(app)
        .get(`/api/v1/movies?genre=${actionGenreId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.movies.length).toBeGreaterThan(0);
    });

    it('should search movies', async () => {
      const res = await request(app)
        .get('/api/v1/movies?search=Test');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.movies.length).toBeGreaterThan(0);
    });

    it('should paginate movies', async () => {
      const res = await request(app)
        .get('/api/v1/movies?page=1&limit=1');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.movies.length).toBe(1);
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.limit).toBe(1);
    });
  });

  describe('GET /api/v1/movies/popular', () => {
    beforeEach(async () => {
      await Movie.create({ ...testMovie, viewCount: 100 });
      await Movie.create({ ...testMovie, title: 'Less Popular', viewCount: 10 });
    });

    it('should get popular movies sorted by views', async () => {
      const res = await request(app)
        .get('/api/v1/movies/popular');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data[0].viewCount).toBeGreaterThanOrEqual(res.body.data[1].viewCount);
    });
  });

  describe('GET /api/v1/movies/stats', () => {
    beforeEach(async () => {
      await Movie.create(testMovie);
    });

    it('should get movie statistics', async () => {
      const res = await request(app)
        .get('/api/v1/movies/stats');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalMovies).toBeGreaterThan(0);
      expect(res.body.data.genreDistribution).toBeDefined();
    });
  });

  describe('GET /api/v1/movies/:id', () => {
    let movieId;

    beforeEach(async () => {
      const movie = await Movie.create(testMovie);
      movieId = movie._id;
    });

    it('should get a single movie', async () => {
      const res = await request(app)
        .get(`/api/v1/movies/${movieId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(testMovie.title);
    });

    it('should return 404 for non-existent movie', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/v1/movies/${fakeId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app)
        .get('/api/v1/movies/invalid-id');

      expect(res.statusCode).toBe(400);
      expect(res.body.error.code).toBe('INVALID_ID');
    });
  });
});
