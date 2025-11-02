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
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-600 mx-auto mb-4"></div>
          <p className="text-primary-600 font-medium">Loading results...</p>
        </div>
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
    <div className="min-h-screen bg-primary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Results Header */}
        <div className="bg-white rounded-2xl border border-primary-200 shadow-soft-xl p-10 mb-8 text-center">
          <div className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 ${
            isPassed ? 'bg-accent-100' : 'bg-red-100'
          }`}>
            {isPassed ? (
              <svg className="w-10 h-10 text-accent-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          <h1 className="text-3xl font-semibold text-primary-900 mb-3">
            {isPassed ? 'Congratulations!' : 'Keep Trying!'}
          </h1>
          <p className="text-primary-600 mb-8 text-lg">
            {session.student_name}, here are your exam results for "{session.exam_title}"
          </p>

          {/* Score Display */}
          <div className="flex justify-center items-center gap-12 mb-8">
            <div className="text-center">
              <div className={`text-6xl font-semibold tabular-nums ${
                isPassed ? 'text-accent-600' : 'text-red-500'
              }`}>
                {session.percentage.toFixed(1)}%
              </div>
              <p className="text-sm text-primary-600 mt-2 font-medium">Final Score</p>
            </div>
            <div className="w-px h-16 bg-primary-200"></div>
            <div className="text-center">
              <div className="text-5xl font-semibold text-primary-900 tabular-nums">
                {session.marks_obtained}/{session.total_marks}
              </div>
              <p className="text-sm text-primary-600 mt-2 font-medium">Marks Obtained</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-5 bg-accent-50 border border-accent-200 rounded-xl">
              <div className="text-3xl font-semibold text-accent-600 tabular-nums">
                {session.answers.filter(a => a.is_correct).length}
              </div>
              <p className="text-sm text-primary-600 mt-1 font-medium">Correct</p>
            </div>
            <div className="p-5 bg-red-50 border border-red-200 rounded-xl">
              <div className="text-3xl font-semibold text-red-500 tabular-nums">
                {session.answers.filter(a => !a.is_correct).length}
              </div>
              <p className="text-sm text-primary-600 mt-1 font-medium">Incorrect</p>
            </div>
            <div className="p-5 bg-primary-100 border border-primary-200 rounded-xl">
              <div className="text-3xl font-semibold text-primary-700 tabular-nums">
                {formatDuration(session.duration_taken)}
              </div>
              <p className="text-sm text-primary-600 mt-1 font-medium">Time Taken</p>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-2xl border border-primary-200 shadow-soft-xl p-10 mb-8">
          <h2 className="text-2xl font-semibold text-primary-900 mb-6">Answer Breakdown</h2>

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
            className="flex-1 bg-accent-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-accent-700 transition-all shadow-soft hover:shadow-soft-lg"
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
    <div className={`border-2 rounded-xl p-6 ${
      isCorrect ? 'border-accent-200 bg-accent-50' : 'border-red-200 bg-red-50'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-1 gap-4">
          <span className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm ${
            isCorrect ? 'bg-accent-600 text-white' : 'bg-red-500 text-white'
          }`}>
            {index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                isMCQ ? 'bg-accent-100 text-accent-700' : 'bg-primary-100 text-primary-700'
              }`}>
                {answer.question_type}
              </span>
              <span className="text-sm text-primary-600 font-medium">
                {answer.marks_obtained}/{answer.max_marks} marks
              </span>
            </div>
            <p className="text-lg font-semibold text-primary-900 mb-4 leading-relaxed">{answer.question_text}</p>

            {/* Student Answer */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-primary-700 mb-2">Your Answer:</p>
              <p className={`text-sm p-4 rounded-xl border-2 ${
                isCorrect
                  ? 'bg-white border-accent-200 text-primary-900'
                  : 'bg-white border-red-200 text-primary-900'
              }`}>
                {answer.student_answer || '(No answer provided)'}
              </p>
            </div>

            {/* Correct Answer (if wrong) */}
            {!isCorrect && (
              <div>
                <p className="text-sm font-semibold text-primary-700 mb-2">Correct Answer:</p>
                <p className="text-sm p-4 rounded-xl bg-white border-2 border-accent-200 text-primary-900">
                  {answer.correct_answer}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Status Icon */}
        <div className="ml-4 flex-shrink-0">
          {isCorrect ? (
            <svg className="w-7 h-7 text-accent-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExamResults
