# 📚 Hướng Dẫn Chi Tiết Test API với Postman

## 📋 Mục Lục
1. [Chuẩn bị](#chuẩn-bị)
2. [Import Collection](#import-collection)
3. [Cấu hình Environment](#cấu-hình-environment)
4. [Test từng API](#test-từng-api)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 Chuẩn Bị

### Bước 1: Khởi động Server
```bash
# Terminal 1: Chạy server
npm run dev

# Kết quả mong đợi:
# Server running on port 5000
# MongoDB connected
```

### Bước 2: Tạo Admin User
```bash
# Terminal 2: Tạo admin
npm run create-admin

# Kết quả:
# Admin user created successfully
# Username: admin
# Password: admin123456
```

### Bước 3: Load Sample Data
```bash
# Terminal 2: Load movies
npm run seed

# Kết quả:
# Sample movies loaded successfully
# 10 movies created
```

---

## 📥 Import Collection

### Cách 1: Import từ File
1. **Mở Postman**
2. **Click "Import"** (góc trái, dưới logo Postman)
   ```
   ┌─────────────────┐
   │ File  Edit View │
   │ Import ← Click  │
   └─────────────────┘
   ```
3. **Chọn "Upload Files"**
4. **Chọn file `postman_collection.json`**
5. **Click "Import"**

### Cách 2: Import từ Link
Nếu file được lưu online, paste URL vào

**Kết quả sau import:**
```
Collections
├── Movie Streaming API
    ├── Authentication
    ├── Movies - Special Routes
    ├── Movies - CRUD
    ├── Reviews
    └── User Features
```

---

## ⚙️ Cấu hình Environment

### Bước 1: Tạo Environment
1. **Click "Environments"** (góc phải)
   ```
   ┌──────────────────┐
   │ Environments ← Click
   │ No environment
   └──────────────────┘
   ```
2. **Click "+"** để tạo environment mới
3. **Đặt tên:** `Movie API Dev`
4. **Thêm variables:**

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `token` | (để trống) | (sẽ fill sau) |
| `adminToken` | (để trống) | (sẽ fill sau) |
| `movieId` | (để trống) | (sẽ fill sau) |
| `reviewId` | (để trống) | (sẽ fill sau) |

5. **Click "Save"**

### Bước 2: Chọn Environment
1. **Góc phải trên**, chọn dropdown
2. **Chọn "Movie API Dev"**
3. **Xác nhận:** Tên environment hiển thị ở góc phải

---

## 🧪 Test từng API

### 📌 PHẦN 1: AUTHENTICATION

#### 1.1 Register User (Tạo tài khoản)

**Request:**
```
Method: POST
URL: http://localhost:5000/api/auth/register
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

**Cách làm trong Postman:**
1. Click vào request "Register User"
2. Tab **Body** → Chọn **raw** → Chọn **JSON**
3. Paste body trên
4. **Click Send**

**Response mong đợi (200 OK):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "testuser",
    "email": "test@example.com",
    "role": "user"
  }
}
```

---

#### 1.2 Login User (Đăng nhập)

**Request:**
```
Method: POST
URL: http://localhost:5000/api/auth/login
```

**Body (JSON):**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response mong đợi (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "testuser",
    "email": "test@example.com",
    "role": "user"
  }
}
```

**⚠️ QUAN TRỌNG: Lưu token**
1. Copy giá trị `token` từ response
2. Vào **Environments** → **Movie API Dev**
3. Paste vào **Current Value** của `token`
4. **Save**

---

#### 1.3 Login Admin (Đăng nhập Admin)

**Body (JSON):**
```json
{
  "email": "admin@example.com",
  "password": "admin123456"
}
```

**Sau khi login:**
1. Copy token từ response
2. Vào **Environments** → **Movie API Dev**
3. Paste vào **Current Value** của `adminToken`
4. **Save**

---

#### 1.4 Get Current User (Lấy thông tin user)

**Request:**
```
Method: GET
URL: http://localhost:5000/api/auth/me
```

**Headers:**
```
Authorization: Bearer {{token}}
```

**Cách làm:**
1. Click request "Get Current User"
2. Tab **Headers** → Đã có sẵn `Authorization: Bearer {{token}}`
3. **Click Send**

**Response mong đợi (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "testuser",
    "email": "test@example.com",
    "role": "user"
  }
}
```

---

### 📌 PHẦN 2: MOVIES - SPECIAL ROUTES (ĐÃ FIX)

#### 2.1 Get Movie Stats

**Request:**
```
Method: GET
URL: http://localhost:5000/api/movies/stats
```

**Headers:** (không cần)

**Response mong đợi (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalMovies": 10,
    "totalViews": 1250,
    "genreDistribution": [
      { "_id": "Action", "count": 3 },
      { "_id": "Drama", "count": 2 }
    ],
    "yearDistribution": [
      { "_id": 2024, "count": 5 },
      { "_id": 2023, "count": 5 }
    ]
  }
}
```

**✅ Kiểm tra:** Route này giờ hoạt động đúng (không bị treat như `:id`)

---

#### 2.2 Get Popular Movies

**Request:**
```
Method: GET
URL: http://localhost:5000/api/movies/popular?limit=5
```

**Query Parameters:**
| Key | Value |
|-----|-------|
| limit | 5 |

**Response mong đợi (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Inception",
      "director": "Christopher Nolan",
      "viewCount": 500,
      "rating": 8.8
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "The Dark Knight",
      "director": "Christopher Nolan",
      "viewCount": 450,
      "rating": 9.0
    }
  ]
}
```

---

#### 2.3 Get Trending Movies

**Request:**
```
Method: GET
URL: http://localhost:5000/api/movies/trending?limit=5
```

**Response:** Tương tự Popular Movies

---

#### 2.4 Get Top Rated Movies

**Request:**
```
Method: GET
URL: http://localhost:5000/api/movies/top-rated?limit=5
```

**Response:** Tương tự Popular Movies

---

### 📌 PHẦN 3: MOVIES - CRUD

#### 3.1 Get All Movies

**Request:**
```
Method: GET
URL: http://localhost:5000/api/movies?page=1&limit=10
```

**Query Parameters:**
| Key | Value |
|-----|-------|
| page | 1 |
| limit | 10 |

**Response mong đợi (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Inception",
      "description": "A skilled thief...",
      "genre": ["Action", "Sci-Fi"],
      "releaseYear": 2010,
      "director": "Christopher Nolan",
      "duration": 148,
      "rating": 8.8,
      "viewCount": 500
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 10,
    "pages": 1
  }
}
```

---

#### 3.2 Search Movies

**Request:**
```
Method: GET
URL: http://localhost:5000/api/movies?search=inception&page=1&limit=10
```

**Query Parameters:**
| Key | Value |
|-----|-------|
| search | inception |
| page | 1 |
| limit | 10 |

**Response:** Chỉ movies có "inception" trong title/description

---

#### 3.3 Filter by Genre

**Request:**
```
Method: GET
URL: http://localhost:5000/api/movies?genre=Action&minRating=8&sortBy=rating&sortOrder=desc
```

**Query Parameters:**
| Key | Value |
|-----|-------|
| genre | Action |
| minRating | 8 |
| sortBy | rating |
| sortOrder | desc |

**Response:** Movies genre Action, rating >= 8, sorted by rating descending

---

#### 3.4 Filter by Director

**Request:**
```
Method: GET
URL: http://localhost:5000/api/movies?director=nolan&minDuration=120&maxDuration=180
```

**Query Parameters:**
| Key | Value |
|-----|-------|
| director | nolan |
| minDuration | 120 |
| maxDuration | 180 |

**Response:** Movies của Nolan, duration 120-180 phút

---

#### 3.5 Get Single Movie

**Request:**
```
Method: GET
URL: http://localhost:5000/api/movies/{{movieId}}
```

**Cách lấy movieId:**
1. Chạy "Get All Movies"
2. Copy `_id` từ response
3. Vào **Environments** → **Movie API Dev**
4. Paste vào **Current Value** của `movieId`
5. **Save**

**Response mong đợi (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Inception",
    "description": "A skilled thief...",
    "genre": ["Action", "Sci-Fi"],
    "releaseYear": 2010,
    "director": "Christopher Nolan",
    "duration": 148,
    "rating": 8.8,
    "viewCount": 500
  }
}
```

---

#### 3.6 Create Movie (Admin Only)

**Request:**
```
Method: POST
URL: http://localhost:5000/api/movies
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{adminToken}}
```

**Body (JSON):**
```json
{
  "title": "Oppenheimer",
  "description": "The story of J. Robert Oppenheimer",
  "genre": ["Drama", "History"],
  "releaseYear": 2023,
  "director": "Christopher Nolan",
  "duration": 180,
  "rating": 8.5,
  "poster": "https://example.com/oppenheimer.jpg",
  "trailer": "https://example.com/oppenheimer-trailer.mp4"
}
```

**Response mong đợi (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439099",
    "title": "Oppenheimer",
    "description": "The story of J. Robert Oppenheimer",
    "genre": ["Drama", "History"],
    "releaseYear": 2023,
    "director": "Christopher Nolan",
    "duration": 180,
    "rating": 8.5,
    "viewCount": 0,
    "isActive": true
  }
}
```

**⚠️ Lỗi có thể gặp:**
- **401 Unauthorized** → Token admin không đúng
- **403 Forbidden** → User không phải admin

---

#### 3.7 Update Movie (Admin Only)

**Request:**
```
Method: PUT
URL: http://localhost:5000/api/movies/{{movieId}}
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{adminToken}}
```

**Body (JSON):**
```json
{
  "rating": 9.0,
  "description": "Updated description"
}
```

**Response mong đợi (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Inception",
    "rating": 9.0,
    "description": "Updated description"
  }
}
```

