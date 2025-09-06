require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');

const app = express();

// Database connection will be handled in serverless function
// No blocking connection here for serverless compatibility

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8080', 
    'https://bulk-email-sender-mu.vercel.app',
    'https://bulk-email-backend-mu.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/email', require('./routes/email'));
app.use('/api/templates', require('./routes/templates'));
app.use('/', require('./routes/unsubscribe')); // Unsubscribe route (no /api prefix for email clients)

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

// Handle preflight requests
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8080',
    'https://bulk-email-sender-mu.vercel.app',
    'https://bulk-email-backend-mu.vercel.app'
  ];
  
  if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
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