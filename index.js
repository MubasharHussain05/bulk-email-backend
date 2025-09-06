require('dotenv').config();
const express = require('express');
const app = express();

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database middleware
const { ensureDBConnection } = require('./middleware/database');

// Routes with error handling
try {
  app.use('/api/auth', ensureDBConnection, require('./routes/auth'));
  app.use('/api/contacts', ensureDBConnection, require('./routes/contacts'));
  app.use('/api/campaigns', ensureDBConnection, require('./routes/campaigns'));
  app.use('/api/email', ensureDBConnection, require('./routes/email'));
  app.use('/api/templates', ensureDBConnection, require('./routes/templates'));
  app.use('/', require('./routes/unsubscribe'));
} catch (error) {
  console.error('Route loading error:', error.message);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Bulk Email Service API is running',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Bulk Email Service API', status: 'running' });
});



// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Export app instead of listen
module.exports = app;