---

#### 3.8 Delete Movie (Admin Only)

**Request:**
```
Method: DELETE
URL: http://localhost:5000/api/movies/{{movieId}}
```

**Headers:**
```
Authorization: Bearer {{adminToken}}
```

**Response mong đợi (200 OK):**
```json
{
  "success": true,
  "message": "Movie deleted successfully"
}
```

**Note:** Đây là soft delete (isActive = false), movie vẫn trong DB

---

#### 3.9 Increment View Count

**Request:**
```
Method: PUT
URL: http://localhost:5000/api/movies/{{movieId}}/view
```

**Headers:**
```
Authorization: Bearer {{token}}
```

**Response mong đợi (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Inception",
    "viewCount": 501
  }
}
```

**Tác dụng:** Tăng viewCount và thêm vào watch history của user

---

### 📌 PHẦN 4: REVIEWS (ĐÃ FIX)

#### 4.1 Create Review

**Request:**
```
Method: POST
URL: http://localhost:5000/api/reviews
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (JSON):**
```json
{
  "movieId": "{{movieId}}",
  "rating": 5,
  "title": "Amazing Movie!",
  "comment": "This is an absolutely fantastic movie with great storyline and excellent acting performances"
}
```

**Response mong đợi (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439050",
    "movie": "507f1f77bcf86cd799439011",
    "user": {
      "_id": "507f1f77bcf86cd799439001",
      "username": "testuser"
    },
    "rating": 5,
    "title": "Amazing Movie!",
    "comment": "This is an absolutely fantastic movie...",
    "isApproved": false,
    "createdAt": "2024-02-23T10:30:00Z"
  }
}
```

**⚠️ Lỗi có thể gặp:**
- **400 Bad Request** → Validation error (rating phải 1-5, comment >= 10 ký tự)
- **404 Not Found** → Movie không tồn tại

---

#### 4.2 Get Reviews for Movie

**Request:**
```
Method: GET
URL: http://localhost:5000/api/reviews/movie/{{movieId}}?page=1&limit=10
```

**Query Parameters:**
| Key | Value |
|-----|-------|
| page | 1 |
| limit | 10 |
| sortBy | createdAt |

**Response mong đợi (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439050",
      "movie": "507f1f77bcf86cd799439011",
      "user": {
        "_id": "507f1f77bcf86cd799439001",
        "username": "testuser"
      },
      "rating": 5,
      "title": "Amazing Movie!",
      "comment": "This is an absolutely fantastic movie...",
      "isApproved": true
    }
  ],
  "stats": {
    "avgRating": 4.5,
    "totalReviews": 2
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "pages": 1
  }
}
```

