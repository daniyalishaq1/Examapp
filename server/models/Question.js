import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
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
}, {
  timestamps: true
});

const Question = mongoose.model('Question', questionSchema);

export default Question;
