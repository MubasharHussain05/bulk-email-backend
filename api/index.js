const app = require('../index');
const connectDB = require('../config/database');

let dbConnected = false;

module.exports = async (req, res) => {
  try {
    // Ensure database connection for serverless
    if (!dbConnected && process.env.MONGODB_URI) {
      await connectDB();
      dbConnected = true;
    }
    
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};