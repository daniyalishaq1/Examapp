import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quickexam';

    await mongoose.connect(mongoURI);

    console.log('✓ MongoDB Connected Successfully');
    console.log(`📦 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('✗ MongoDB Connection Error:', error.message);
    console.log('⚠️  App will continue with in-memory storage');
  }
};

export default connectDB;