**✅ Kiểm tra:** Route này giờ hoạt động đúng (không bị treat như `:movieId`)

---

#### 4.3 Get My Reviews

**Request:**
```
Method: GET
URL: http://localhost:5000/api/reviews/user/my-reviews
```

**Headers:**
```
Authorization: Bearer {{token}}
```

**Response mong đợi (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439050",
      "movie": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Inception",
        "poster": "https://example.com/inception.jpg"
      },
      "rating": 5,
      "title": "Amazing Movie!",
      "comment": "This is an absolutely fantastic movie...",
      "isApproved": true,
      "createdAt": "2024-02-23T10:30:00Z"
    }
  ]
}
```

**✅ Kiểm tra:** Route này giờ hoạt động đúng (không bị treat như `:movieId`)

---

#### 4.4 Get Pending Reviews (Admin Only)

**Request:**
```
Method: GET
URL: http://localhost:5000/api/reviews/pending
```

**Headers:**
```
Authorization: Bearer {{adminToken}}
```

**Response mong đợi (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439050",
      "movie": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Inception"
      },
      "user": {
        "_id": "507f1f77bcf86cd799439001",
        "username": "testuser"
      },
      "rating": 5,
      "title": "Amazing Movie!",
      "comment": "This is an absolutely fantastic movie...",
      "isApproved": false,
      "createdAt": "2024-02-23T10:30:00Z"
    }
  ]
}
```

