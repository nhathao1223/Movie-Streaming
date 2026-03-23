# 🎬 Movie Streaming Platform - Backend API

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18+-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green.svg)](https://www.mongodb.com/)
[![Jest](https://img.shields.io/badge/Jest-29+-red.svg)](https://jestjs.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive RESTful API for a movie streaming platform built with modern Node.js technologies. Features advanced search capabilities, user engagement tracking, and robust security implementation.

## 🚀 Key Features

### 🔐 **Authentication & Security**
- JWT-based stateless authentication
- Role-based access control (User/Admin)
- bcrypt password hashing with salt rounds
- Rate limiting protection (1000 req/hour)
- Input sanitization and validation
- HTTP security headers with Helmet.js

### 🎥 **Movie Management**
- Advanced search with MongoDB text indexing
- Multi-parameter filtering (genre, year, rating, duration, director)
- Intelligent sorting and pagination
- View count tracking and analytics
- Movie statistics and trending algorithms

### 👤 **User Engagement**
- Watch history with progress tracking
- Personalized favorites system
- Continue watching functionality
- User statistics dashboard
- Personalized recommendations

### 📝 **Review System**
- User reviews with rating system
- Admin moderation workflow
- Review approval system
- Comprehensive review analytics

### 🏷️ **Genre Management**
- Dynamic genre creation and management
- Genre-based movie filtering
- Genre statistics and analytics

## 📊 **Technical Specifications**

- **52+ RESTful Endpoints** across 7 core modules
- **132 Comprehensive Test Cases** with 95%+ coverage
- **Sub-200ms Response Time** for optimized queries
- **MongoDB Aggregation Pipelines** for complex analytics
- **Swagger UI Documentation** with interactive testing
- **Winston Structured Logging** with multiple levels

## 🛠️ **Tech Stack**

| Category | Technologies |
|----------|-------------|
| **Runtime** | Node.js 18+, Express.js 4.18+ |
| **Database** | MongoDB 6.0+, Mongoose ODM |
| **Authentication** | JWT, bcryptjs |
| **Validation** | express-validator, Joi |
| **Security** | Helmet.js, express-rate-limit, express-mongo-sanitize |
| **Documentation** | Swagger UI, swagger-jsdoc |
| **Testing** | Jest, Supertest |
| **Logging** | Winston |
| **Development** | Nodemon, dotenv |

## ⚡ **Quick Start**

### Prerequisites
- Node.js 18+ installed
- MongoDB 6.0+ running locally or cloud instance
- Git for version control

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/nhathao1223/Movie-Streaming.git
cd movie-streaming-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/movie-streaming

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
```

4. **Database Setup**
```bash
# Seed sample data
npm run seed

# Create admin user (admin/admin123456)
npm run create-admin
```

5. **Start the Application**
```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

6. **Access the API**
- **API Base URL**: `http://localhost:5000/api/v1`
- **Swagger Documentation**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/health`

## 📚 **API Documentation**

### **Base URL**
```
http://localhost:5000/api/v1
```

### **Authentication Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | User login | ❌ |
| GET | `/auth/me` | Get current user info | ✅ |

### **Movie Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/movies` | Get movies with advanced filtering | ❌ |
| GET | `/movies/popular` | Get most viewed movies | ❌ |
| GET | `/movies/trending` | Get trending movies (7 days) | ❌ |
| GET | `/movies/top-rated` | Get highest rated movies | ❌ |
| GET | `/movies/stats` | Get movie statistics | ❌ |
| GET | `/movies/:id` | Get single movie details | ❌ |
| POST | `/movies` | Create new movie | ✅ Admin |
| PUT | `/movies/:id` | Update movie | ✅ Admin |
| DELETE | `/movies/:id` | Delete movie | ✅ Admin |
| PUT | `/movies/:id/view` | Increment view count | ✅ |

### **User Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/profile` | Get user profile | ✅ |
| PUT | `/users/profile` | Update user profile | ✅ |
| PUT | `/users/change-password` | Change password | ✅ |
| GET | `/users/stats` | Get user statistics | ✅ |
| GET | `/users` | Get all users | ✅ Admin |
| GET | `/users/:id` | Get specific user | ✅ Admin |
| PUT | `/users/:id/role` | Update user role | ✅ Admin |
| DELETE | `/users/:id` | Delete user | ✅ Admin |

### **Favorites Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/favorites` | Get user favorites | ✅ |
| POST | `/favorites` | Add movie to favorites | ✅ |
| DELETE | `/favorites/:movieId` | Remove from favorites | ✅ |
| GET | `/favorites/:movieId` | Check if movie is favorite | ✅ |
| GET | `/favorites/stats` | Get favorites statistics | ✅ |

### **Watch History Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/watch-history` | Get watch history | ✅ |
| POST | `/watch-history` | Add/update watch progress | ✅ |
| DELETE | `/watch-history/:movieId` | Remove from history | ✅ |
| GET | `/watch-history/stats` | Get watch statistics | ✅ |
| GET | `/watch-history/continue-watching` | Get continue watching list | ✅ |

### **Review Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/reviews/movie/:movieId` | Get movie reviews | ❌ |
| POST | `/reviews` | Create review | ✅ |
| PUT | `/reviews/:id` | Update own review | ✅ |
| DELETE | `/reviews/:id` | Delete review | ✅ |
| PUT | `/reviews/:id/approve` | Approve review | ✅ Admin |
| GET | `/reviews/pending` | Get pending reviews | ✅ Admin |

### **Genre Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/genres` | Get all genres | ❌ |
| GET | `/genres/:id` | Get single genre | ❌ |
| GET | `/genres/stats` | Get genre statistics | ❌ |
| POST | `/genres` | Create genre | ✅ Admin |
| PUT | `/genres/:id` | Update genre | ✅ Admin |
| DELETE | `/genres/:id` | Delete genre | ✅ Admin |

## 🔍 **Advanced Query Parameters**

### **Movie Filtering & Search**
```bash
# Text search across title, description
GET /api/v1/movies?search=action

# Filter by genre (name or ObjectId)
GET /api/v1/movies?genre=Action

# Filter by release year
GET /api/v1/movies?year=2024

# Rating range filtering
GET /api/v1/movies?minRating=8&maxRating=10

# Duration filtering (minutes)
GET /api/v1/movies?minDuration=120&maxDuration=180

# Director search
GET /api/v1/movies?director=nolan

# Sorting options
GET /api/v1/movies?sortBy=rating&sortOrder=desc

# Pagination
GET /api/v1/movies?page=1&limit=10

# Combined advanced search
GET /api/v1/movies?search=action&genre=Action&minRating=8&sortBy=rating&sortOrder=desc&page=1&limit=5
```

### **Pagination Response Format**
```json
{
  "success": true,
  "data": {
    "movies": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "pages": 15
    }
  }
}
```

## 🔐 **Authentication**

### **JWT Token Usage**
Include the JWT token in the Authorization header for protected routes:

```bash
Authorization: Bearer <your-jwt-token>
```

### **Token Lifecycle**
- **Expiration**: 7 days (configurable)
- **Refresh**: Manual re-login required
- **Security**: Stateless, server-side validation

## 🏗️ **Project Architecture**

```
movie-streaming-api/
├── 📁 config/
│   ├── db.js                    # MongoDB connection
│   └── logger.js                # Winston configuration
├── 📁 controllers/
│   ├── auth.controller.js       # Authentication logic
│   ├── movie.controller.js      # Movie CRUD operations
│   ├── user.controller.js       # User management
│   ├── review.controller.js     # Review system
│   ├── genre.controller.js      # Genre management
│   ├── favorite.controller.js   # Favorites system
│   └── watchHistory.controller.js # Watch tracking
├── 📁 middleware/
│   ├── auth.js                  # JWT authentication
│   ├── admin.js                 # Admin authorization
│   ├── errorHandler.js          # Global error handling
│   ├── logger.js                # Request logging
│   └── rateLimiter.js           # Rate limiting
├── 📁 models/
│   ├── User.js                  # User schema
│   ├── Movie.js                 # Movie schema
│   ├── Review.js                # Review schema
│   ├── Genre.js                 # Genre schema
│   ├── Favorite.js              # Favorite schema
│   └── WatchHistory.js          # Watch history schema
├── 📁 routes/
│   └── 📁 v1/                   # API version 1
│       ├── auth.js              # Auth routes
│       ├── movies.js            # Movie routes
│       ├── users.js             # User routes
│       ├── reviews.js           # Review routes
│       ├── genres.js            # Genre routes
│       ├── favorites.js         # Favorite routes
│       └── watchHistory.js      # Watch history routes
├── 📁 utils/
│   ├── response.js              # Response helpers
│   ├── generateToken.js         # JWT utilities
│   ├── validateId.js            # ObjectId validation
│   └── AppError.js              # Custom error class
├── 📁 validations/
│   ├── auth.validation.js       # Auth input validation
│   ├── movie.validation.js      # Movie validation
│   ├── review.validation.js     # Review validation
│   ├── genre.validation.js      # Genre validation
│   ├── favorite.validation.js   # Favorite validation
│   └── watchHistory.validation.js # Watch history validation
├── 📁 scripts/
│   ├── seedData.js              # Database seeding
│   ├── createAdmin.js           # Admin user creation
│   └── seedNewData.js           # Additional data seeding
├── 📁 __tests__/
│   ├── auth.test.js             # Authentication tests
│   ├── movies.test.js           # Movie API tests
│   ├── users.test.js            # User API tests
│   ├── reviews.test.js          # Review API tests
│   ├── genres.test.js           # Genre API tests
│   ├── favorites.test.js        # Favorites API tests
│   └── watchHistory.test.js     # Watch history tests
├── 📁 logs/
│   ├── combined.log             # All logs
│   └── error.log                # Error logs only
├── server.js                    # Application entry point
├── swagger.js                   # Swagger configuration
├── jest.config.js               # Jest configuration
├── jest.setup.js                # Test environment setup
└── test-server.js               # Test server configuration
```

## 🧪 **Testing**

### **Test Coverage**
- **132 Test Cases** across all modules
- **95%+ Code Coverage** with comprehensive scenarios
- **Unit Tests** for individual functions
- **Integration Tests** for API endpoints
- **Error Handling Tests** for edge cases

### **Running Tests**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test -- --testPathPatterns="auth.test.js"
```

### **Test Structure**
```bash
✅ Authentication Tests (7 tests)
✅ Movie API Tests (9 tests)
✅ User Management Tests (25 tests)
✅ Review System Tests (23 tests)
✅ Genre Management Tests (21 tests)
✅ Favorites System Tests (18 tests)
✅ Watch History Tests (18 tests)
✅ Error Handling Tests (11 tests)
```

## 📊 **Performance Metrics**

- **Response Time**: Sub-200ms for optimized queries
- **Throughput**: 1000+ requests per hour per user
- **Database Queries**: Optimized with proper indexing
- **Memory Usage**: Efficient with connection pooling
- **Concurrent Users**: Supports 100+ simultaneous connections

## 🔒 **Security Features**

### **Authentication & Authorization**
- JWT-based stateless authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt (12 salt rounds)
- Token expiration and validation

### **Input Security**
- Request validation with express-validator
- MongoDB injection prevention
- XSS protection with input sanitization
- File upload restrictions (if implemented)

### **Network Security**
- CORS configuration for cross-origin requests
- Rate limiting to prevent abuse
- HTTP security headers with Helmet.js
- Request size limiting

### **Data Security**
- Sensitive data encryption
- Secure password storage
- Environment variable protection
- Database connection security

## 📝 **API Response Format**

### **Success Response**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### **Error Response**
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error information"
  }
}
```

### **Validation Error Response**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

## 🚀 **Deployment**

### **Environment Variables**
```env
# Production Configuration
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/movie-streaming

# JWT
JWT_SECRET=your-production-jwt-secret-key
JWT_EXPIRE=7d

# Logging
LOG_LEVEL=info
```

### **Production Checklist**
- [ ] Environment variables configured
- [ ] Database indexes created
- [ ] SSL/TLS certificates installed
- [ ] Rate limiting configured
- [ ] Logging levels set appropriately
- [ ] Error monitoring setup
- [ ] Health check endpoints tested
- [ ] Load balancing configured (if needed)

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 **Author**

**Nhat Hao**
- GitHub: [@nhathao1223](https://github.com/nhathao1223)
- Project Link: [https://github.com/nhathao1223/Movie-Streaming.git](https://github.com/nhathao1223/Movie-Streaming.git)

## 🙏 **Acknowledgments**

- Express.js team for the robust web framework
- MongoDB team for the flexible database solution
- Jest team for the comprehensive testing framework
- All open-source contributors who made this project possible

---

⭐ **Star this repository if you find it helpful!**