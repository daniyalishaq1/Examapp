import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const ExamList = () => {
  const navigate = useNavigate()
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState(null)

  useEffect(() => {
    // Check if student is logged in
    const studentData = localStorage.getItem('student')
    if (!studentData) {
      navigate('/student')
      return
    }
    setStudent(JSON.parse(studentData))

    // Fetch available exams
    fetchExams()
  }, [navigate])

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/quizzes')
      const result = await response.json()

      if (result.success) {
        setExams(result.data)
      } else {
        toast.error('Failed to load exams')
      }
    } catch (error) {
      console.error('Error fetching exams:', error)
      toast.error('An error occurred while loading exams')
    } finally {
      setLoading(false)
    }
  }

  const handleStartExam = (exam) => {
    navigate(`/student/exam/${exam._id}`, { state: { exam } })
  }

  const handleLogout = () => {
    localStorage.removeItem('student')
    toast.success('Logged out successfully')
    navigate('/student')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-200 border-t-accent-600 mx-auto"></div>
          <p className="mt-4 text-primary-600 text-sm">Loading exams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-primary-900 tracking-tight mb-2">
                Available Exams
              </h1>
              <p className="text-primary-600">
                Welcome back, {student?.name}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-primary-600 hover:text-primary-900 font-medium transition duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Exams Grid */}
        {exams.length === 0 ? (
          <div className="bg-white border border-primary-200 rounded-2xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 mb-4">
              <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-primary-900 mb-1">No Exams Available</h3>
            <p className="text-primary-600 text-sm">Check back later for new exams.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <ExamCard key={exam._id} exam={exam} onStart={handleStartExam} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const ExamCard = ({ exam, onStart }) => {
  const getTypeBadge = (type) => {
    switch (type) {
      case 'MCQ':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'Short':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'Mixed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      default:
        return 'bg-primary-100 text-primary-700 border-primary-200'
    }
  }

  return (
    <div className="bg-white border border-primary-200 rounded-2xl overflow-hidden hover:shadow-soft-lg transition-shadow duration-300">
      {/* Card Header */}
      <div className="p-6 border-b border-primary-100">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-lg font-semibold text-primary-900 leading-tight">{exam.exam_title}</h3>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${getTypeBadge(exam.exam_type)} flex-shrink-0`}>
            {exam.exam_type}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 space-y-6">
        {/* Exam Metadata */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-primary-900">{exam.duration}</div>
            <div className="text-xs text-primary-500 mt-1">Minutes</div>
          </div>
          <div className="text-center border-x border-primary-100">
            <div className="text-2xl font-semibold text-primary-900">{exam.questions?.length || 0}</div>
            <div className="text-xs text-primary-500 mt-1">Questions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-primary-900">{exam.total_marks}</div>
            <div className="text-xs text-primary-500 mt-1">Marks</div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={() => onStart(exam)}
          className="w-full bg-accent-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 transition duration-200"
        >
          Start Exam
        </button>
      </div>
    </div>
  )
}

export default ExamList
