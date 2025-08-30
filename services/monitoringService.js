const cron = require('node-cron');
const { logger, healthCheck, resetMetrics, metrics } = require('../config/monitoring');
const mongoose = require('mongoose');

class MonitoringService {
  constructor() {
    this.isRunning = false;
    this.alerts = [];
  }

  // Start monitoring service
  start() {
    if (this.isRunning) {
      logger.warn('Monitoring service already running');
      return;
    }

    logger.info('Starting monitoring service');
    this.isRunning = true;

    // Health check every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      await this.performHealthCheck();
    });

    // Reset metrics daily at midnight
    cron.schedule('0 0 * * *', () => {
      resetMetrics();
    });

    // System metrics check every hour
    cron.schedule('0 * * * *', () => {
      this.checkSystemMetrics();
    });

    // Database connection check every minute
    cron.schedule('* * * * *', () => {
      this.checkDatabaseConnection();
    });

    logger.info('Monitoring service started successfully');
  }

  // Stop monitoring service
  stop() {
    this.isRunning = false;
    logger.info('Monitoring service stopped');
  }

  // Perform health check
  async performHealthCheck() {
    try {
      const health = await healthCheck();
      
      if (health.status !== 'healthy') {
        this.createAlert('HEALTH_CHECK_FAILED', 'System health check failed', health);
      }

      logger.info('Health check completed', { status: health.status });
    } catch (error) {
      logger.error('Health check error', { error: error.message });
      this.createAlert('HEALTH_CHECK_ERROR', 'Health check encountered an error', { error: error.message });
    }
  }

  // Check system metrics
  checkSystemMetrics() {
    try {
      const memory = process.memoryUsage();
      const memoryUsageMB = memory.heapUsed / 1024 / 1024;
      
      // Alert if memory usage is high (>500MB)
      if (memoryUsageMB > 500) {
        this.createAlert('HIGH_MEMORY_USAGE', `High memory usage detected: ${memoryUsageMB.toFixed(2)}MB`, {
          memoryUsage: memory,
          threshold: '500MB'
        });
      }

      // Alert if error rate is high (>10%)
      const errorRate = metrics.requests.total > 0 ? 
        (metrics.requests.errors / metrics.requests.total) * 100 : 0;
      
      if (errorRate > 10 && metrics.requests.total > 10) {
        this.createAlert('HIGH_ERROR_RATE', `High error rate detected: ${errorRate.toFixed(2)}%`, {
          errorRate,
          totalRequests: metrics.requests.total,
          errors: metrics.requests.errors
        });
      }

      logger.info('System metrics check completed', {
        memoryUsage: `${memoryUsageMB.toFixed(2)}MB`,
        errorRate: `${errorRate.toFixed(2)}%`,
        uptime: process.uptime()
      });
    } catch (error) {
      logger.error('System metrics check failed', { error: error.message });
    }
  }

  // Check database connection
  checkDatabaseConnection() {
    try {
      const dbState = mongoose.connection.readyState;
      const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };

      if (dbState !== 1) {
        this.createAlert('DATABASE_CONNECTION_ISSUE', `Database connection issue: ${states[dbState]}`, {
          connectionState: states[dbState],
          readyState: dbState
        });
      }
    } catch (error) {
      logger.error('Database connection check failed', { error: error.message });
    }
  }

  // Create alert
  createAlert(type, message, data = {}) {
    const alert = {
      id: Date.now().toString(),
      type,
      message,
      data,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    this.alerts.push(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    logger.warn('Alert created', alert);
    
    // Here you could integrate with external alerting services
    // like Slack, email notifications, etc.
    this.sendNotification(alert);
  }

  // Send notification (placeholder for external integrations)
  sendNotification(alert) {
    // Example: Send to Slack, email, SMS, etc.
    logger.info('Notification sent', { alertType: alert.type, message: alert.message });
  }

  // Get recent alerts
  getAlerts(limit = 50) {
    return this.alerts.slice(-limit).reverse();
  }

  // Resolve alert
  resolveAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      logger.info('Alert resolved', { alertId, type: alert.type });
    }
  }

  // Get monitoring statistics
  getStats() {
    return {
      isRunning: this.isRunning,
      totalAlerts: this.alerts.length,
      unresolvedAlerts: this.alerts.filter(a => !a.resolved).length,
      uptime: process.uptime(),
      metrics: metrics
    };
  }
}

module.exports = new MonitoringService();