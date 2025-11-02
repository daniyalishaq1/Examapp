import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const StudentLogin = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    // Store student info in localStorage
    localStorage.setItem('student', JSON.stringify(formData))

    toast.success(`Welcome, ${formData.name}!`)
    navigate('/student/exams')
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-50 mb-2">
            <svg className="w-8 h-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-primary-900 tracking-tight">
            Student Portal
          </h1>
          <p className="text-primary-500 text-base">
            Enter your details to begin your exam
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-primary-200 rounded-2xl p-8 shadow-soft-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-primary-700">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 bg-white border border-primary-200 rounded-xl text-primary-900 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition duration-200"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-primary-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-white border border-primary-200 rounded-xl text-primary-900 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition duration-200"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-accent-600 text-white py-3.5 px-6 rounded-xl font-medium hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 transition duration-200 shadow-soft"
            >
              Continue to Exams
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-100">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-accent-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-primary-600 space-y-1">
                <p className="font-medium">Before you begin</p>
                <ul className="space-y-1 text-primary-500">
                  <li>• Ensure stable internet connection</li>
                  <li>• Find a quiet environment</li>
                  <li>• Results are saved automatically</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Portal Link */}
        <div className="text-center">
          <button
            onClick={() => navigate('/teacher')}
            className="text-sm text-primary-600 hover:text-accent-600 font-medium transition duration-200"
          >
            Teacher Portal →
          </button>
        </div>
      </div>
    </div>
  )
}

export default StudentLogin
