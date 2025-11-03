import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import TeacherPage from './pages/TeacherPage'
import TeacherLogin from './pages/TeacherLogin'
import StudentLogin from './pages/StudentLogin'
import ExamList from './pages/ExamList'
import QuestionPage from './pages/QuestionPage'
import ExamResults from './pages/ExamResults'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        <Routes>
          {/* Student Routes */}
          <Route path="/" element={<StudentLogin />} />
          <Route path="/student" element={<StudentLogin />} />
          <Route path="/student/exams" element={<ExamList />} />
          <Route path="/student/exam/:examId" element={<QuestionPage />} />
          <Route path="/student/exam/link/:examLink" element={<QuestionPage />} />
          <Route path="/student/results/:sessionId" element={<ExamResults />} />

          {/* Teacher Routes */}
          <Route path="/teacher" element={<TeacherLogin />} />
          <Route path="/teacher/dashboard" element={<TeacherPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
