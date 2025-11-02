import React from 'react'

const QuizPreview = ({ quiz }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-gray-900">{quiz.exam_title}</h2>
          <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
            Ready to Publish
          </span>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-medium">Type:</span>
            <span className="ml-1">{quiz.exam_type}</span>
          </div>

          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Duration:</span>
            <span className="ml-1">{quiz.duration} minutes</span>
          </div>

          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            <span className="font-medium">Total Questions:</span>
            <span className="ml-1">{quiz.questions.length}</span>
          </div>

          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span className="font-medium">Total Marks:</span>
            <span className="ml-1">{quiz.total_marks}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Questions Preview</h3>

        <div className="space-y-4">
          {quiz.questions.map((question, index) => (
            <QuestionCard key={index} question={question} index={index} />
          ))}
        </div>
      </div>

      {/* JSON Output Section */}
      <div className="mt-8 border-t border-gray-200 pt-6">
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-indigo-600 flex items-center">
            <svg className="w-5 h-5 mr-2 transform group-open:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            View Structured JSON
          </summary>
          <pre className="mt-4 p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto text-xs">
            {JSON.stringify(quiz, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  )
}

const QuestionCard = ({ question, index }) => {
  const isMCQ = question.type === 'MCQ'

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-gradient-to-r from-white to-gray-50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start flex-1">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm mr-3 flex-shrink-0">
            {index + 1}
          </span>
          <div className="flex-1">
            <p className="text-lg font-medium text-gray-900 mb-2">{question.text}</p>

            <div className="flex gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isMCQ
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {question.type}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                {question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}
              </span>
            </div>

            {isMCQ && (
              <div className="space-y-2 mb-3">
                {question.options.map((option, idx) => {
                  const isCorrect = option === question.answer
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        isCorrect
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                          isCorrect
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className={`text-sm ${isCorrect ? 'font-semibold text-green-900' : 'text-gray-700'}`}>
                          {option}
                        </span>
                        {isCorrect && (
                          <svg className="w-5 h-5 text-green-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="mt-3 p-3 bg-green-50 border-l-4 border-green-500 rounded">
              <p className="text-xs font-semibold text-green-900 mb-1">Correct Answer:</p>
              <p className="text-sm text-green-800">{question.answer}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuizPreview
