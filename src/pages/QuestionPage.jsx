import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const QuestionPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [warningCount, setWarningCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [startTime] = useState(Date.now());

  const MAX_WARNINGS = 5;

  // Fetch exam data
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const studentData = JSON.parse(localStorage.getItem('student') || '{}');
        if (!studentData.name || !studentData.email) {
          toast.error('Please login first');
          navigate('/student');
          return;
        }

        const response = await fetch(`/api/quizzes/${examId}`);
        const result = await response.json();

        if (result.success) {
          setExam(result.data);
          setTimeRemaining(result.data.duration * 60); // Convert to seconds
        } else {
          toast.error('Failed to load exam');
          navigate('/student/exams');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('An error occurred');
        navigate('/student/exams');
      }
    };

    fetchExam();
  }, [examId, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0 || !exam) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, exam]);

  // Anti-cheating: Detect tab/window switch
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && exam && !isSubmitting) {
        addWarning('You switched tabs/windows!');
      }
    };

    const handleBlur = () => {
      if (exam && !isSubmitting) {
        addWarning('You switched windows!');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [exam, isSubmitting]);

  // Anti-cheating: Disable right-click
  useEffect(() => {
    const handleContextMenu = (e) => {
      if (exam && !isSubmitting) {
        e.preventDefault();
        addWarning('Right-click is disabled during exam!');
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [exam, isSubmitting]);

  // Anti-cheating: Detect copy attempts
  useEffect(() => {
    const handleCopy = (e) => {
      if (exam && !isSubmitting) {
        e.preventDefault();
        addWarning('Copying is disabled during exam!');
      }
    };

    document.addEventListener('copy', handleCopy);
    return () => document.removeEventListener('copy', handleCopy);
  }, [exam, isSubmitting]);

  const addWarning = useCallback((message) => {
    setWarningCount(prev => {
      const newCount = prev + 1;
      if (newCount >= MAX_WARNINGS) {
        toast.error('Maximum warnings reached! Auto-submitting exam...');
        setTimeout(() => handleSubmit(), 1000);
      } else {
        toast.error(`⚠️ Warning ${newCount}/${MAX_WARNINGS}: ${message}`);
        setShowWarningModal(true);
        setTimeout(() => setShowWarningModal(false), 3000);
      }
      return newCount;
    });
  }, []);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    // Auto-advance for MCQ
    const currentQuestion = exam.questions[currentQuestionIndex];
    if (currentQuestion.type === 'MCQ') {
      setTimeout(() => {
        if (currentQuestionIndex < exam.questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        }
      }, 300);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    const durationTaken = Math.floor((Date.now() - startTime) / 1000);
    const studentData = JSON.parse(localStorage.getItem('student') || '{}');

    try {
      const response = await fetch('/api/student/submit-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_name: studentData.name,
          student_email: studentData.email,
          exam_id: examId,
          answers: answers,
          duration_taken: durationTaken
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Exam submitted successfully! Your teacher will review your answers.', {
          duration: 5000
        });
        navigate('/student/exams');
      } else {
        toast.error(result.error || 'Failed to submit exam');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while submitting');
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining > 300) return 'text-green-600';
    if (timeRemaining > 60) return 'text-yellow-600';
    return 'text-red-600 animate-pulse';
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const goToNext = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  if (!exam) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4 sm:px-6 lg:px-8"
      style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header with Timer and Warnings */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{exam.exam_title}</h1>
              <p className="text-sm text-gray-600 mt-1">
                Question {currentQuestionIndex + 1} of {exam.questions.length}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getTimeColor()}`}>
                {formatTime(timeRemaining)}
              </div>
              <p className="text-xs text-gray-600">Time Remaining</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress: {Math.round(progress)}%</span>
              <span>Answered: {answeredCount}/{exam.questions.length}</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Warning Counter */}
          {warningCount > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold text-red-800">
                    Warnings: {warningCount}/{MAX_WARNINGS}
                  </span>
                </div>
                <span className="text-xs text-red-600">
                  {MAX_WARNINGS - warningCount} warnings left
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">⚠️ Exam Integrity Notice:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Do not switch tabs or windows during the exam</li>
                <li>Right-click and text selection are disabled</li>
                <li>You will receive a warning for any suspicious activity</li>
                <li>After {MAX_WARNINGS} warnings, your exam will be auto-submitted</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-start gap-3 mb-6">
            <span className="flex-shrink-0 w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
              {currentQuestionIndex + 1}
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  currentQuestion.type === 'MCQ'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {currentQuestion.type}
                </span>
                <span className="text-sm text-gray-600">
                  {currentQuestion.marks} {currentQuestion.marks === 1 ? 'mark' : 'marks'}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {currentQuestion.text}
              </h2>

              {currentQuestion.type === 'MCQ' ? (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        answers[currentQuestion._id] === option
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion._id}`}
                        value={option}
                        checked={answers[currentQuestion._id] === option}
                        onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                        className="mt-1 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-3 text-gray-900">{option}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  value={answers[currentQuestion._id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                  placeholder="Type your answer here..."
                  rows="6"
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
                />
              )}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <button
            onClick={goToPrevious}
            disabled={currentQuestionIndex === 0}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              currentQuestionIndex === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-50'
            }`}
          >
            ← Previous
          </button>

          {currentQuestionIndex < exam.questions.length - 1 ? (
            <button
              onClick={goToNext}
              className="flex-1 py-3 px-6 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Exam'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md animate-bounce">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-red-600 mb-2">WARNING!</h3>
              <p className="text-gray-700 mb-4">
                Suspicious activity detected!
              </p>
              <p className="text-sm text-gray-600">
                Warning {warningCount} of {MAX_WARNINGS}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionPage;
