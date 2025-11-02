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
        toast.error(`Warning ${newCount}/${MAX_WARNINGS}: ${message}`);
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
    if (timeRemaining > 300) return 'text-primary-700';
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
      <div className="flex items-center justify-center min-h-screen bg-primary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-600 mx-auto mb-4"></div>
          <p className="text-primary-600 font-medium">Loading exam...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div
      className="min-h-screen bg-primary-50 py-8 px-4 sm:px-6 lg:px-8"
      style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header with Timer and Warnings */}
        <div className="bg-white rounded-2xl border border-primary-200 shadow-soft-lg p-8 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-primary-900">{exam.exam_title}</h1>
              <p className="text-sm text-primary-600 mt-1">
                Question {currentQuestionIndex + 1} of {exam.questions.length}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-semibold tabular-nums ${getTimeColor()}`}>
                {formatTime(timeRemaining)}
              </div>
              <p className="text-xs text-primary-600 mt-1">Time Remaining</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-primary-600">
              <span>Progress: {Math.round(progress)}%</span>
              <span>Answered: {answeredCount}/{exam.questions.length}</span>
            </div>
            <div className="bg-primary-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-accent-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Warning Counter */}
          {warningCount > 0 && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold text-red-900">
                    Warnings: {warningCount}/{MAX_WARNINGS}
                  </span>
                </div>
                <span className="text-sm text-red-700">
                  {MAX_WARNINGS - warningCount} remaining
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <div className="flex gap-4">
            <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="font-semibold text-amber-900 mb-2">Exam Integrity Notice</p>
              <ul className="space-y-1.5 text-sm text-amber-800">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Do not switch tabs or windows during the exam</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Right-click and text selection are disabled</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>You will receive a warning for any suspicious activity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>After {MAX_WARNINGS} warnings, your exam will be auto-submitted</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl border border-primary-200 shadow-soft-lg p-8 mb-6">
          <div className="flex items-start gap-4 mb-8">
            <span className="flex-shrink-0 w-12 h-12 bg-accent-100 text-accent-700 rounded-xl flex items-center justify-center font-semibold text-lg">
              {currentQuestionIndex + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  currentQuestion.type === 'MCQ'
                    ? 'bg-accent-100 text-accent-700'
                    : 'bg-primary-100 text-primary-700'
                }`}>
                  {currentQuestion.type}
                </span>
                <span className="text-sm text-primary-600 font-medium">
                  {currentQuestion.marks} {currentQuestion.marks === 1 ? 'mark' : 'marks'}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-primary-900 leading-relaxed mb-6">
                {currentQuestion.text}
              </h2>

              {currentQuestion.type === 'MCQ' ? (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        answers[currentQuestion._id] === option
                          ? 'border-accent-500 bg-accent-50 shadow-soft'
                          : 'border-primary-200 hover:border-accent-300 hover:bg-primary-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion._id}`}
                        value={option}
                        checked={answers[currentQuestion._id] === option}
                        onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                        className="mt-1 text-accent-600 focus:ring-accent-500 focus:ring-2"
                      />
                      <span className="ml-3 text-primary-900 flex-1">{option}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  value={answers[currentQuestion._id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                  placeholder="Type your answer here..."
                  rows="6"
                  className="w-full p-4 border-2 border-primary-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none resize-none text-primary-900 placeholder-primary-400"
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
            className={`flex-1 py-3.5 px-6 rounded-xl font-semibold transition-all ${
              currentQuestionIndex === 0
                ? 'bg-primary-100 text-primary-400 cursor-not-allowed'
                : 'bg-white text-accent-600 border-2 border-accent-600 hover:bg-accent-50 shadow-soft hover:shadow-soft-lg'
            }`}
          >
            Previous
          </button>

          {currentQuestionIndex < exam.questions.length - 1 ? (
            <button
              onClick={goToNext}
              className="flex-1 py-3.5 px-6 bg-accent-600 text-white rounded-xl font-semibold hover:bg-accent-700 transition-all shadow-soft hover:shadow-soft-lg"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 py-3.5 px-6 rounded-xl font-semibold transition-all ${
                isSubmitting
                  ? 'bg-primary-300 cursor-not-allowed text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-soft hover:shadow-soft-lg'
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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-soft-xl p-8 max-w-md animate-bounce">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-red-600 mb-2">WARNING!</h3>
              <p className="text-primary-700 mb-4">
                Suspicious activity detected!
              </p>
              <p className="text-sm text-primary-600">
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
