import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import mongoose from 'mongoose';
import connectDB from './config/database.js';
import Exam from './models/Exam.js';
import Student from './models/Student.js';
import ExamSession from './models/ExamSession.js';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

// Evaluate short answer using OpenAI
async function evaluateShortAnswer(studentAnswer, correctAnswer, questionText) {
  const prompt = `
As an expert exam grader, evaluate the student's answer and provide detailed feedback.

Question: ${questionText}

Expected Answer: ${correctAnswer}

Student's Answer: ${studentAnswer}

Consider:
1. Key concepts covered
2. Accuracy of information
3. Completeness of answer
4. Understanding demonstrated
5. Clarity and conciseness

Provide a comprehensive evaluation including:
1. A similarity score (0-1)
2. Key concepts correctly addressed
3. Missing or incorrect concepts
4. Specific improvement suggestions
5. Brief qualitative feedback

Return only a JSON object with:
{
  "similarity": <score between 0 and 1>,
  "feedback": "<brief qualitative feedback>",
  "key_concepts_matched": ["concept1", "concept2", ...],
  "improvement_suggestions": "<specific suggestions for improvement>",
  "confidence_score": <confidence in evaluation 0-1>
}
`;

  try {
    const startTime = Date.now();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert exam grader. Evaluate student answers and provide fair, consistent grading with detailed feedback."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    result.processing_time = Date.now() - startTime;
    result.model_used = "gpt-4o-mini";

    return result;
  } catch (error) {
    console.error('Error in AI grading:', error);
    // Fallback to basic evaluation with detailed structure
    return {
      similarity: studentAnswer.length > 0 ? 0.7 : 0,
      feedback: "Graded without AI due to service error",
      key_concepts_matched: [],
      improvement_suggestions: "Unable to provide detailed feedback",
      confidence_score: 0.5,
      processing_time: 0,
      model_used: "fallback"
    };
  }
}

// Student: Submit exam and auto-grade
app.post('/api/student/submit-exam', async (req, res) => {
  const { student_name, student_email, exam_id, answers, duration_taken } = req.body;

  try {
    // Get exam
    const exam = await Exam.findById(exam_id);
    if (!exam) {
      return res.status(404).json({ success: false, error: 'Exam not found' });
    }

    // Find or create student
    let student = await Student.findOne({ email: student_email });
    if (!student) {
      student = new Student({
        name: student_name,
        email: student_email
      });
      await student.save();
    }

    // Grade the exam
    const gradedAnswers = [];
    let totalMarksObtained = 0;

    try {
      // Process each question
      const questionResults = await Promise.all(exam.questions.map(async (question, index) => {
        const questionId = question._id || index;
        const studentAnswer = answers[questionId] || '';
        const correctAnswer = question.answer;
        const isMCQ = question.type === 'MCQ';

        // Auto-grade MCQs, AI-grade short answers
        let isCorrect = false;
        let marksObtained = 0;
        let feedback = '';
        let gradingDetails = {};

        if (isMCQ) {
          // Exact match for MCQ
          isCorrect = studentAnswer.trim() === correctAnswer.trim();
          marksObtained = isCorrect ? question.marks : 0;
          feedback = isCorrect ? 'Correct answer' : 'Incorrect answer';
          gradingDetails = {
            similarity_score: isCorrect ? 1 : 0,
            key_concepts_matched: [],
            improvement_suggestions: isCorrect ? 'Great job!' : 'Review the correct answer carefully'
          };
        } else {
          // Short questions: Use OpenAI to evaluate answer
          if (studentAnswer.trim()) {
            try {
              const aiGrading = await evaluateShortAnswer(studentAnswer, correctAnswer, question.text);
              marksObtained = Math.round(aiGrading.similarity * question.marks);
              isCorrect = aiGrading.similarity >= 0.7; // Consider 70% similarity as correct
              feedback = aiGrading.feedback;
              gradingDetails = {
                similarity_score: aiGrading.similarity,
                key_concepts_matched: aiGrading.key_concepts_matched || [],
                improvement_suggestions: aiGrading.improvement_suggestions
              };
            } catch (aiError) {
              console.error('AI grading failed:', aiError);
              // Fallback to basic grading
              marksObtained = Math.ceil(question.marks * 0.7);
              isCorrect = true;
              feedback = 'Graded without AI due to service error';
              gradingDetails = {
                similarity_score: 0.7,
                key_concepts_matched: [],
                improvement_suggestions: 'Detailed feedback unavailable'
              };
            }
          }
        }

        return {
          question_id: questionId.toString(),
          question_text: question.text,
          question_type: question.type,
          student_answer: studentAnswer,
          correct_answer: correctAnswer,
          is_correct: isCorrect,
          marks_obtained: marksObtained,
          max_marks: question.marks,
          feedback: feedback,
          grading_details: gradingDetails
        };
      }));

      // Add results to gradedAnswers and calculate total
      questionResults.forEach(result => {
        gradedAnswers.push(result);
        totalMarksObtained += result.marks_obtained;
      });

      // Calculate percentage
      const totalMarks = exam.total_marks;
      const percentage = (totalMarksObtained / totalMarks) * 100;

      // Create exam session
      const examSession = new ExamSession({
        student: student._id,
        exam: exam_id,
        student_name: student_name,
        student_email: student_email,
        exam_title: exam.exam_title,
        answers: gradedAnswers,
        marks_obtained: totalMarksObtained,
        total_marks: totalMarks,
        percentage: percentage,
        status: 'completed',
        started_at: new Date(Date.now() - duration_taken * 1000),
        completed_at: new Date(),
        duration_taken: duration_taken,
        graded_by: openai ? 'AI' : 'hybrid',
        grading_method: openai ? 'openai' : 'mock',
        grading_status: 'completed',
        grading_metadata: {
          model_used: openai ? 'gpt-4o-mini' : 'fallback',
          confidence_score: openai ? 0.9 : 0.7,
          processing_time: Date.now() - new Date(Date.now() - duration_taken * 1000)
        }
      });

      await examSession.save();

      // Return results
      res.json({
        success: true,
        session_id: examSession._id,
        marks_obtained: totalMarksObtained,
        total_marks: totalMarks,
        percentage: percentage,
        graded_answers: gradedAnswers
      });
    } catch (gradingError) {
      console.error('Error during grading:', gradingError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to grade exam answers'
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    llm_provider: process.env.LLM_PROVIDER || 'mock',
    openai_configured: !!openai,
    database_connected: mongoose.connection.readyState === 1,
    database_name: mongoose.connection.name || 'Not connected'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
