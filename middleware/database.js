const connectDB = require('../config/database');

let isConnected = false;

const ensureDBConnection = async (req, res, next) => {
  try {
    if (!isConnected && process.env.MONGODB_URI) {
      await connectDB();
      isConnected = true;
    }
    next();
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
};

module.exports = { ensureDBConnection };