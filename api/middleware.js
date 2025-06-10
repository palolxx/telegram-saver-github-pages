/**
 * Middleware functions for the Express server
 */

/**
 * Error handling middleware
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err.stack);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
}

/**
 * Request logging middleware
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  
  // Log request details
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  
  // Log request body if it exists and isn't a file upload
  if (req.body && Object.keys(req.body).length > 0 && !req.is('multipart/form-data')) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  
  // Capture the original end method
  const originalEnd = res.end;
  
  // Override the end method to log response time
  res.end = function(...args) {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    
    // Call the original end method
    return originalEnd.apply(this, args);
  };
  
  next();
}

/**
 * CORS middleware
 */
function corsMiddleware(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
}

/**
 * Authentication middleware for protected routes
 * This is a simple example - in a real app, you'd use proper authentication
 */
function authMiddleware(req, res, next) {
  // This is just a placeholder for a real authentication system
  // In a real app, you'd verify tokens, check user permissions, etc.
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
}

module.exports = {
  errorHandler,
  requestLogger,
  corsMiddleware,
  authMiddleware
};