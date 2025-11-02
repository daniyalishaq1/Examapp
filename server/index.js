import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import OpenAI from 'openai';
import mongoose from 'mongoose';
import connectDB from './config/database.js';
import Exam from './models/Exam.js';
import Student from './models/Student.js';
import ExamSession from './models/ExamSession.js';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://examapp-git-main-danyalishaq1-gmailcoms-projects.vercel.app', 
       'https://examapp-9qxj27i4k-danyalishaq1-gmailcoms-projects.vercel.app']
    : 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'dist')));

// Connect to MongoDB
connectDB();

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

// Evaluate short answer using OpenAI
async function evaluateShortAnswer(studentAnswer, correctAnswer, questionText) {
  const prompt = `
As a lenient and encouraging exam grader, evaluate the student's answer with generosity while providing constructive feedback.

Question: ${questionText}

Expected Answer: ${correctAnswer}

Student's Answer: ${studentAnswer}

Grading Guidelines - Be Generous:
1. Award full marks if the core concept is understood, even if wording differs
2. Give substantial partial credit for partially correct answers
3. Focus on what the student got right rather than what's missing
4. Accept alternative valid explanations or approaches
5. Don't penalize for minor wording differences or stylistic choices
6. Reward demonstrating understanding even if the answer isn't complete

Consider:
1. Core concepts understood (most important)
2. Overall correctness of the main idea
3. Evidence of learning and effort
4. Reasonable attempt at answering

Evaluate the answer and provide marks out of 5 based on:
1. Core understanding (max 3 points) - Award generously if main idea is present
2. Supporting details (max 1 point) - Partial credit easily given
3. Clarity (max 1 point) - Award unless completely unclear

Return only a JSON object with:
{
  "marks": <marks out of 5>,
  "feedback": "<encouraging feedback highlighting what was done well>",
  "key_concepts_matched": ["concept1", "concept2", ...],
  "improvement_suggestions": "<optional gentle suggestions if needed>",
  "grading_breakdown": {
    "accuracy": <points out of 2>,
    "completeness": <points out of 1>,
    "understanding": <points out of 1>,
    "clarity": <points out of 1>
  }
}
`;

  try {
    const startTime = Date.now();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a lenient and encouraging exam grader. Be generous with marks and focus on rewarding understanding rather than penalizing imperfections. Give students the benefit of the doubt and provide positive, constructive feedback."
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

    // Convert marks (out of 5) to similarity score (0-1)
    result.similarity = result.marks / 5;

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

// Start exam session
app.post('/api/student/start-exam', async (req, res) => {
  const { student_name, student_email, exam_id } = req.body;

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

    // Create new exam session
    const examSession = new ExamSession({
      student: student._id,
      exam: exam_id,
      student_name,
      student_email,
      exam_title: exam.exam_title,
      total_marks: exam.total_marks,
      marks_obtained: 0,
      percentage: 0,
      status: 'in_progress',
      started_at: new Date(),
      answers: [],
      current_question_index: 0
    });

    await examSession.save();

    // Return first question
    const firstQuestion = exam.questions[0];
    res.json({
      success: true,
      session_id: examSession._id,
      question: {
        question_id: firstQuestion._id,
        text: firstQuestion.text,
        type: firstQuestion.type,
        options: firstQuestion.options,
        index: 0,
        total_questions: exam.questions.length
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Submit answer and get next question
app.post('/api/student/submit-answer', async (req, res) => {
  const { session_id, question_id, answer } = req.body;

  try {
    // Get session and exam
    const session = await ExamSession.findById(session_id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const exam = await Exam.findById(session.exam);
    if (!exam) {
      return res.status(404).json({ success: false, error: 'Exam not found' });
    }

    // Find current question
    const currentQuestion = exam.questions[session.current_question_index];
    if (currentQuestion._id.toString() !== question_id) {
      return res.status(400).json({ success: false, error: 'Invalid question ID' });
    }

    // Grade the answer
    let isCorrect = false;
    let marksObtained = 0;
    let feedback = '';
    let gradingDetails = {};

    if (currentQuestion.type === 'MCQ') {
      // Grade MCQ
      isCorrect = answer.trim() === currentQuestion.answer.trim();
      marksObtained = isCorrect ? currentQuestion.marks : 0;
      feedback = isCorrect ? 'Correct answer!' : 'Incorrect answer. Review the topic.';
    } else {
      // Grade short answer using OpenAI
      try {
        const aiGrading = await evaluateShortAnswer(answer, currentQuestion.answer, currentQuestion.text);
        marksObtained = aiGrading.marks;
        feedback = aiGrading.feedback;
        gradingDetails = aiGrading.grading_breakdown;
      } catch (aiError) {
        console.error('AI grading failed:', aiError);
        marksObtained = Math.ceil(currentQuestion.marks * 0.7);
        feedback = 'Graded without AI due to service error';
      }
    }

    // Save the answer
    session.answers.push({
      question_id,
      question_text: currentQuestion.text,
      question_type: currentQuestion.type,
      student_answer: answer,
      correct_answer: currentQuestion.answer,
      is_correct: isCorrect,
      marks_obtained: marksObtained,
      max_marks: currentQuestion.marks,
      feedback,
      grading_details: gradingDetails
    });

    // Update session
    const nextQuestionIndex = session.current_question_index + 1;
    session.current_question_index = nextQuestionIndex;

    // Check if exam is complete
    if (nextQuestionIndex >= exam.questions.length) {
      // Calculate final results
      const totalMarksObtained = session.answers.reduce((sum, ans) => sum + ans.marks_obtained, 0);
      const percentage = (totalMarksObtained / exam.total_marks) * 100;

      session.marks_obtained = totalMarksObtained;
      session.percentage = percentage;
      session.status = 'completed';
      session.completed_at = new Date();
      session.duration_taken = Math.floor((new Date() - session.started_at) / 1000);

      await session.save();

      return res.json({
        success: true,
        completed: true,
        marks_obtained: totalMarksObtained,
        total_marks: exam.total_marks,
        percentage,
        feedback: 'Exam completed!'
      });
    }

    // Get next question
    await session.save();
    const nextQuestion = exam.questions[nextQuestionIndex];

    res.json({
      success: true,
      completed: false,
      previous_answer: {
        is_correct: isCorrect,
        marks_obtained: marksObtained,
        max_marks: currentQuestion.marks,
        feedback
      },
      next_question: {
        question_id: nextQuestion._id,
        text: nextQuestion.text,
        type: nextQuestion.type,
        options: nextQuestion.options,
        index: nextQuestionIndex,
        total_questions: exam.questions.length
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all quizzes/exams
app.get('/api/quizzes', async (req, res) => {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: exams,
      count: exams.length
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get single quiz by ID
app.get('/api/quizzes/:id', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }
    res.json({
      success: true,
      data: exam
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete quiz by ID
app.delete('/api/quizzes/:id', async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }
    // Also delete all exam sessions for this exam
    await ExamSession.deleteMany({ exam: req.params.id });
    res.json({
      success: true,
      message: 'Exam and all related sessions deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create/structure quiz with LLM
app.post('/api/structure-quiz', async (req, res) => {
  try {
    const { examTitle, examType, duration, mcqContent, shortContent, mcqMarks, shortMarks } = req.body;

    let questions = [];

    // Parse MCQ questions
    if (mcqContent && mcqContent.trim()) {
      const mcqQuestions = await parseMCQContent(mcqContent, mcqMarks);
      questions = questions.concat(mcqQuestions);
    }

    // Parse Short questions
    if (shortContent && shortContent.trim()) {
      const shortQuestions = await parseShortContent(shortContent, shortMarks);
      questions = questions.concat(shortQuestions);
    }

    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    // Save to database
    const exam = new Exam({
      exam_title: examTitle,
      exam_type: examType,
      duration: parseInt(duration),
      total_marks: totalMarks,
      questions: questions
    });

    await exam.save();

    res.json({
      success: true,
      data: {
        exam_title: examTitle,
        exam_type: examType,
        duration: parseInt(duration),
        total_marks: totalMarks,
        questions: questions,
        _id: exam._id
      }
    });
  } catch (error) {
    console.error('Error structuring quiz:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function to parse MCQ content
async function parseMCQContent(content, defaultMarks) {
  const questions = [];
  const lines = content.split('\n');
  let currentQuestion = null;
  let options = [];
  let correctAnswer = null;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Check if it's a question (starts with number)
    const questionMatch = line.match(/^(\d+)\.\s*(.+)/);
    if (questionMatch) {
      // Save previous question
      if (currentQuestion && options.length >= 4) {
        questions.push({
          type: 'MCQ',
          text: currentQuestion,
          options: options.slice(0, 4),
          answer: correctAnswer || options[0],
          marks: defaultMarks
        });
      }

      currentQuestion = questionMatch[2];
      options = [];
      correctAnswer = null;
    }
    // Check if it's an option
    else if (line.match(/^[A-D][\.\)]\s*(.+)/)) {
      const optionMatch = line.match(/^[A-D][\.\)]\s*(.+)/);
      if (optionMatch) {
        options.push(optionMatch[1].trim());
      }
    }
    // Check for correct answer indicator
    else if (line.match(/\(?Correct:\s*([A-D])\)?/i)) {
      const correctMatch = line.match(/\(?Correct:\s*([A-D])\)?/i);
      if (correctMatch && options.length > 0) {
        const correctIndex = correctMatch[1].toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
        correctAnswer = options[correctIndex] || options[0];
      }
    }
  }

  // Add last question
  if (currentQuestion && options.length >= 4) {
    questions.push({
      type: 'MCQ',
      text: currentQuestion,
      options: options.slice(0, 4),
      answer: correctAnswer || options[0],
      marks: defaultMarks
    });
  }

  return questions;
}

// Helper function to parse short content
async function parseShortContent(content, defaultMarks) {
  const questions = [];
  const lines = content.split('\n');

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    let questionText = line.replace(/^\d+\.\s*/, '');
    if (questionText) {
      questions.push({
        type: 'Short',
        text: questionText,
        answer: "Expected answer based on course material",
        marks: defaultMarks
      });
    }
  }

  return questions;
}

// Teacher: Get all exam sessions/results
app.get('/api/teacher/all-results', async (req, res) => {
  try {
    const sessions = await ExamSession.find({ status: 'completed' })
      .populate('exam', 'exam_title exam_type total_marks')
      .populate('student', 'name email')
      .sort({ completed_at: -1 })
      .limit(100);

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching all results:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Teacher: Get results by exam
app.get('/api/teacher/exam/:examId/results', async (req, res) => {
  try {
    const sessions = await ExamSession.find({
      exam: req.params.examId,
      status: 'completed'
    })
      .populate('student', 'name email')
      .sort({ completed_at: -1 });

    const exam = await Exam.findById(req.params.examId);

    res.json({
      success: true,
      data: {
        exam,
        sessions
      }
    });
  } catch (error) {
    console.error('Error fetching exam results:', error);
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

// Serve index.html for all other routes to support client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

// Start server (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for Vercel
export default app;
