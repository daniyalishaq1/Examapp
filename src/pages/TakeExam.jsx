import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

const TakeExam = () => {
  const { examId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [student, setStudent] = useState(null)
  const [exam, setExam] = useState(location.state?.exam || null)
  const [answers, setAnswers] = useState({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    // Check if student is logged in
    const studentData = localStorage.getItem('student')
    if (!studentData) {
      navigate('/student')
      return
    }
    setStudent(JSON.parse(studentData))

    // Fetch exam if not in state
    if (!exam) {
      fetchExam()
    } else {
      setTimeRemaining(exam.duration * 60) // Convert minutes to seconds
    }
  }, [navigate, exam])

  useEffect(() => {
    // Timer countdown
    if (timeRemaining <= 0) {
      handleSubmit()
      return
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining])

  const fetchExam = async () => {
    try {
      const response = await fetch(`/api/quizzes/${examId}`)
      const result = await response.json()

      if (result.success) {
        setExam(result.data)
        setTimeRemaining(result.data.duration * 60)
      } else {
        toast.error('Failed to load exam')
        navigate('/student/exams')
      }
    } catch (error) {
      console.error('Error fetching exam:', error)
      toast.error('An error occurred')
      navigate('/student/exams')
    }
  }

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    const durationTaken = Math.floor((Date.now() - startTime) / 1000)

    try {
      const response = await fetch('/api/student/submit-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_name: student.name,
          student_email: student.email,
          exam_id: exam._id,
          answers: answers,
          duration_taken: durationTaken
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Exam submitted successfully! Your teacher will review your answers.', {
          duration: 5000
        })
        // Navigate back to exam list instead of showing results
        navigate('/student/exams')
      } else {
        toast.error(result.error || 'Failed to submit exam')
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Error submitting exam:', error)
      toast.error('An error occurred while submitting')
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeColor = () => {
    if (timeRemaining > 300) return 'text-green-600'
    if (timeRemaining > 60) return 'text-yellow-600'
    return 'text-red-600 animate-pulse'
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  const answeredCount = Object.keys(answers).length
  const totalQuestions = exam.questions.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Timer */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 sticky top-4 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{exam.exam_title}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {answeredCount} of {totalQuestions} questions answered
              </p>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getTimeColor()}`}>
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm text-gray-600">Time Remaining</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {exam.questions.map((question, index) => (
            <QuestionCard
              key={question._id || index}
              question={question}
              index={index}
              answer={answers[question._id || index]}
              onAnswerChange={(answer) => handleAnswerChange(question._id || index, answer)}
            />
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:-translate-y-0.5'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Exam'}
          </button>
          <p className="text-center text-sm text-gray-600 mt-3">
            Make sure you've answered all questions before submitting
          </p>
        </div>
      </div>
    </div>
  )
}

const QuestionCard = ({ question, index, answer, onAnswerChange }) => {
  const isMCQ = question.type === 'MCQ'

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-start mb-4">
        <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm mr-3">
          {index + 1}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isMCQ ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
            }`}>
              {question.type}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
              {question.marks} marks
            </span>
          </div>
          <p className="text-lg font-medium text-gray-900 mb-4">{question.text}</p>

          {isMCQ ? (
            <div className="space-y-2">
              {question.options.map((option, idx) => (
                <label
                  key={idx}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    answer === option
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={option}
                    checked={answer === option}
                    onChange={(e) => onAnswerChange(e.target.value)}
                    className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-3 text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              value={answer || ''}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Type your answer here..."
              rows="4"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition resize-none"
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default TakeExam
