import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

const ExamResults = () => {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [session, setSession] = useState(location.state?.session || null)
  const [loading, setLoading] = useState(!location.state?.session)

  useEffect(() => {
    if (!session) {
      fetchResults()
    }
  }, [])

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/student/results/${sessionId}`)
      const result = await response.json()

      if (result.success) {
        setSession(result.data)
      } else {
        toast.error('Failed to load results')
        navigate('/student/exams')
      }
    } catch (error) {
      console.error('Error fetching results:', error)
      toast.error('An error occurred')
      navigate('/student/exams')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToExams = () => {
    navigate('/student/exams')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const isPassed = session.percentage >= 50
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Results Header */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8 text-center">
          <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-4 ${
            isPassed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isPassed ? (
              <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isPassed ? 'Congratulations!' : 'Keep Trying!'}
          </h1>
          <p className="text-gray-600 mb-6">
            {session.student_name}, here are your exam results for "{session.exam_title}"
          </p>

          {/* Score Display */}
          <div className="flex justify-center items-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {session.percentage.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600 mt-1">Final Score</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {session.marks_obtained}/{session.total_marks}
              </div>
              <p className="text-sm text-gray-600 mt-1">Marks Obtained</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {session.answers.filter(a => a.is_correct).length}
              </div>
              <p className="text-xs text-gray-600">Correct</p>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg">
              <div className="text-2xl font-bold text-pink-600">
                {session.answers.filter(a => !a.is_correct).length}
              </div>
              <p className="text-xs text-gray-600">Incorrect</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatDuration(session.duration_taken)}
              </div>
              <p className="text-xs text-gray-600">Time Taken</p>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Answer Breakdown</h2>

          <div className="space-y-4">
            {session.answers.map((answer, index) => (
              <AnswerCard key={index} answer={answer} index={index} />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleBackToExams}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transform hover:-translate-y-0.5 transition-all"
          >
            Back to Exams
          </button>
        </div>
      </div>
    </div>
  )
}

const AnswerCard = ({ answer, index }) => {
  const isCorrect = answer.is_correct
  const isMCQ = answer.question_type === 'MCQ'

  return (
    <div className={`border-2 rounded-lg p-6 ${
      isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start flex-1">
          <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-3 ${
            isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {index + 1}
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isMCQ ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {answer.question_type}
              </span>
              <span className="text-sm text-gray-600">
                {answer.marks_obtained}/{answer.max_marks} marks
              </span>
            </div>
            <p className="text-lg font-medium text-gray-900 mb-3">{answer.question_text}</p>

            {/* Student Answer */}
            <div className="mb-2">
              <p className="text-sm font-semibold text-gray-700 mb-1">Your Answer:</p>
              <p className={`text-sm p-3 rounded-lg ${
                isCorrect ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'
              }`}>
                {answer.student_answer || '(No answer provided)'}
              </p>
            </div>

            {/* Correct Answer (if wrong) */}
            {!isCorrect && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Correct Answer:</p>
                <p className="text-sm p-3 rounded-lg bg-green-100 text-green-900">
                  {answer.correct_answer}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Status Icon */}
        <div className="ml-4">
          {isCorrect ? (
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExamResults
