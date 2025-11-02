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
        serverSelectionTimeoutMS: 20000,
        socketTimeoutMS: 45000,
        maxPoolSize: 50,
        wtimeoutMS: 30000,
        retryWrites: true,
        retryReads: true,
        useUnifiedTopology: true
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
        console.error('All connection attempts failed');
        throw new Error('Failed to connect to MongoDB after multiple attempts');
      }

      currentTry++;
      console.log(`Retrying in ${retryDelay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};
  } catch (error) {
    console.error('✗ MongoDB Connection Error:', error.message);
    console.log('⚠️  App will continue with in-memory storage');
  }
};

export default connectDB;