---

#### 4.5 Update Review

**Request:**
```
Method: PUT
URL: http://localhost:5000/api/reviews/{{reviewId}}
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (JSON):**
```json
{
  "rating": 4,
  "comment": "Updated review comment - still a great movie"
}
```

**Cách lấy reviewId:**
1. Chạy "Get My Reviews"
2. Copy `_id` từ response
3. Vào **Environments** → **Movie API Dev**
4. Paste vào **Current Value** của `reviewId`
5. **Save**

**Response mong đợi (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439050",
    "rating": 4,
    "comment": "Updated review comment - still a great movie",
    "isApproved": true
  }
}
```

---

#### 4.6 Delete Review

**Request:**
```
Method: DELETE
URL: http://localhost:5000/api/reviews/{{reviewId}}
```

**Headers:**
```
Authorization: Bearer {{token}}
```

**Response mong đợi (200 OK):**
```json
{
  "success": true,
  "message": "Review deleted"
}
```

---

#### 4.7 Approve Review (Admin Only)

**Request:**
```
Method: PUT
URL: http://localhost:5000/api/reviews/{{reviewId}}/approve
```

**Headers:**
```
Authorization: Bearer {{adminToken}}
```

**Response mong đợi (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439050",
    "isApproved": true,
    "rating": 5,
    "title": "Amazing Movie!"
  }
}
```

---

### 📌 PHẦN 5: USER FEATURES

#### 5.1 Get User Profile

**Request:**
```
Method: GET
URL: http://localhost:5000/api/users/profile
```

**Headers:**
```
Authorization: Bearer {{token}}
```

**Response mong đợi (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439001",
    "username": "testuser",
    "email": "test@example.com",
    "watchHistoryCount": 5,
    "favoritesCount": 3,
    "reviewsCount": 2,
    "totalWatchTime": 720
  }
}
```

---

#### 5.2 Add to Watch History

**Request:**
```
Method: POST
URL: http://localhost:5000/api/users/watch-history
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (JSON):**
```json
{
  "movieId": "{{movieId}}"
}
```

**Response mong đợi (200 OK):**
```json
{
  "success": true,
  "message": "Added to watch history"
}
```

---

#### 5.3 Get Watch History

**Request:**
```
Method: GET
URL: http://localhost:5000/api/users/watch-history
```

**Headers:**
```
Authorization: Bearer {{token}}
```

**Response mong đợi (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "movie": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Inception",
        "poster": "https://example.com/inception.jpg"
      },
      "watchedAt": "2024-02-23T10:30:00Z"
    }
  ]
}
```

