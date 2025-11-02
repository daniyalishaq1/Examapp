import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const ResultsDashboard = () => {
  const [sessions, setSessions] = useState([])
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all' or specific examId
  const [selectedSession, setSelectedSession] = useState(null)
  const [view, setView] = useState('results') // 'results' or 'exams'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch all results
      const resultsResponse = await fetch('/api/teacher/all-results')
      const resultsData = await resultsResponse.json()

      // Fetch all exams
      const examsResponse = await fetch('/api/quizzes')
      const examsData = await examsResponse.json()

      if (resultsData.success && examsData.success) {
        setSessions(resultsData.data)
        setExams(examsData.data)
      } else {
        toast.error('Failed to load results')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('An error occurred while loading results')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam? This will also delete all student results for this exam.')) {
      return
    }

    try {
      const response = await fetch(`/api/quizzes/${examId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Exam deleted successfully')
        // Refresh data
        fetchData()
        // Reset filter if the deleted exam was selected
        if (filter === examId) {
          setFilter('all')
        }
      } else {
        toast.error(result.error || 'Failed to delete exam')
      }
    } catch (error) {
      console.error('Error deleting exam:', error)
      toast.error('An error occurred while deleting exam')
    }
  }

  const filteredSessions = filter === 'all'
    ? sessions
    : sessions.filter(s => s.exam?._id === filter)

  const calculateStats = () => {
    const totalStudents = new Set(filteredSessions.map(s => s.student_email)).size
    const avgScore = filteredSessions.length > 0
      ? filteredSessions.reduce((sum, s) => sum + s.percentage, 0) / filteredSessions.length
      : 0
    const passedCount = filteredSessions.filter(s => s.percentage >= 50).length
    const passRate = filteredSessions.length > 0
      ? (passedCount / filteredSessions.length) * 100
      : 0

    return { totalStudents, avgScore, passRate, totalAttempts: filteredSessions.length }
  }

  const stats = calculateStats()

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="bg-white rounded-xl shadow-soft border border-primary-200 p-1.5 inline-flex">
        <button
          onClick={() => setView('results')}
          className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
            view === 'results'
              ? 'bg-accent-600 text-white shadow-soft'
              : 'text-gray-600 hover:text-gray-900 hover:bg-primary-50'
          }`}
        >
          Student Results
        </button>
        <button
          onClick={() => setView('exams')}
          className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
            view === 'exams'
              ? 'bg-accent-600 text-white shadow-soft'
              : 'text-gray-600 hover:text-gray-900 hover:bg-primary-50'
          }`}
        >
          Manage Exams
        </button>
      </div>

      {view === 'results' ? (
        <>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          color="bg-accent-100 text-accent-600"
        />
        <StatCard
          title="Total Attempts"
          value={stats.totalAttempts}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          color="bg-primary-100 text-gray-600"
        />
        <StatCard
          title="Average Score"
          value={`${stats.avgScore.toFixed(1)}%`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          color="bg-green-100 text-green-600"
        />
        <StatCard
          title="Pass Rate"
          value={`${stats.passRate.toFixed(1)}%`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="bg-accent-100 text-accent-600"
        />
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-soft border border-primary-200 p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Filter by Exam
        </label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full md:w-80 px-4 py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none transition"
        >
          <option value="all">All Exams</option>
          {exams.map((exam) => (
            <option key={exam._id} value={exam._id}>
              {exam.exam_title}
            </option>
          ))}
        </select>
      </div>

      {/* Results Table */}
      {filteredSessions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-soft border border-primary-200 p-16 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Yet</h3>
          <p className="text-gray-600">Students haven't taken any exams yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-soft border border-primary-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-primary-200">
              <thead className="bg-primary-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Exam
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-primary-200">
                {filteredSessions.map((session) => (
                  <tr key={session._id} className="hover:bg-primary-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {session.student_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.student_email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {session.exam_title || session.exam?.exam_title || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {session.exam?.exam_type || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {session.marks_obtained}/{session.total_marks}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-semibold ${
                        session.percentage >= 50 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {session.percentage.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 inline-flex text-xs font-semibold rounded-lg border ${
                        session.percentage >= 50
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {session.percentage >= 50 ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDuration(session.duration_taken)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(session.completed_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedSession(session)}
                        className="text-accent-600 hover:text-accent-700 font-semibold"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Session Detail Modal */}
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
        </>
      ) : (
        <ExamsManagementView exams={exams} onDelete={handleDeleteExam} sessions={sessions} />
      )}
    </div>
  )
}

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-xl shadow-soft border border-primary-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className={`${color} w-14 h-14 rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

const ExamsManagementView = ({ exams, onDelete, sessions }) => {
  const getExamStats = (examId) => {
    const examSessions = sessions.filter(s => s.exam?._id === examId)
    const totalAttempts = examSessions.length
    const uniqueStudents = new Set(examSessions.map(s => s.student_email)).size
    const avgScore = totalAttempts > 0
      ? examSessions.reduce((sum, s) => sum + s.percentage, 0) / totalAttempts
      : 0

    return { totalAttempts, uniqueStudents, avgScore }
  }

  if (exams.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-soft border border-primary-200 p-16 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Exams Created</h3>
        <p className="text-gray-600">Create your first exam in the "Create Exam" tab.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exams.map((exam) => {
        const stats = getExamStats(exam._id)
        return (
          <div key={exam._id} className="bg-white rounded-2xl shadow-soft-lg border border-primary-200 overflow-hidden hover:shadow-soft-xl transition-all">
            {/* Header */}
            <div className="bg-accent-600 p-6 text-white">
              <h3 className="text-xl font-semibold mb-3">{exam.exam_title}</h3>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-white/20 border border-white/20 rounded-lg text-xs font-semibold">
                  {exam.exam_type}
                </span>
                <span className="px-3 py-1.5 bg-white/20 border border-white/20 rounded-lg text-xs font-semibold">
                  {exam.duration} min
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-primary-50 rounded-xl">
                  <div className="text-2xl font-semibold text-accent-600">{exam.questions.length}</div>
                  <div className="text-xs text-gray-600 mt-1">Questions</div>
                </div>
                <div className="text-center p-3 bg-primary-50 rounded-xl">
                  <div className="text-2xl font-semibold text-accent-600">{exam.total_marks}</div>
                  <div className="text-xs text-gray-600 mt-1">Total Marks</div>
                </div>
                <div className="text-center p-3 bg-primary-50 rounded-xl">
                  <div className="text-2xl font-semibold text-accent-600">{stats.uniqueStudents}</div>
                  <div className="text-xs text-gray-600 mt-1">Students</div>
                </div>
                <div className="text-center p-3 bg-primary-50 rounded-xl">
                  <div className="text-2xl font-semibold text-accent-600">{stats.totalAttempts}</div>
                  <div className="text-xs text-gray-600 mt-1">Attempts</div>
                </div>
              </div>

              {stats.totalAttempts > 0 && (
                <div className="mb-5 p-4 bg-primary-50 border border-primary-200 rounded-xl">
                  <div className="text-sm font-medium text-gray-600 mb-1">Average Score</div>
                  <div className="text-2xl font-semibold text-gray-900">{stats.avgScore.toFixed(1)}%</div>
                </div>
              )}

              {/* Actions */}
              <button
                onClick={() => onDelete(exam._id)}
                className="w-full bg-white border border-red-200 text-red-600 py-3 px-4 rounded-xl font-semibold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Exam
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const SessionDetailModal = ({ session, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-soft-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-primary-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-primary-200 px-8 py-5 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {session.student_name}'s Results
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {session.exam_title || session.exam?.exam_title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-primary-50 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Score Summary */}
        <div className="px-8 py-6 bg-primary-50 border-b border-primary-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div className="text-center p-4 bg-white rounded-xl border border-primary-200">
              <div className="text-3xl font-semibold text-accent-600">
                {session.percentage.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600 mt-2">Score</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl border border-primary-200">
              <div className="text-2xl font-semibold text-gray-900">
                {session.marks_obtained}/{session.total_marks}
              </div>
              <div className="text-xs text-gray-600 mt-2">Marks</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl border border-primary-200">
              <div className={`text-2xl font-semibold ${
                session.percentage >= 50 ? 'text-green-600' : 'text-red-600'
              }`}>
                {session.percentage >= 50 ? 'Passed' : 'Failed'}
              </div>
              <div className="text-xs text-gray-600 mt-2">Status</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl border border-primary-200">
              <div className="text-2xl font-semibold text-gray-900">
                {session.answers.filter(a => a.is_correct).length}/{session.answers.length}
              </div>
              <div className="text-xs text-gray-600 mt-2">Correct</div>
            </div>
          </div>
        </div>

        {/* Answer Breakdown */}
        <div className="px-8 py-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-5">Answer Breakdown</h3>
          <div className="space-y-4">
            {session.answers.map((answer, index) => (
              <div
                key={index}
                className={`border rounded-xl p-5 ${
                  answer.is_correct
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold ${
                    answer.is_correct
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        answer.question_type === 'MCQ'
                          ? 'bg-accent-50 text-accent-700 border-accent-200'
                          : 'bg-primary-100 text-gray-700 border-primary-200'
                      }`}>
                        {answer.question_type}
                      </span>
                      <span className="text-sm text-gray-600 font-medium">
                        {answer.marks_obtained}/{answer.max_marks} marks
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 mb-3">
                      {answer.question_text}
                    </p>
                    <div className="text-sm space-y-2">
                      <div>
                        <span className="font-semibold text-gray-700">Student Answer: </span>
                        <span className={answer.is_correct ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                          {answer.student_answer || '(No answer)'}
                        </span>
                      </div>
                      {!answer.is_correct && (
                        <div>
                          <span className="font-semibold text-gray-700">Correct Answer: </span>
                          <span className="text-green-700 font-medium">{answer.correct_answer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    {answer.is_correct ? (
                      <svg className="w-7 h-7 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-7 h-7 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultsDashboard
