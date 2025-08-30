const { verifyToken } = require('../config/jwt');
const mongoose = require('mongoose');

const authenticateToken = (req, res, next) => {
  // Development bypass - remove this in production
  if (process.env.NODE_ENV === 'development') {
    req.user = { userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011') };
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { authenticateToken };