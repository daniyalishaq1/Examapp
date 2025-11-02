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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Available Exams
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome, {student?.name}! Choose an exam to begin.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Exams Grid */}
        {exams.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Exams Available</h3>
            <p className="text-gray-600">There are currently no exams available. Please check back later.</p>
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
  const getTypeColor = (type) => {
    switch (type) {
      case 'MCQ':
        return 'bg-blue-100 text-blue-700'
      case 'Short':
        return 'bg-purple-100 text-purple-700'
      case 'Mixed':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
        <h3 className="text-xl font-bold text-white mb-2">{exam.exam_title}</h3>
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(exam.exam_type)}`}>
          {exam.exam_type}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-6">
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-gray-600">
            <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">Duration: <strong>{exam.duration} minutes</strong></span>
          </div>

          <div className="flex items-center text-gray-600">
            <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            <span className="text-sm">Questions: <strong>{exam.questions?.length || 0}</strong></span>
          </div>

          <div className="flex items-center text-gray-600">
            <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span className="text-sm">Total Marks: <strong>{exam.total_marks}</strong></span>
          </div>
        </div>

        <button
          onClick={() => onStart(exam)}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transform hover:-translate-y-0.5 transition-all"
        >
          Start Exam
        </button>
      </div>
    </div>
  )
}

export default ExamList
