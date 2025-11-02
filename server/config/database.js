import mongoose from 'mongoose';

const connectDB = async () => {
  const maxRetries = 5;
  const retryDelay = 5000; // 5 seconds
  let currentTry = 1;

  while (currentTry <= maxRetries) {
    try {
      const mongoURI = process.env.MONGODB_URI;
      
      if (!mongoURI) {
        throw new Error('MONGODB_URI is not defined in environment variables');
      }

      console.log('Attempting to connect to MongoDB...');
      console.log('Connection string:', mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//****:****@')); // Log URI with hidden credentials

      await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        connectTimeoutMS: 30000,
        retryWrites: true,
        retryReads: true,
        autoIndex: true,
        minPoolSize: 2
      });

      // Set up connection monitoring
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        // Try to reconnect
        setTimeout(() => {
          console.log('Attempting to reconnect to MongoDB...');
          mongoose.connect(mongoURI);
        }, retryDelay);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected. Attempting to reconnect...');
        setTimeout(() => mongoose.connect(mongoURI), retryDelay);
      });

      console.log('✓ MongoDB Connected Successfully');
      console.log(`📦 Database: ${mongoose.connection.name}`);
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${currentTry} failed:`, error.message);
      
      if (currentTry === maxRetries) {
        console.error('Failed to connect to MongoDB after maximum retries');
        if (process.env.NODE_ENV === 'production') {
          console.error('Connection failed in production, will keep retrying');
          // Reset retry counter and continue trying
          currentTry = 1;
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        } else {
          throw new Error('Failed to connect to MongoDB after maximum retries');
        }
      }
      
      // Wait before trying again
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      currentTry++;
    }
  }
};

export default connectDB;
