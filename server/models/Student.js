import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  total_exams_taken: {
    type: Number,
    default: 0
  },
  average_score: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for quick lookups
studentSchema.index({ email: 1 });

const Student = mongoose.model('Student', studentSchema);

export default Student;
