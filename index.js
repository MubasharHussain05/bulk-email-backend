require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'https://bulk-email-sender-mu.vercel.app',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:5000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

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
  app.use('/api/stats', ensureDBConnection, require('./routes/stats'));
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

// Start server for local development
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export app for Vercel
module.exports = app;