# Testing Guide

## 📋 Test Files Created

Đã tạo các file test cho tất cả chức năng chính:

### 1. Authentication Tests (`__tests__/auth.test.js`)
- ✅ User registration
- ✅ User login
- ✅ Input validation
- ✅ Error handling

### 2. Movies Tests (`__tests__/movies.test.js`)
- ✅ Get all movies with filters
- ✅ Get single movie
- ✅ Popular movies
- ✅ Movie statistics
- ✅ Pagination and search

### 3. Favorites Tests (`__tests__/favorites.test.js`)
- ✅ Get user favorites
- ✅ Add movie to favorites
- ✅ Remove from favorites
- ✅ Check favorite status
- ✅ Favorites statistics
- ✅ Authentication & authorization

### 4. Reviews Tests (`__tests__/reviews.test.js`)
- ✅ Create review
- ✅ Update own review
- ✅ Delete review
- ✅ Get movie reviews
- ✅ Admin approve reviews
- ✅ Get pending reviews (admin only)
- ✅ Validation & permissions

### 5. Watch History Tests (`__tests__/watchHistory.test.js`)
- ✅ Get watch history
- ✅ Add to watch history
- ✅ Update progress
- ✅ Remove from history
- ✅ Continue watching list
- ✅ Watch statistics

### 6. Genres Tests (`__tests__/genres.test.js`)
- ✅ CRUD operations (admin only)
- ✅ Get all genres with filters
- ✅ Genre statistics
- ✅ Validation & permissions

### 7. Users Tests (`__tests__/users.test.js`)
- ✅ User profile management
- ✅ Change password
- ✅ User statistics
- ✅ Admin user management
- ✅ Role management (admin only)

## 🚀 How to Run Tests

### Prerequisites
```bash
# Install dependencies (if not already installed)
npm install

# Make sure you have a test database
# Set MONGODB_URI in .env or use default test database
```

### Run All Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run custom test runner
node run-tests.js
```

### Run Specific Test Files
```bash
# Run specific test file
npx jest __tests__/auth.test.js

# Run specific test suite
npx jest __tests__/favorites.test.js --verbose

# Run tests matching pattern
npx jest favorites
```

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)
```javascript
module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**'
  ],
  verbose: true
};
```

### Test Database
Tests use a separate test database to avoid affecting development data:
- Default: `mongodb://localhost:27017/movie-streaming-test`
- Override with `MONGODB_URI` environment variable

## 📊 Test Coverage

Run with coverage to see which parts of your code are tested:
```bash
npm run test:coverage
```

This will generate a coverage report showing:
- Line coverage
- Function coverage
- Branch coverage
- Statement coverage

## 🛠️ Test Structure

Each test file follows this pattern:

```javascript
describe('Feature Routes', () => {
  beforeAll(async () => {
    // Connect to test database
  });

  afterAll(async () => {
    // Clean up and disconnect
  });

  beforeEach(async () => {
    // Set up test data for each test
  });

  describe('Specific endpoint', () => {
    it('should do something', async () => {
      // Test implementation
    });
  });
});
```

## 🔍 Test Categories

### Unit Tests
- Test individual functions and methods
- Mock external dependencies
- Fast execution

### Integration Tests
- Test API endpoints end-to-end
- Use real database (test database)
- Test authentication and authorization
- Validate request/response formats

### Test Data
Each test creates its own test data and cleans up after itself:
- Users with different roles (user, admin)
- Movies with various properties
- Genres, favorites, reviews, watch history
- Authentication tokens

## 🚨 Common Issues & Solutions

### 1. Database Connection Issues
```bash
# Make sure MongoDB is running
mongod

# Check connection string in .env
MONGODB_URI=mongodb://localhost:27017/movie-streaming-test
```

### 2. Port Already in Use
Tests don't start a server, they use supertest to test routes directly.

### 3. Authentication Errors
Tests generate JWT tokens using the same `generateToken` utility as the app.

### 4. Timeout Issues
```bash
# Increase Jest timeout if needed
npx jest --testTimeout=10000
```

### 5. Memory Leaks
```bash
# Run with detectOpenHandles to find leaks
npx jest --detectOpenHandles
```

## 📈 Test Metrics

Current test coverage includes:
- **Controllers**: All major endpoints tested
- **Authentication**: Login, registration, token validation
- **Authorization**: Role-based access control
- **Validation**: Input validation and error handling
- **Database Operations**: CRUD operations
- **Business Logic**: Favorites, reviews, watch history

## 🎯 Best Practices

1. **Isolation**: Each test is independent
2. **Clean Up**: Tests clean up their data
3. **Realistic Data**: Use realistic test data
4. **Error Cases**: Test both success and error scenarios
5. **Authentication**: Test with different user roles
6. **Validation**: Test input validation thoroughly

## 📝 Adding New Tests

When adding new features, create corresponding tests:

1. Create test file in `__tests__/` directory
2. Follow existing naming convention: `feature.test.js`
3. Include setup/teardown code
4. Test all endpoints and edge cases
5. Update this README

## 🔄 Continuous Integration

Tests can be integrated into CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: |
    npm install
    npm test
```

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server) (for isolated testing)

---

**Happy Testing! 🧪**