# Security Features

## Implemented Security Measures

### 1. Helmet.js
Protects against common HTTP vulnerabilities by setting security HTTP headers:
- Content Security Policy (CSP)
- X-Frame-Options (Clickjacking protection)
- X-Content-Type-Options (MIME type sniffing)
- Strict-Transport-Security (HTTPS enforcement)
- And more...

### 2. Rate Limiting
Prevents abuse and brute force attacks:

**General API Rate Limiter**
- 100 requests per 15 minutes per IP
- Applied to all `/api/*` routes

**Auth Rate Limiter (Strict)**
- 5 requests per 15 minutes per IP
- Applied to `/api/auth/register` and `/api/auth/login`
- Only counts failed attempts

**Create Operations Rate Limiter**
- 30 requests per hour per IP
- Applied to POST endpoints (create movie, create review)

### 3. Input Validation
- Express-validator for all inputs
- Sanitization of user inputs
- Type checking and length validation

### 4. Password Security
- bcryptjs for password hashing
- Passwords never stored in plain text
- Secure password comparison

### 5. JWT Authentication
- Secure token-based authentication
- Token expiration (7 days default)
- Protected routes require valid token

### 6. Request Size Limits
- JSON body limit: 10MB
- URL-encoded body limit: 10MB
- Prevents large payload attacks

### 7. CORS Configuration
- Controlled cross-origin requests
- Prevents unauthorized domain access

## Best Practices Implemented

✓ No sensitive data in logs
✓ Error messages don't expose system details
✓ Admin operations require authentication
✓ Soft delete for data integrity
✓ Input validation on all endpoints
✓ Secure headers on all responses

## Environment Variables

Keep these secure in `.env`:
```
JWT_SECRET=your-super-secret-key
MONGODB_URI=your-database-uri
```

Never commit `.env` to version control!

## Recommendations for Production

1. **HTTPS Only**
   - Use SSL/TLS certificates
   - Redirect HTTP to HTTPS

2. **Database Security**
   - Use strong MongoDB credentials
   - Enable authentication
   - Use IP whitelisting

3. **API Keys**
   - Rotate JWT secrets regularly
   - Use environment-specific secrets

4. **Monitoring**
   - Log security events
   - Monitor rate limit violations
   - Track failed authentication attempts

5. **Additional Packages**
   - `express-mongo-sanitize` - Prevent NoSQL injection
   - `express-validator` - Enhanced validation
   - `winston` - Structured logging

## Testing Security

1. Test rate limiting:
   ```bash
   # Make multiple requests quickly
   for i in {1..10}; do curl http://localhost:5000/api/auth/login; done
   ```

2. Test helmet headers:
   ```bash
   curl -i http://localhost:5000/api/movies
   # Check response headers for security headers
   ```

3. Test input validation:
   ```bash
   # Try invalid inputs
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"ab","email":"invalid","password":"123"}'
   ```
