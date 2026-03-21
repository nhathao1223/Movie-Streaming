# API Testing Guide

## Quick Start

### 1. Get Sample Data
```bash
GET /api/v1/samples/ids     # Get real ObjectIds from database
GET /api/v1/samples/data    # Get sample request bodies
```

### 2. Authentication

#### Login as Admin
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123456"
}
```

#### Login as Test User
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "testuser@example.com", 
  "password": "testpass123"
}
```

### 3. Use Token in Requests
Copy the `token` from login response and use in Authorization header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

## Common Test Scenarios

### Movies API

#### Get All Movies
```bash
GET /api/v1/movies
```

#### Get Single Movie (use real ObjectId)
```bash
GET /api/v1/movies/69bce1af070646b13b793f80
```

#### Create Movie (Admin only)
```bash
POST /api/v1/movies
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "title": "The Dark Knight",
  "description": "When the menace known as the Joker wreaks havoc...",
  "genre": ["Action", "Crime", "Drama"],
  "releaseYear": 2008,
  "duration": 152,
  "director": "Christopher Nolan",
  "cast": ["Christian Bale", "Heath Ledger"],
  "rating": 9.0
}
```

### Reviews API

#### Get Reviews for Movie
```bash
GET /api/v1/reviews/movie/69bce1af070646b13b793f80
```

#### Create Review (User authentication required)
```bash
POST /api/v1/reviews
Authorization: Bearer YOUR_USER_TOKEN
Content-Type: application/json

{
  "movieId": "69bce1af070646b13b793f80",
  "rating": 5,
  "title": "Amazing Movie",
  "comment": "Great performances and direction!"
}
```

#### Update Review (Owner only)
```bash
PUT /api/v1/reviews/REVIEW_ID
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Updated Review Title",
  "comment": "Updated review comment with more details",
  "rating": 4
}
```

#### Approve Review (Admin only)
```bash
PUT /api/v1/reviews/REVIEW_ID/approve
Authorization: Bearer YOUR_ADMIN_TOKEN
```

#### Get Sample Review IDs
```bash
GET /api/v1/samples/reviews
```

### Users API

#### Get User Profile
```bash
GET /api/v1/users/profile
Authorization: Bearer YOUR_TOKEN
```

#### Add to Favorites
```bash
POST /api/v1/users/favorites
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "movieId": "69bce1af070646b13b793f80"
}
```

#### Add to Watch History
```bash
POST /api/v1/users/watch-history
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "movieId": "69bce1af070646b13b793f80"
}
```

#### Remove from Watch History
```bash
DELETE /api/v1/users/watch-history/69bce1af070646b13b793f80
Authorization: Bearer YOUR_TOKEN
```

## Error Handling

### Invalid ObjectId Format
```bash
GET /api/v1/movies/123
# Returns: 400 Bad Request
# "Invalid id format. Must be a valid MongoDB ObjectId (24 hex characters)"
```

### Missing Authentication
```bash
POST /api/v1/movies
# Returns: 401 Unauthorized
# "Access denied. No token provided"
```

### Insufficient Permissions
```bash
PUT /api/v1/reviews/REVIEW_ID
Authorization: Bearer OTHER_USER_TOKEN
# Returns: 403 Forbidden  
# "Access denied. You can only update your own reviews"
```

### Invalid Review Data
```bash
POST /api/v1/reviews
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "movieId": "69bce1af070646b13b793f80",
  "rating": 10,
  "title": "Bad",
  "comment": "Short"
}
# Returns: 400 Bad Request
# Validation errors for rating (1-5), title (5-100 chars), comment (10-1000 chars)
```

## Available Accounts

- **Admin**: admin@example.com / admin123456 (Full access to all APIs)
- **Simple User**: simpleuser@example.com / password123 (Limited access)

## Admin-Only APIs

### Movies Management (Admin Only)
- **Create Movie**: `POST /api/v1/movies` 🔒
- **Update Movie**: `PUT /api/v1/movies/{id}` 🔒  
- **Delete Movie**: `DELETE /api/v1/movies/{id}` 🔒

### Review Management (Admin Only)
- **Get Pending Reviews**: `GET /api/v1/reviews/pending` 🔒
- **Approve Review**: `PUT /api/v1/reviews/{id}/approve` 🔒
- **Delete Any Review**: `DELETE /api/v1/reviews/{id}` 🔒

### Get Admin APIs List
```bash
GET /api/v1/samples/admin-apis
```

## Swagger Documentation

Visit: http://localhost:5000/api-docs

## Useful Endpoints

- **Health Check**: GET /api
- **Sample IDs**: GET /api/v1/samples/ids
- **Sample Data**: GET /api/v1/samples/data
- **Sample Reviews**: GET /api/v1/samples/reviews
- **Admin APIs List**: GET /api/v1/samples/admin-apis 🔒
- **Seed Database**: POST /api/seed

## Admin Testing

### Test Admin APIs
```bash
node scripts/testAdminApis.js
```

### Quick Admin Test
```bash
# 1. Login as Admin
POST /api/v1/auth/login
{"email": "admin@example.com", "password": "admin123456"}

# 2. Create Movie (Admin only)
POST /api/v1/movies
Authorization: Bearer ADMIN_TOKEN
{"title": "Test Movie", "description": "Test...", "genre": ["Action"], "releaseYear": 2024, "duration": 120, "director": "Test Director"}

# 3. Try with User token (should fail with 403)
POST /api/v1/movies  
Authorization: Bearer USER_TOKEN
```

## Review Testing Notes

1. **Rating Range**: Reviews use 1-5 rating scale (not 1-10)
2. **Ownership**: Users can only update/delete their own reviews
3. **Admin Privileges**: Admins can delete any review and approve reviews
4. **Validation**: Title (5-100 chars), Comment (10-1000 chars)
5. **Get Review IDs**: Use `/api/v1/samples/reviews` to get actual review IDs for testing

## 🔒 Admin-Only APIs

### Admin Authentication
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123456"
}
```

### Movie Management (Admin Only)
```bash
# Create Movie
POST /api/v1/movies
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "title": "New Movie",
  "description": "Movie description",
  "genre": ["Action", "Drama"],
  "releaseYear": 2024,
  "duration": 120,
  "director": "Director Name",
  "cast": ["Actor 1", "Actor 2"],
  "rating": 8.5
}

# Update Movie
PUT /api/v1/movies/{movieId}
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

# Delete Movie
DELETE /api/v1/movies/{movieId}
Authorization: Bearer ADMIN_TOKEN
```

### Review Management (Admin Only)
```bash
# Get Pending Reviews
GET /api/v1/reviews/pending
Authorization: Bearer ADMIN_TOKEN

# Approve Review
PUT /api/v1/reviews/{reviewId}/approve
Authorization: Bearer ADMIN_TOKEN

# Delete Any Review
DELETE /api/v1/reviews/{reviewId}
Authorization: Bearer ADMIN_TOKEN
```

### Admin Error Responses
- **403 Forbidden**: Not admin role
- **401 Unauthorized**: Invalid/missing token

### Testing Admin APIs
1. Login as admin to get token
2. Use token in Authorization header
3. Test with user token (should fail with 403)