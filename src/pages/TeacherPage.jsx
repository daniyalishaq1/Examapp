import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import QuizPreview from '../components/QuizPreview'
import ResultsDashboard from '../components/ResultsDashboard'

const TeacherPage = () => {
  const [activeTab, setActiveTab] = useState('create') // 'create' or 'results'
  const [formData, setFormData] = useState({
    examTitle: '',
    examType: 'MCQ',
    duration: '',
    mcqContent: '',
    shortContent: '',
    mcqMarks: 1,
    shortMarks: 5
  })

  const [structuredQuiz, setStructuredQuiz] = useState(null)
  const [loading, setLoading] = useState(false)
  const [llmProvider, setLlmProvider] = useState('mock')

  // Check LLM configuration on mount
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setLlmProvider(data.llm_provider)
        if (data.openai_configured) {
          toast.success('OpenAI LLM is configured and ready!', {
            duration: 3000,
            icon: '🤖'
          })
        }
      })
      .catch(err => console.error('Health check failed:', err))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleGenerateQuiz = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.examTitle || !formData.duration) {
      toast.error('Please fill in exam title and duration')
      return
    }

    // Check if at least one content field is filled based on exam type
    if (formData.examType === 'MCQ' && !formData.mcqContent.trim()) {
      toast.error('Please provide MCQ questions')
      return
    }

    if (formData.examType === 'Short' && !formData.shortContent.trim()) {
      toast.error('Please provide Short questions')
      return
    }

    if (formData.examType === 'Mixed' && !formData.mcqContent.trim() && !formData.shortContent.trim()) {
      toast.error('Please provide at least MCQ or Short questions')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/structure-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        setStructuredQuiz(result.data)
        toast.success('Quiz structured successfully! Ready to publish.', {
          duration: 4000,
          icon: '✅'
        })
      } else {
        toast.error(result.error || 'Failed to structure quiz')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred while structuring the quiz')
    } finally {
      setLoading(false)
    }
  }

  const exampleMCQ = `1. What is AI?
A. Artificial Intelligence
B. Animal Instinct
C. Automated Input
D. Active Integration
(Correct: A)

2. Who founded OpenAI?
A. Elon Musk
B. Sam Altman
C. Bill Gates
D. Mark Zuckerberg
(Correct: B)`

  const exampleShort = `1. Explain machine learning in 2 lines.
2. What are the main differences between supervised and unsupervised learning?`

  const loadExample = () => {
    setFormData({
      examTitle: 'AI Basics Quiz',
      examType: 'Mixed',
      duration: '15',
      mcqContent: exampleMCQ,
      shortContent: exampleShort,
      mcqMarks: 2,
      shortMarks: 5
    })
    toast.success('Example loaded!')
  }

  const showMCQSection = formData.examType === 'MCQ' || formData.examType === 'Mixed'
  const showShortSection = formData.examType === 'Short' || formData.examType === 'Mixed'

  return (
    <div className="min-h-screen bg-primary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-semibold text-gray-900 mb-3">
            QuickExam Teacher Portal
          </h1>
          <p className="text-gray-600 text-lg">
            Create AI-powered exams and view student results
          </p>
          <div className="mt-4 inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-white border border-primary-200 text-gray-700 shadow-soft">
            <span className="w-2 h-2 bg-accent-600 rounded-full mr-2 animate-pulse"></span>
            LLM Provider: {llmProvider.toUpperCase()}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 flex justify-center">
          <div className="bg-white rounded-xl shadow-soft border border-primary-200 p-1.5 inline-flex">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'create'
                  ? 'bg-accent-600 text-white shadow-soft'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-primary-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Create Exam
              </span>
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'results'
                  ? 'bg-accent-600 text-white shadow-soft'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-primary-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Results
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'create' ? (
          <>
        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-soft-lg border border-primary-200 p-10 mb-8">
          <div className="flex justify-between items-center mb-8 pb-6 border-b border-primary-200">
            <h2 className="text-2xl font-semibold text-gray-900">
              Create New Exam
            </h2>
            <button
              type="button"
              onClick={loadExample}
              className="text-sm text-accent-600 hover:text-accent-700 font-medium underline"
            >
              Load Example
            </button>
          </div>

          <form onSubmit={handleGenerateQuiz} className="space-y-8">
            {/* Exam Title */}
            <div>
              <label htmlFor="examTitle" className="block text-sm font-semibold text-gray-700 mb-3">
                Exam Title
              </label>
              <input
                type="text"
                id="examTitle"
                name="examTitle"
                value={formData.examTitle}
                onChange={handleChange}
                placeholder="e.g., Midterm Exam - AI Fundamentals"
                className="w-full px-4 py-3.5 border border-primary-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none transition"
              />
            </div>

            {/* Exam Type and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="examType" className="block text-sm font-semibold text-gray-700 mb-3">
                  Exam Type
                </label>
                <select
                  id="examType"
                  name="examType"
                  value={formData.examType}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border border-primary-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none transition"
                >
                  <option value="MCQ">MCQ Only</option>
                  <option value="Short">Short Answer Only</option>
                  <option value="Mixed">Mixed (MCQ + Short)</option>
                </select>
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-semibold text-gray-700 mb-3">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g., 30"
                  min="1"
                  className="w-full px-4 py-3.5 border border-primary-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none transition"
                />
              </div>
            </div>

            {/* MCQ Section */}
            {showMCQSection && (
              <div className="border border-primary-200 rounded-xl p-6 bg-white">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2.5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Multiple Choice Questions
                  </h3>
                  <div className="flex items-center gap-3">
                    <label htmlFor="mcqMarks" className="text-sm font-semibold text-gray-700">
                      Marks per MCQ:
                    </label>
                    <input
                      type="number"
                      id="mcqMarks"
                      name="mcqMarks"
                      value={formData.mcqMarks}
                      onChange={handleChange}
                      min="1"
                      className="w-20 px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none"
                    />
                  </div>
                </div>
                <textarea
                  id="mcqContent"
                  name="mcqContent"
                  value={formData.mcqContent}
                  onChange={handleChange}
                  rows="8"
                  placeholder={exampleMCQ}
                  className="w-full px-4 py-3.5 border border-primary-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none transition font-mono text-sm bg-primary-50"
                />
                <p className="text-xs text-gray-600 mt-3">
                  Tip: Provide questions in natural language. Include options A-D and mark the correct answer.
                </p>
              </div>
            )}

            {/* Short Answer Section */}
            {showShortSection && (
              <div className="border border-primary-200 rounded-xl p-6 bg-white">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2.5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Short Answer Questions
                  </h3>
                  <div className="flex items-center gap-3">
                    <label htmlFor="shortMarks" className="text-sm font-semibold text-gray-700">
                      Marks per Short:
                    </label>
                    <input
                      type="number"
                      id="shortMarks"
                      name="shortMarks"
                      value={formData.shortMarks}
                      onChange={handleChange}
                      min="1"
                      className="w-20 px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none"
                    />
                  </div>
                </div>
                <textarea
                  id="shortContent"
                  name="shortContent"
                  value={formData.shortContent}
                  onChange={handleChange}
                  rows="6"
                  placeholder={exampleShort}
                  className="w-full px-4 py-3.5 border border-primary-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none transition font-mono text-sm bg-primary-50"
                />
                <p className="text-xs text-gray-600 mt-3">
                  Tip: List your short answer questions. The LLM will structure them with expected answers.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-accent-600 hover:bg-accent-700 shadow-soft hover:shadow-soft-lg transform hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Quiz Structure with {llmProvider.toUpperCase()}...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Quiz Structure with AI
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Quiz Preview */}
        {structuredQuiz && <QuizPreview quiz={structuredQuiz} />}
          </>
        ) : (
          <ResultsDashboard />
        )}
      </div>
    </div>
  )
}

export default TeacherPage
