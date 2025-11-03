import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const StudentLogin = () => {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' or 'signup'
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    // Check required fields based on mode
    if (mode === 'signup') {
      if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
        toast.error('Please fill in all fields')
        return false
      }
      // Password length check
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters')
        return false
      }
    } else {
      if (!formData.email.trim() || !formData.password.trim()) {
        toast.error('Please fill in all fields')
        return false
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const endpoint = mode === 'signup' ? '/api/student/signup' : '/api/student/login'
      const payload = mode === 'signup'
        ? { name: formData.name, email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `${mode === 'signup' ? 'Signup' : 'Login'} failed`)
      }

      // Store student data in localStorage
      localStorage.setItem('student', JSON.stringify(data.student || data))

      toast.success(mode === 'signup'
        ? `Account created successfully! Welcome, ${formData.name}!`
        : `Welcome back, ${data.student?.name || 'Student'}!`
      )

      navigate('/student/exams')
    } catch (error) {
      toast.error(error.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setFormData({
      name: '',
      email: '',
      password: ''
    })
    setShowPassword(false)
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
            {mode === 'signup' ? 'Create your account to take exams' : 'Sign in to access your exams'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="bg-primary-50 p-1 rounded-xl border border-primary-200 flex">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition duration-200 ${
              mode === 'login'
                ? 'bg-white text-accent-600 shadow-soft'
                : 'text-primary-600 hover:text-primary-900'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition duration-200 ${
              mode === 'signup'
                ? 'bg-white text-accent-600 shadow-soft'
                : 'text-primary-600 hover:text-primary-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Login/Signup Card */}
        <div className="bg-white border border-primary-200 rounded-2xl p-8 shadow-soft-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field - Only for Signup */}
            {mode === 'signup' && (
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
            )}

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

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-primary-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-white border border-primary-200 rounded-xl text-primary-900 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition duration-200 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600 transition duration-200"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-600 text-white py-3.5 px-6 rounded-xl font-medium hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 transition duration-200 shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
                </span>
              ) : (
                mode === 'signup' ? 'Create Account' : 'Sign In'
              )}
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