---

#### 5.4 Remove from Watch History

**Request:**
```
Method: DELETE
URL: http://localhost:5000/api/users/watch-history/{{movieId}}
```

**Headers:**
```
Authorization: Bearer {{token}}
```

**Response mong đợi (200 OK):**
```json
{
  "success": true,
  "message": "Removed from watch history"
}
```

---

#### 5.5 Add to Favorites

**Request:**
```
Method: POST
URL: http://localhost:5000/api/users/favorites
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (JSON):**
```json
{
  "movieId": "{{movieId}}"
}
```

**Response mong đợi (200 OK):**
```json
{
  "success": true,
  "message": "Added to favorites"
}
```

---

#### 5.6 Get Favorites

**Request:**
```
Method: GET
URL: http://localhost:5000/api/users/favorites
```

**Headers:**
```
Authorization: Bearer {{token}}
```

**Response mong đợi (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Inception",
      "director": "Christopher Nolan",
      "rating": 8.8,
      "poster": "https://example.com/inception.jpg"
    }
  ]
}
```

---

#### 5.7 Get Recommendations

**Request:**
```
Method: GET
URL: http://localhost:5000/api/users/recommendations
```

**Headers:**
```
Authorization: Bearer {{token}}
```

**Response mong đợi (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "The Dark Knight",
      "director": "Christopher Nolan",
      "genre": ["Action", "Crime"],
      "rating": 9.0,
      "poster": "https://example.com/dark-knight.jpg"
    }
  ]
}
```

**Note:** Recommendations dựa trên genres của movies đã xem

---

## 🔍 Troubleshooting

### Lỗi: 401 Unauthorized

**Nguyên nhân:** Token không hợp lệ hoặc hết hạn

**Giải pháp:**
1. Đăng nhập lại
2. Copy token mới
3. Update variable `token` hoặc `adminToken`

---

### Lỗi: 404 Not Found

**Nguyên nhân:** Resource không tồn tại

**Giải pháp:**
- Kiểm tra movieId/reviewId có đúng không
- Chạy "Get All Movies" để lấy movieId mới

---

### Lỗi: 400 Bad Request

**Nguyên nhân:** Validation error

**Giải pháp:**
- Kiểm tra body request
- Xem error message trong response
- Ví dụ: rating phải 1-5, comment >= 10 ký tự

---

### Lỗi: 403 Forbidden

**Nguyên nhân:** Không có quyền (không phải admin)

**Giải pháp:**
- Dùng adminToken thay vì token
- Hoặc tạo admin account mới

---

### Lỗi: Server Error (500)

**Nguyên nhân:** Lỗi server

**Giải pháp:**
1. Kiểm tra MongoDB đang chạy
2. Xem console của server
3. Restart server: `npm run dev`

---

## ✅ Checklist Test Hoàn Chỉnh

- [ ] Register user
- [ ] Login user
- [ ] Get current user
- [ ] Get movie stats ✅ (đã fix)
- [ ] Get popular movies
- [ ] Get trending movies
- [ ] Get top rated movies
- [ ] Get all movies
- [ ] Search movies
- [ ] Filter by genre
- [ ] Filter by director
- [ ] Get single movie
- [ ] Create movie (admin)
- [ ] Update movie (admin)
- [ ] Delete movie (admin)
- [ ] Increment view count
- [ ] Create review
- [ ] Get reviews for movie
- [ ] Get my reviews ✅ (đã fix)
- [ ] Get pending reviews ✅ (đã fix)
- [ ] Update review
- [ ] Delete review
- [ ] Approve review (admin)
- [ ] Get user profile
- [ ] Add to watch history
- [ ] Get watch history
- [ ] Remove from watch history
- [ ] Add to favorites
- [ ] Get favorites
- [ ] Get recommendations

---

## 📞 Cần Giúp?

Nếu gặp vấn đề:
1. Kiểm tra console của server
2. Xem response error message
3. Kiểm tra MongoDB connection
4. Restart server và thử lại
