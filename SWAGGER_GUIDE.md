# Swagger API Documentation Guide

## Accessing Swagger UI

Once the server is running, you can access the interactive Swagger UI at:

```
http://localhost:5000/api-docs
```

## Features

- **Interactive API Testing**: Test all endpoints directly from the browser
- **Request/Response Examples**: See example requests and responses
- **Authentication**: Built-in JWT token management
- **Parameter Documentation**: Clear documentation for all query parameters and request bodies

## How to Use

### 1. Register a New User

1. Navigate to the **Authentication** section
2. Click on `POST /api/auth/register`
3. Click "Try it out"
4. Fill in the request body:
   ```json
   {
     "username": "testuser",
     "email": "test@example.com",
     "password": "password123"
   }
   ```
5. Click "Execute"
6. Copy the `token` from the response

### 2. Authenticate Requests

1. Click the green "Authorize" button at the top
2. Paste your JWT token in the format: `Bearer <your-token>`
3. Click "Authorize"
4. Now all protected endpoints will automatically include your token

### 3. Test Protected Endpoints

Once authenticated, you can test:

- **User Profile**: `GET /api/users/profile`
- **Get Movies**: `GET /api/movies`
- **Create Review**: `POST /api/reviews`
- **Add to Favorites**: `POST /api/users/favorites`
- And more...

## API Sections

### Authentication
- Register new user
- Login
- Get current user info

### Movies
- Get all movies (with search, filter, sort, pagination)
- Get popular/trending/top-rated movies
- Get movie statistics
- Create/update/delete movies (Admin only)
- Increment view count

### Users
- Get user profile with stats
- Manage watch history
- Manage favorites
- Get personalized recommendations

### Reviews
- Create reviews
- Get reviews for a movie
- Update/delete reviews
- Approve reviews (Admin only)

## Example Workflows

### Workflow 1: Browse and Review a Movie

1. **Get Popular Movies**
   - Endpoint: `GET /api/movies/popular`
   - No authentication needed

2. **Get Movie Details**
   - Endpoint: `GET /api/movies/{id}`
   - Copy a movie ID from the previous response

3. **Increment View Count**
   - Endpoint: `PUT /api/movies/{id}/view`
   - Requires authentication

4. **Create a Review**
   - Endpoint: `POST /api/reviews`
   - Requires authentication
   - Body:
     ```json
     {
       "movieId": "<movie-id>",
       "rating": 5,
       "title": "Amazing Movie",
       "comment": "This movie was absolutely fantastic and kept me engaged throughout."
     }
     ```

### Workflow 2: Manage Favorites

1. **Add to Favorites**
   - Endpoint: `POST /api/users/favorites`
   - Body: `{ "movieId": "<movie-id>" }`

2. **Get Favorites**
   - Endpoint: `GET /api/users/favorites`

3. **Get Recommendations**
   - Endpoint: `GET /api/users/recommendations`
   - Based on your watch history and favorites

### Workflow 3: Admin Operations

1. **Create a Movie** (Admin only)
   - Endpoint: `POST /api/movies`
   - Body:
     ```json
     {
       "title": "New Movie",
       "description": "Movie description",
       "genre": ["Action", "Sci-Fi"],
       "director": "Director Name",
       "releaseYear": 2024,
       "duration": 120,
       "rating": 8.5
     }
     ```

2. **Get Pending Reviews** (Admin only)
   - Endpoint: `GET /api/reviews/pending`

3. **Approve a Review** (Admin only)
   - Endpoint: `PUT /api/reviews/{id}/approve`

## Query Parameters Examples

### Search and Filter Movies

```
GET /api/movies?search=action&genre=Action&minRating=8&sortBy=rating&sortOrder=desc&page=1&limit=10
```

Parameters:
- `search`: Search in title, description, genre
- `genre`: Filter by specific genre
- `year`: Filter by release year
- `minRating` / `maxRating`: Rating range
- `minDuration` / `maxDuration`: Duration range in minutes
- `director`: Filter by director name
- `sortBy`: Field to sort by (default: createdAt)
- `sortOrder`: asc or desc (default: desc)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

## Tips

1. **Save Your Token**: After login, save the token somewhere safe for testing
2. **Use Try It Out**: Click "Try it out" to test endpoints with real data
3. **Check Response Codes**: Look at the response status code to understand the result
4. **Read Error Messages**: Error responses contain helpful messages
5. **Explore Schemas**: Click on schema names to see the data structure

## Troubleshooting

### 401 Unauthorized
- Make sure you've clicked "Authorize" and entered your token correctly
- Check that your token hasn't expired (default: 7 days)

### 403 Forbidden
- You don't have permission for this action
- Admin endpoints require admin role

### 404 Not Found
- The resource doesn't exist
- Check the ID is correct

### 400 Bad Request
- Validation error in your request
- Check the error message for details

## Server Status

- **Development**: `http://localhost:5000`
- **API Base**: `http://localhost:5000/api`
- **Swagger UI**: `http://localhost:5000/api-docs`

## Next Steps

1. Start the server: `npm run dev`
2. Open Swagger UI: `http://localhost:5000/api-docs`
3. Register a user and get a token
4. Authorize with your token
5. Start testing the API
