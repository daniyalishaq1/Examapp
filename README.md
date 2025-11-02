# QuickExam - AI-Powered Exam Creation Platform

A full-stack application that allows teachers to create structured exams using natural language input and AI parsing with real LLM integration.

## Features

### Teacher Module
- **Separate Input Sections**: Create MCQ and Short Answer questions independently or together (Mixed mode)
- **Flexible Marks Configuration**: Set custom marks for each question type
- **Real LLM Integration**: Uses OpenAI GPT-4o-mini for intelligent question parsing
- **Fallback Mock Parser**: Works without API key using regex-based parsing
- **Real-time Preview**: See structured questions with marks, options, and correct answers
- **Toast Notifications**: User-friendly feedback for all actions
- **Beautiful UI**: Modern design with Tailwind CSS and color-coded sections

## Tech Stack

**Frontend:**
- React 18
- React Router
- Tailwind CSS
- React Hot Toast

**Backend:**
- Node.js
- Express
- OpenAI GPT-4o-mini API
- MongoDB with Mongoose
- CORS enabled

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure LLM provider (optional):
```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:
```env
OPENAI_API_KEY=your_openai_api_key_here
LLM_PROVIDER=openai
MONGODB_URI=mongodb://localhost:27017/quickexam
```

**Your OpenAI API is already configured!** ✅

3. (Optional) Install and start MongoDB:
```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Note:** The app works without MongoDB - it will use in-memory storage as fallback.

## Running the Application

Start both frontend and backend concurrently:
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

Or run them separately:
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

## Usage

### Creating an Exam

1. Navigate to `/teacher` route (or homepage)
2. Fill in the exam details:
   - **Exam Title**: Name of your exam
   - **Exam Type**: Choose from:
     - MCQ Only
     - Short Answer Only
     - Mixed (MCQ + Short)
   - **Duration**: Time limit in minutes

3. Configure marks:
   - Set marks per MCQ question
   - Set marks per Short question

4. Add questions:
   - **For MCQ**: Paste questions with options A-D and mark correct answer
   - **For Short**: List questions in natural language

5. Click "Load Example" to see sample input format

6. Click "Generate Quiz Structure with AI" to parse the content

7. View the structured quiz preview with:
   - Question cards showing type, marks, options
   - Correct answers highlighted
   - Total marks and duration
   - Raw JSON output (expandable)

### Example Input Formats

**MCQ Questions:**
```
1. What is AI?
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
(Correct: B)
```

**Short Answer Questions:**
```
1. Explain machine learning in 2 lines.
2. What are the main differences between supervised and unsupervised learning?
3. Describe how neural networks work.
```

## API Endpoints

### POST `/api/structure-quiz`
Structure exam content using LLM or mock parser

**Request Body:**
```json
{
  "examTitle": "AI Basics Quiz",
  "examType": "Mixed",
  "duration": "15",
  "mcqContent": "1. What is AI?...",
  "shortContent": "1. Explain ML...",
  "mcqMarks": 2,
  "shortMarks": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exam_type": "Mixed",
    "exam_title": "AI Basics Quiz",
    "duration": 15,
    "total_marks": 14,
    "questions": [
      {
        "type": "MCQ",
        "text": "What is AI?",
        "options": ["Artificial Intelligence", "Animal Instinct", "Automated Input", "Active Integration"],
        "answer": "Artificial Intelligence",
        "marks": 2
      },
      {
        "type": "Short",
        "text": "Explain machine learning in 2 lines.",
        "answer": "Expected answer based on course material",
        "marks": 5
      }
    ],
    "created_at": "2025-11-02T...",
    "llm_provider": "openai"
  }
}
```

### GET `/api/quizzes`
Get all created quizzes (stored in memory)

### GET `/api/health`
Check LLM configuration status

**Response:**
```json
{
  "success": true,
  "llm_provider": "openai",
  "openai_configured": true
}
```

## LLM Integration

### OpenAI Integration
The application uses OpenAI's GPT-4o-mini model for intelligent question parsing with:
- Natural language understanding
- Automatic option extraction
- Smart answer detection
- Expected answer generation for short questions

**How it works:**
1. Teacher provides questions in natural language
2. System builds a structured prompt with exam context
3. OpenAI API parses and structures the questions
4. Returns JSON with properly formatted questions, options, and answers

### Mock Parser (Fallback)
If no LLM is configured, the system uses an enhanced regex-based parser that:
- Supports multiple question formats
- Extracts MCQ options (A-D)
- Detects correct answers
- Parses marks from input or uses defaults
- Handles both inline and multi-line formats

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | - |
| `LLM_PROVIDER` | LLM to use: `openai` or `mock` | `mock` |

## Project Structure

```
QuickExam/
├── server/
│   └── index.js              # Express backend with LLM integration
├── src/
│   ├── components/
│   │   └── QuizPreview.jsx   # Quiz preview with question cards
│   ├── pages/
│   │   └── TeacherPage.jsx   # Main teacher interface
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env                      # Environment configuration
├── .env.example              # Example environment file
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Key Features Explained

### Separate MCQ and Short Sections
When "Mixed" exam type is selected, two separate colored sections appear:
- **Blue section** for MCQ questions with marks configuration
- **Purple section** for Short questions with marks configuration

This makes it easy to organize different question types and assign appropriate marks.

### Marks Configuration
Instead of hardcoding marks in each question, set default marks per question type:
- MCQ marks: 1-10 (typically 1-2 marks)
- Short marks: 1-20 (typically 5-10 marks)

The system applies these marks to all questions of that type.

### Flexible Question Formats
The parser handles multiple formats:
- Questions on single line with inline options
- Multi-line format with separate option lines
- Optional marks specification per question
- With or without "Correct:" indicator

## Future Enhancements

- [ ] Database persistence (MongoDB, PostgreSQL)
- [ ] Student exam-taking interface
- [ ] Auto-grading for MCQs
- [ ] Export to PDF
- [ ] Question bank management
- [ ] Anthropic Claude integration
- [ ] Bulk question import from CSV
- [ ] Question difficulty levels
- [ ] Time tracking per question

## Troubleshooting

**LLM not working:**
- Check that `OPENAI_API_KEY` is set in `.env`
- Ensure `LLM_PROVIDER=openai` in `.env`
- Verify API key has sufficient credits
- Check server logs for errors

**Parser issues:**
- Ensure questions follow the example format
- Mark correct answers with `(Correct: A)` notation
- Use A-D for MCQ options
- Check that options are properly formatted

**Port conflicts:**
- Frontend runs on port 5173
- Backend runs on port 3001
- Change ports in `vite.config.js` and `server/index.js` if needed

## License

MIT
