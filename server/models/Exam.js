import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  exam_title: {
    type: String,
    required: true,
    trim: true
  },
  exam_type: {
    type: String,
    enum: ['MCQ', 'Short', 'Mixed'],
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  total_marks: {
    type: Number,
    required: true,
    min: 0
  },
  questions: [{
    type: {
      type: String,
      enum: ['MCQ', 'Short'],
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    options: {
      type: [String],
      default: []
    },
    answer: {
      type: String,
      required: true
    },
    marks: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  llm_provider: {
    type: String,
    default: 'mock'
  },
  created_by: {
    type: String,
    default: 'teacher'
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  examLink: {
    type: String,
    unique: true,
    sparse: true
  },
  linkActive: {
    type: Boolean,
    default: true
  },
  linkExpiredAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
examSchema.index({ exam_title: 1, createdAt: -1 });
examSchema.index({ teacher: 1, createdAt: -1 });
examSchema.index({ examLink: 1 });

const Exam = mongoose.model('Exam', examSchema);

export default Exam;
