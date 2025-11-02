import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quickexam';

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 20000, // Increase timeout to 20 seconds
      socketTimeoutMS: 45000, // Increase socket timeout to 45 seconds
      maxPoolSize: 50, // Increase pool size for better concurrency
      wtimeoutMS: 30000, // Write concern timeout
      retryWrites: true,
      retryReads: true
    });

    // Set up connection error handling
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    console.log('✓ MongoDB Connected Successfully');
    console.log(`📦 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('✗ MongoDB Connection Error:', error.message);
    console.log('⚠️  App will continue with in-memory storage');
  }
};

export default connectDB;
