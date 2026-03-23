const express = require('express');
const Movie = require('../../models/Movie');
const { sendSuccess } = require('../../utils/response');
const auth = require('../../middleware/auth');
const { SAMPLE_IDS, SAMPLE_MOVIE, SAMPLE_REVIEW, SAMPLE_USER, SAMPLE_LOGIN, ADMIN_LOGIN, TEST_USER_LOGIN, SAMPLE_AUTH_HEADERS, SAMPLE_ADD_FAVORITE, SAMPLE_ADD_WATCH_HISTORY } = require('../../utils/sampleData');

const router = express.Router();

/**
 * @swagger
 * /api/v1/samples/ids:
 *   get:
 *     summary: Get sample ObjectIds for testing
 *     tags: [Samples]
 *     responses:
 *       200:
 *         description: Sample ObjectIds from actual database
 */
router.get('/ids', async (req, res) => {
  try {
    // Get actual movie IDs from database
    const movies = await Movie.find({ isActive: true }).limit(3).select('_id title');
    
    const sampleIds = {
      movies: movies.map(movie => ({
        id: movie._id,
        title: movie.title
      })),
      staticSamples: SAMPLE_IDS,
      usage: {
        movieId: movies[0]?._id || SAMPLE_IDS.MOVIE_ID,
        examples: {
          getMovie: `/api/v1/movies/${movies[0]?._id || SAMPLE_IDS.MOVIE_ID}`,
          getReviews: `/api/v1/reviews/movie/${movies[0]?._id || SAMPLE_IDS.MOVIE_ID}`,
          addToFavorites: {
            url: '/api/v1/users/favorites',
            body: { movieId: movies[0]?._id || SAMPLE_IDS.MOVIE_ID }
          }
        }
      }
    };

    sendSuccess(res, sampleIds, 'Sample IDs retrieved');
  } catch (error) {
    sendSuccess(res, {
      staticSamples: SAMPLE_IDS,
      note: 'Using static sample IDs (database not available)'
    });
  }
});

/**
 * @swagger
 * /api/v1/samples/data:
 *   get:
 *     summary: Get sample request bodies for testing
 *     tags: [Samples]
 *     responses:
 *       200:
 *         description: Sample data for POST/PUT requests
 */
router.get('/data', (req, res) => {
  const sampleData = {
    movie: SAMPLE_MOVIE,
    review: SAMPLE_REVIEW,
    user: SAMPLE_USER,
    login: SAMPLE_LOGIN,
    adminLogin: ADMIN_LOGIN,
    testUserLogin: TEST_USER_LOGIN,
    authHeaders: SAMPLE_AUTH_HEADERS,
    addFavorite: SAMPLE_ADD_FAVORITE,
    addWatchHistory: SAMPLE_ADD_WATCH_HISTORY,
    usage: {
      authentication: {
        step1: {
          description: "Login to get token",
          url: "POST /api/v1/auth/login",
          body: ADMIN_LOGIN,
          response: "Copy the 'token' from response"
        },
        step2: {
          description: "Use token in Authorization header",
          header: "Authorization: Bearer YOUR_TOKEN_HERE"
        }
      },
      createMovie: {
        url: 'POST /api/v1/movies',
        headers: SAMPLE_AUTH_HEADERS,
        body: SAMPLE_MOVIE,
        note: "Requires Admin role"
      },
      createReview: {
        url: 'POST /api/v1/reviews',
        headers: SAMPLE_AUTH_HEADERS,
        body: SAMPLE_REVIEW,
        note: "Requires User authentication"
      },
      addToFavorites: {
        url: 'POST /api/v1/users/favorites',
        headers: SAMPLE_AUTH_HEADERS,
        body: SAMPLE_ADD_FAVORITE
      },
      addToWatchHistory: {
        url: 'POST /api/v1/users/watch-history',
        headers: SAMPLE_AUTH_HEADERS,
        body: SAMPLE_ADD_WATCH_HISTORY
      },
      register: {
        url: 'POST /api/v1/auth/register',
        body: SAMPLE_USER
      }
    }
  };

  sendSuccess(res, sampleData, 'Sample data retrieved');
});

/**
 * @swagger
 * /api/v1/samples/reviews:
 *   get:
 *     summary: Get sample review IDs for testing
 *     tags: [Samples]
 *     responses:
 *       200:
 *         description: Sample review IDs from actual database
 */
router.get('/reviews', async (req, res) => {
  try {
    const Review = require('../../models/Review');
    
    // Get actual review IDs from database
    const reviews = await Review.find().limit(3).select('_id movie user rating title isApproved').populate('movie', 'title').populate('user', 'username');
    
    const sampleReviews = {
      reviews: reviews.map(review => ({
        id: review._id,
        movieTitle: review.movie?.title || 'Unknown Movie',
        username: review.user?.username || 'Unknown User',
        rating: review.rating,
        title: review.title,
        isApproved: review.isApproved
      })),
      usage: {
        updateReview: reviews[0] ? `/api/v1/reviews/${reviews[0]._id}` : '/api/v1/reviews/REVIEW_ID',
        approveReview: reviews[0] ? `/api/v1/reviews/${reviews[0]._id}/approve` : '/api/v1/reviews/REVIEW_ID/approve',
        sampleUpdateBody: {
          title: "Updated Review Title",
          comment: "Updated review comment",
          rating: 4
        }
      }
    };

    sendSuccess(res, sampleReviews, 'Sample review IDs retrieved');
  } catch (error) {
    sendSuccess(res, {
      note: 'No reviews found in database. Create a review first.',
      createReviewFirst: {
        url: 'POST /api/v1/reviews',
        headers: { Authorization: 'Bearer YOUR_TOKEN' },
        body: {
          movieId: 'VALID_MOVIE_ID',
          rating: 5,
          title: 'Great Movie',
          comment: 'Amazing film!'
        }
      }
    });
  }
});

