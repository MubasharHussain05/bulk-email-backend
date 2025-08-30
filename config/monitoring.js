const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

// Create logs directory if it doesn't exist
const fs = require('fs');
const path = require('path');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'bulk-email-service' },
  transports: [
    // Error logs
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d'
    }),
    // Combined logs
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    }),
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Monitoring metrics
const metrics = {
  requests: {
    total: 0,
    success: 0,
    errors: 0,
    lastReset: new Date()
  },
  emails: {
    sent: 0,
    failed: 0,
    lastReset: new Date()
  },
  system: {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    lastCheck: new Date()
  }
};

// Health check function
const healthCheck = async () => {
  const mongoose = require('mongoose');
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'disconnected',
    services: {}
  };

  // Check database connection
  try {
    if (mongoose.connection.readyState === 1) {
      health.database = 'connected';
    } else {
      health.status = 'unhealthy';
      health.database = 'disconnected';
    }
  } catch (error) {
    health.status = 'unhealthy';
    health.database = 'error';
    health.services.database_error = error.message;
  }

  // Check SendGrid configuration
  try {
    if (process.env.SENDGRID_API_KEY) {
      health.services.sendgrid = 'configured';
    } else {
      health.services.sendgrid = 'not_configured';
    }
  } catch (error) {
    health.services.sendgrid = 'error';
  }

  return health;
};

// Reset metrics daily
const resetMetrics = () => {
  metrics.requests = { total: 0, success: 0, errors: 0, lastReset: new Date() };
  metrics.emails = { sent: 0, failed: 0, lastReset: new Date() };
  logger.info('Metrics reset for new day');
};

module.exports = {
  logger,
  metrics,
  healthCheck,
  resetMetrics
};