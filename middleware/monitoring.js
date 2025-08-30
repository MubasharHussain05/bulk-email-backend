const { logger, metrics } = require('../config/monitoring');

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  logger.info('Request started', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Override res.end to capture response
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - start;
    
    // Update metrics
    metrics.requests.total++;
    if (res.statusCode >= 200 && res.statusCode < 400) {
      metrics.requests.success++;
    } else {
      metrics.requests.errors++;
    }

    // Log response
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    });

    originalEnd.apply(this, args);
  };

  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  metrics.requests.errors++;
  next(err);
};

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;
    
    if (duration > 1000) { // Log slow requests (>1s)
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.url,
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode
      });
    }
  });
  
  next();
};

module.exports = {
  requestLogger,
  errorLogger,
  performanceMonitor
};