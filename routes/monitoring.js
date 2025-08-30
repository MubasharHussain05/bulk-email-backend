const express = require('express');
const router = express.Router();
const { healthCheck, metrics, logger } = require('../config/monitoring');
const auth = require('../middleware/auth');

// Public health check endpoint
router.get('/health', async (req, res) => {
  try {
    const health = await healthCheck();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Detailed metrics endpoint (protected)
router.get('/metrics', auth, (req, res) => {
  try {
    const systemMetrics = {
      ...metrics,
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        lastCheck: new Date().toISOString()
      }
    };
    
    res.json(systemMetrics);
  } catch (error) {
    logger.error('Failed to get metrics', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve metrics' });
  }
});

// System status endpoint (protected)
router.get('/status', auth, async (req, res) => {
  try {
    const health = await healthCheck();
    const systemInfo = {
      ...health,
      metrics: {
        requests: metrics.requests,
        emails: metrics.emails
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid
      }
    };
    
    res.json(systemInfo);
  } catch (error) {
    logger.error('Failed to get system status', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve system status' });
  }
});

// Reset metrics endpoint (protected)
router.post('/metrics/reset', auth, (req, res) => {
  try {
    metrics.requests = { total: 0, success: 0, errors: 0, lastReset: new Date() };
    metrics.emails = { sent: 0, failed: 0, lastReset: new Date() };
    
    logger.info('Metrics manually reset', { user: req.user.id });
    res.json({ message: 'Metrics reset successfully' });
  } catch (error) {
    logger.error('Failed to reset metrics', { error: error.message });
    res.status(500).json({ error: 'Failed to reset metrics' });
  }
});

module.exports = router;