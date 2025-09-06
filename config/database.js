const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('MONGODB_URI not set');
      return;
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
    });
    
    isConnected = true;
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('DB Error:', error.message);
    isConnected = false;
  }
};

module.exports = connectDB;