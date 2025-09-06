module.exports = async (req, res) => {
  try {
    // Set CORS headers first
    const origin = req.headers.origin;
    const allowedOrigins = [
      'https://bulk-email-sender-mu.vercel.app',
      'http://localhost:3000',
      'http://localhost:8080'
    ];
    
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Load app after headers are set
    const app = require('../index');
    return app(req, res);
    
  } catch (error) {
    console.error('Function error:', error);
    res.status(500).json({ error: 'Function failed', details: error.message });
  }
};