# 🎬 Movie Streaming Platform — Backend API

A RESTful API for a movie streaming platform built with Node.js, Express.js, and MongoDB.

## Tech Stack

`Node.js` `Express.js` `MongoDB` `Mongoose` `JWT` `Swagger` `Jest` `Winston`

## Features

- **Auth** — JWT authentication, role-based access control (User/Admin)
- **Movies** — CRUD, advanced search & filtering, view tracking, statistics
- **Users** — Profile management, watch history with progress tracking, favorites
- **Reviews** — Create/update/delete reviews, admin moderation workflow
- **Genres** — Genre management with movie association
- **Security** — Helmet.js, rate limiting, input validation, bcrypt, CORS
- **Docs** — Interactive Swagger UI at `/api-docs`
- **Tests** — 132 test cases with Jest & Supertest

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env   # Set MONGODB_URI, JWT_SECRET

# Seed data & create admin
npm run seed
npm run create-admin   # admin / admin123456

# Start development server
npm run dev
```

**API Base URL:** `http://localhost:5000/api/v1`  
**Swagger UI:** `http://localhost:5000`

## API Endpoints

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /auth/register` · `POST /auth/login` · `GET /auth/me` |
| Movies | `GET /movies` · `GET /movies/:id` · `POST /movies` · `PUT /movies/:id` · `DELETE /movies/:id` |
| Movies | `GET /movies/popular` · `GET /movies/trending` · `GET /movies/top-rated` · `GET /movies/stats` |
| Users | `GET /users/profile` · `PUT /users/profile` · `PUT /users/change-password` · `GET /users/stats` |
| Favorites | `GET /favorites` · `POST /favorites` · `DELETE /favorites/:movieId` · `GET /favorites/stats` |
| Watch History | `GET /watch-history` · `POST /watch-history` · `DELETE /watch-history/:movieId` · `GET /watch-history/continue-watching` |
| Reviews | `GET /reviews/movie/:id` · `POST /reviews` · `PUT /reviews/:id` · `DELETE /reviews/:id` |
| Genres | `GET /genres` · `POST /genres` · `PUT /genres/:id` · `DELETE /genres/:id` |

## Movie Query Parameters

```
GET /api/v1/movies?search=inception&genre=Action&minRating=8&sortBy=rating&sortOrder=desc&page=1&limit=10
```

`search` `genre` `year` `minRating` `maxRating` `minDuration` `maxDuration` `director` `sortBy` `sortOrder` `page` `limit`

## Authentication

```
Authorization: Bearer <token>
```

## Testing

```bash
npm test              # Run all tests
npm run test:coverage # Coverage report
```

## License

MIT — [@nhathao1223](https://github.com/nhathao1223)
