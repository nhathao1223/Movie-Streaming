# Logging System

## Overview

This project uses **Winston** for structured logging with multiple transports and log levels.

## Log Levels

- **error** (0): Critical errors that need immediate attention
- **warn** (1): Warning messages for potential issues
- **info** (2): General information about application flow
- **http** (3): HTTP request/response information
- **debug** (4): Detailed debugging information

## Log Files

Logs are stored in the `logs/` directory:

- **error.log**: Contains only error-level logs (JSON format)
- **combined.log**: Contains all logs (JSON format)
- **Console**: Real-time colored output during development

## Configuration

Logger is configured in `config/logger.js`:

```javascript
// Set log level via environment variable
LOG_LEVEL=debug npm run dev

// Default log level is 'debug'
```

## Usage Examples

### In Controllers

```javascript
const logger = require('../config/logger');

// Log successful operations
logger.info(`User registered: ${email}`);

// Log warnings
logger.warn(`Login failed: Invalid password - ${email}`);

// Log errors
logger.error(`Database error: ${error.message}`);

// Log debug info
logger.debug(`Processing request: ${req.method} ${req.path}`);
```

### In Middleware

```javascript
const logger = require('../config/logger');

// Log HTTP requests
logger.http(`${req.method} ${req.originalUrl}`);

// Log authentication events
logger.info(`User authenticated: ${req.user.id}`);
```

## Log Output Examples

### Console Output (Colored)
```
2024-03-02 10:30:45:123 info: Server running on port 5000
2024-03-02 10:30:46:456 info: MongoDB connected successfully
2024-03-02 10:30:47:789 http: POST /api/auth/login
2024-03-02 10:30:48:012 info: User logged in successfully: user@example.com
2024-03-02 10:30:49:345 error: ValidationError: Email is required
```

### File Output (JSON)
```json
{
  "level": "error",
  "message": "ValidationError: Email is required",
  "timestamp": "2024-03-02 10:30:49:345"
}
```

## What Gets Logged

### Authentication
- User registration (success/failure)
- User login (success/failure)
- Invalid credentials attempts
- Token generation

### Movies
- Movie creation/update/deletion
- Movie not found errors
- Statistics retrieval

### Errors
- Database errors
- Validation errors
- Server errors
- Cast errors (invalid IDs)
- Duplicate key errors

### HTTP Requests
- Request method and URL
- Response status code
- Response time

## Monitoring Logs

### View Real-time Logs
```bash
npm run dev
# Logs appear in console with colors
```

### View Error Logs
```bash
tail -f logs/error.log
```

### View All Logs
```bash
tail -f logs/combined.log
```

### Search Logs
```bash
# Find all login attempts
grep "login" logs/combined.log

# Find all errors
grep "error" logs/error.log

# Find specific user activity
grep "user@example.com" logs/combined.log
```

## Best Practices

1. **Log Important Events**
   - User authentication
   - Data modifications (create, update, delete)
   - Errors and exceptions

2. **Use Appropriate Log Levels**
   - `error`: Critical issues
   - `warn`: Potential problems
   - `info`: Important events
   - `debug`: Detailed information

3. **Include Context**
   - User ID or email
   - Resource ID
   - Operation type
   - Error details

4. **Don't Log Sensitive Data**
   - Never log passwords
   - Never log full credit card numbers
   - Never log API keys

5. **Structured Logging**
   - Use consistent message format
   - Include relevant context
   - Use JSON format for file logs

## Production Considerations

1. **Log Rotation**
   - Consider using `winston-daily-rotate-file` for log rotation
   - Prevents logs from growing too large

2. **Log Aggregation**
   - Use services like ELK Stack, Splunk, or CloudWatch
   - Centralize logs from multiple servers

3. **Monitoring & Alerts**
   - Set up alerts for error logs
   - Monitor error rates
   - Track performance metrics

4. **Log Retention**
   - Define retention policies
   - Archive old logs
   - Comply with data regulations

## Example: Adding Logging to New Features

```javascript
// In your controller
const logger = require('../config/logger');

exports.myNewFeature = async (req, res) => {
  try {
    logger.debug(`Starting myNewFeature for user: ${req.user.id}`);
    
    // Your business logic
    const result = await doSomething();
    
    logger.info(`myNewFeature completed successfully for user: ${req.user.id}`);
    sendSuccess(res, result);
  } catch (error) {
    logger.error(`myNewFeature error: ${error.message}`);
    sendError(res, 'Server error', 500);
  }
};
```

## Troubleshooting

### Logs Not Appearing
1. Check `LOG_LEVEL` environment variable
2. Verify `logs/` directory exists
3. Check file permissions

### Too Many Logs
1. Increase `LOG_LEVEL` to 'info' or 'warn'
2. Reduce debug logging in production
3. Implement log rotation

### Performance Issues
1. Reduce log verbosity
2. Use async file transports
3. Implement log sampling for high-traffic endpoints
