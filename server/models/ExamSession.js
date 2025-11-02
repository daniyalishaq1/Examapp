import mongoose from 'mongoose';

const examSessionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  student_name: {
    type: String,
    required: true
  },
  student_email: {
    type: String,
    required: true
  },
  exam_title: {
    type: String,
    required: true
  },
  answers: [{
    question_id: String,
    question_text: String,
    question_type: String,
    student_answer: String,
    correct_answer: String,
    is_correct: Boolean,
    marks_obtained: Number,
    max_marks: Number,
    feedback: String,
    grading_details: {
      similarity_score: Number,
      key_concepts_matched: [String],
      improvement_suggestions: String
    }
  }],
  total_marks: {
    type: Number,
    required: true
  },
  marks_obtained: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed'],
    default: 'in_progress'
  },
  current_question_index: {
    type: Number,
    default: 0
  },
  started_at: {
    type: Date,
    default: Date.now
  },
  completed_at: {
    type: Date
  },
  duration_taken: {
    type: Number  // in seconds
  },
  graded_by: {
    type: String,
    enum: ['AI', 'manual', 'hybrid'],
    default: 'AI'
  },
  grading_method: {
    type: String,
    enum: ['openai', 'mock', 'manual'],
    default: 'openai'
  },
  grading_status: {
    type: String,
    enum: ['completed', 'partial', 'failed'],
    default: 'completed'
  },
  grading_metadata: {
    model_used: String,
    confidence_score: Number,
    processing_time: Number
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
examSessionSchema.index({ student: 1, createdAt: -1 });
examSessionSchema.index({ exam: 1, createdAt: -1 });
examSessionSchema.index({ student_email: 1 });

const ExamSession = mongoose.model('ExamSession', examSessionSchema);

export default ExamSession;