/**
 * @swagger
 * /api/v1/samples/admin-apis:
 *   get:
 *     summary: Get list of Admin-only APIs
 *     tags: [Samples]
 *     responses:
 *       200:
 *         description: List of APIs that require Admin role
 */
router.get('/admin-apis', (req, res) => {
  const adminApis = {
    movies: {
      create: {
        method: 'POST',
        endpoint: '/api/v1/movies',
        description: 'Create new movie',
        requiredRole: 'admin',
        sampleBody: SAMPLE_MOVIE
      },
      update: {
        method: 'PUT', 
        endpoint: '/api/v1/movies/{movieId}',
        description: 'Update existing movie',
        requiredRole: 'admin',
        sampleBody: {
          title: 'Updated Movie Title',
          description: 'Updated description',
          rating: 9.0
        }
      },
      delete: {
        method: 'DELETE',
        endpoint: '/api/v1/movies/{movieId}',
        description: 'Delete movie (soft delete)',
        requiredRole: 'admin'
      }
    },
    reviews: {
      getPending: {
        method: 'GET',
        endpoint: '/api/v1/reviews/pending',
        description: 'Get all pending reviews for approval',
        requiredRole: 'admin'
      },
      approve: {
        method: 'PUT',
        endpoint: '/api/v1/reviews/{reviewId}/approve',
        description: 'Approve a review',
        requiredRole: 'admin'
      },
      deleteAny: {
        method: 'DELETE',
        endpoint: '/api/v1/reviews/{reviewId}',
        description: 'Delete any review (users can only delete their own)',
        requiredRole: 'admin'
      }
    },
    authentication: {
      adminLogin: ADMIN_LOGIN,
      requiredHeader: 'Authorization: Bearer ADMIN_TOKEN'
    },
    errorResponses: {
      noToken: {
        status: 401,
        message: 'Access denied. No token provided'
      },
      notAdmin: {
        status: 403,
        message: 'Access denied. Admin role required'
      },
      invalidToken: {
        status: 403,
        message: 'Invalid token'
      }
    }
  };

  sendSuccess(res, adminApis, 'Admin-only APIs retrieved');
});

/**
 * @swagger
 * /api/v1/samples/genres:
 *   get:
 *     summary: Get sample genre data for testing
 *     tags: [Samples]
 *     responses:
 *       200:
 *         description: Sample genre data and existing genres
 */
router.get('/genres', async (req, res) => {
  try {
    const Genre = require('../../models/Genre');
    
    // Get existing genres
    const existingGenres = await Genre.find({ isActive: true })
      .select('name slug description')
      .sort({ name: 1 });
    
    // Sample new genres that don't exist yet
    const sampleNewGenres = [
      {
        name: "Mystery",
        description: "Mysterious and puzzling storylines"
      },
      {
        name: "Western",
        description: "Stories set in the American Old West"
      },
      {
        name: "Musical",
        description: "Movies featuring songs and musical performances"
      },
      {
        name: "War",
        description: "Military conflicts and wartime stories"
      },
      {
        name: "Biography",
        description: "Life stories of real people"
      }
    ];
    
    // Filter out genres that already exist
    const existingNames = existingGenres.map(g => g.name.toLowerCase());
    const availableNewGenres = sampleNewGenres.filter(
      genre => !existingNames.includes(genre.name.toLowerCase())
    );
    
    const sampleData = {
      existingGenres: existingGenres,
      availableNewGenres: availableNewGenres,
      usage: {
        createGenre: {
          method: 'POST',
          endpoint: '/api/v1/genres',
          headers: { Authorization: 'Bearer ADMIN_TOKEN' },
          body: availableNewGenres[0] || {
            name: "New Genre Name",
            description: "Description for the new genre"
          }
        },
        updateGenre: existingGenres[0] ? {
          method: 'PUT',
          endpoint: `/api/v1/genres/${existingGenres[0]._id}`,
          headers: { Authorization: 'Bearer ADMIN_TOKEN' },
          body: {
            name: existingGenres[0].name,
            description: "Updated description"
          }
        } : null,
        filterMoviesByGenre: existingGenres[0] ? {
          method: 'GET',
          endpoint: `/api/v1/movies?genre=${existingGenres[0].slug}`,
          description: `Filter movies by ${existingGenres[0].name} genre`
        } : null
      }
    };

    sendSuccess(res, sampleData, 'Sample genre data retrieved');
  } catch (error) {
    sendSuccess(res, {
      note: 'Error retrieving genre data',
      sampleGenre: {
        name: "Mystery",
        description: "Mysterious and puzzling storylines"
      }
    });
  }
});

/**
 * @swagger
 * /api/v1/samples/auth-test:
 *   get:
 *     summary: Test authentication status
 *     tags: [Samples]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authentication successful
 *       401:
 *         description: Authentication required
 */
router.get('/auth-test', auth, (req, res) => {
  sendSuccess(res, {
    message: 'Authentication successful!',
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    },
    tokenInfo: {
      isValid: true,
      expiresIn: '7 days from login'
    }
  }, 'You are successfully authenticated');
});

module.exports = router;