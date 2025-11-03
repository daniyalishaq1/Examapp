import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  // Simple auth - in production, use proper password hashing
  password: {
    type: String,
    required: true
  },
  authCode: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
teacherSchema.index({ email: 1 });

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;
