# QuickExam Setup Guide

Complete guide to set up QuickExam with OpenAI LLM and MongoDB integration.

## System Overview

```
Teacher Input (Natural Language)
         ↓
    OpenAI GPT-4o-mini (LLM)
         ↓
    Structured JSON
         ↓
    MongoDB Database
```

## Database Schema

### Exam Collection
```javascript
{
  exam_title: String,      // "AI Basics Quiz"
  exam_type: String,       // "MCQ" | "Short" | "Mixed"
  duration: Number,        // in minutes
  total_marks: Number,     // auto-calculated
  questions: [
    {
      type: String,        // "MCQ" | "Short"
      text: String,        // Question text
      options: [String],   // MCQ options (empty for Short)
      answer: String,      // Correct answer
      marks: Number        // Question marks
    }
  ],
  llm_provider: String,    // "openai" | "mock"
  created_by: String,      // "teacher"
  createdAt: Date,
  updatedAt: Date
}
```

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MongoDB** (optional, will work without it)
3. **OpenAI API Key** (you already have this configured!)

## Installation

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `express` - Web server
- `mongoose` - MongoDB ODM
- `openai` - OpenAI API client
- `react` - Frontend framework
- Other dependencies

### 2. Environment Configuration

Your `.env` file is already configured with:

```env
OPENAI_API_KEY=sk-proj-...
LLM_PROVIDER=openai
MONGODB_URI=mongodb://localhost:27017/quickexam
```

## MongoDB Setup (Optional)

### Option 1: Local MongoDB

1. **Install MongoDB:**
   ```bash
   # macOS
   brew tap mongodb/brew
   brew install mongodb-community

   # Start MongoDB
   brew services start mongodb-community
   ```

2. **Verify MongoDB is running:**
   ```bash
   mongosh
   # Should connect successfully
   ```

### Option 2: MongoDB Atlas (Cloud)

1. Create free account at https://www.mongodb.com/atlas
2. Create a cluster
3. Get connection string
4. Update `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quickexam
   ```

### Option 3: No Database

The app works without MongoDB - it will use in-memory storage.

## Running the Application

### Start Everything
```bash
npm run dev
```

This starts:
- **Backend**: http://localhost:3001 (with OpenAI + MongoDB)
- **Frontend**: http://localhost:5173

### Check System Status

Visit: http://localhost:3001/api/health

Response:
```json
{
  "success": true,
  "llm_provider": "openai",
  "openai_configured": true,
  "database_connected": true,
  "database_name": "quickexam"
}
```

## How It Works

### 1. Teacher Creates Exam

**Input:**
- Exam title, type, duration
- MCQ questions in natural language
- Short questions in natural language
- Marks per question type

**Example MCQ Input:**
```
1. What is AI?
A. Artificial Intelligence
B. Animal Instinct
C. Automated Input
D. Active Integration
(Correct: A)
```

**Example Short Input:**
```
1. Explain machine learning in 2 lines.
2. Describe neural networks.
```

### 2. LLM Processing

The system sends this prompt to OpenAI:

```
Parse the following exam questions into structured JSON format.

Exam Title: AI Basics Quiz
Exam Type: Mixed
Duration: 15 minutes

MCQ Questions (2 marks each):
[teacher's MCQ input]

Short Answer Questions (5 marks each):
[teacher's short questions]

Return a JSON object with:
- questions array with type, text, options, answer, marks
- total_marks
```

### 3. Structured Output

OpenAI returns:
```json
{
  "questions": [
    {
      "type": "MCQ",
      "text": "What is AI?",
      "options": ["Artificial Intelligence", "Animal Instinct", ...],
      "answer": "Artificial Intelligence",
      "marks": 2
    },
    {
      "type": "Short",
      "text": "Explain machine learning in 2 lines.",
      "answer": "Machine learning is a subset of AI...",
      "marks": 5
    }
  ],
  "total_marks": 7
}
```

### 4. Database Storage

The structured exam is saved to MongoDB:

```javascript
const exam = new Exam({
  exam_title: "AI Basics Quiz",
  exam_type: "Mixed",
  duration: 15,
  total_marks: 7,
  questions: [...],
  llm_provider: "openai"
});

await exam.save();
```

### 5. Preview & Confirmation

The frontend displays:
- Question cards with options
- Correct answers highlighted
- Total marks calculated
- Save confirmation

## API Endpoints

### Create Exam
```http
POST /api/structure-quiz

Body:
{
  "examTitle": "AI Basics Quiz",
  "examType": "Mixed",
  "duration": "15",
  "mcqContent": "1. What is AI?...",
  "shortContent": "1. Explain ML...",
  "mcqMarks": 2,
  "shortMarks": 5
}

Response:
{
  "success": true,
  "data": { ... exam object ... },
  "saved_to_db": true
}
```

### Get All Exams
```http
GET /api/quizzes

Response:
{
  "success": true,
  "data": [ ... array of exams ... ],
  "count": 10
}
```

### Get Single Exam
```http
GET /api/quizzes/:id

Response:
{
  "success": true,
  "data": { ... exam object ... }
}
```

### Delete Exam
```http
DELETE /api/quizzes/:id

Response:
{
  "success": true,
  "message": "Exam deleted successfully"
}
```

### Get Stats
```http
GET /api/stats

Response:
{
  "success": true,
  "data": {
    "total_exams": 25,
    "exams_by_type": [
      { "_id": "MCQ", "count": 10 },
      { "_id": "Mixed", "count": 15 }
    ],
    "database_connected": true
  }
}
```

## Testing the Integration

### 1. Test OpenAI LLM

```bash
# Start server
npm run server

# In another terminal, test with curl
curl -X POST http://localhost:3001/api/structure-quiz \
  -H "Content-Type: application/json" \
  -d '{
    "examTitle": "Test Quiz",
    "examType": "MCQ",
    "duration": "10",
    "mcqContent": "1. What is 2+2?\nA. 3\nB. 4\nC. 5\nD. 6\n(Correct: B)",
    "mcqMarks": 1
  }'
```

Expected: Structured JSON response with OpenAI processing

### 2. Test Database Storage

```bash
# Check MongoDB
mongosh quickexam

# List exams
db.exams.find().pretty()

# Count documents
db.exams.countDocuments()
```

### 3. Test Complete Flow

1. Open http://localhost:5173/teacher
2. Fill in exam details
3. Click "Load Example"
4. Click "Generate Quiz Structure with AI"
5. Watch for:
   - Loading spinner
   - Success toast
   - Preview cards
   - Check console logs for "Exam saved to database"

## Monitoring

### Server Logs

Watch for these messages:

```
🚀 QuickExam Server running on http://localhost:3001
📝 LLM Provider: openai
🤖 OpenAI: ✓ Configured
💾 MongoDB: mongodb://localhost:27017/quickexam
✓ MongoDB Connected Successfully
📦 Database: quickexam
✓ Exam saved to database: 673fa1b5c8e4f2a3d1e5b9c7
```

### Error Messages

If MongoDB is not running:
```
✗ MongoDB Connection Error: connect ECONNREFUSED
⚠️  App will continue with in-memory storage
```

This is OK - the app will still work without database persistence.

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Teacher Input                           │
│  (Natural Language MCQs + Short Questions + Marks Config)    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (React)                           │
│  • Form validation                                           │
│  • Separate MCQ/Short sections                              │
│  • Marks configuration                                       │
└─────────────────────────┬───────────────────────────────────┘
                          │ POST /api/structure-quiz
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Express)                          │
│  • Receive request                                           │
│  • Check LLM_PROVIDER                                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
┌─────────────────────────┐  ┌──────────────────────┐
│   OpenAI GPT-4o-mini    │  │   Mock Parser        │
│   • Smart parsing       │  │   • Regex-based      │
│   • Context aware       │  │   • Fallback option  │
└─────────────┬───────────┘  └──────────┬───────────┘
              │                         │
              └───────────┬─────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│               Structured JSON Output                         │
│  {                                                           │
│    "exam_title": "...",                                      │
│    "questions": [                                            │
│      { "type": "MCQ", "text": "...", "options": [...],      │
│        "answer": "...", "marks": 2 },                        │
│      { "type": "Short", "text": "...",                       │
│        "answer": "...", "marks": 5 }                         │
│    ],                                                        │
│    "total_marks": 7                                          │
│  }                                                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│               MongoDB (Mongoose)                             │
│  • Save to 'exams' collection                                │
│  • Each question stored as subdocument                       │
│  • Indexed by title and createdAt                            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│               Response to Frontend                           │
│  {                                                           │
│    "success": true,                                          │
│    "data": { ...exam with _id... },                          │
│    "saved_to_db": true                                       │
│  }                                                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Preview Display                             │
│  • Question cards with styling                               │
│  • MCQ options with correct answer highlighted               │
│  • Short questions with expected answers                     │
│  • Total marks and exam metadata                             │
│  • Success toast notification                                │
└─────────────────────────────────────────────────────────────┘
```

## Troubleshooting

### OpenAI API Issues

**Error: "Invalid API key"**
- Check `.env` file has correct key
- Restart server after updating `.env`

**Error: "Rate limit exceeded"**
- OpenAI has usage limits
- Wait a moment and try again

### MongoDB Issues

**Connection refused**
- MongoDB not running: `brew services start mongodb-community`
- Wrong connection string in `.env`
- Firewall blocking connection

**App will work without MongoDB** - it uses in-memory storage as fallback

### Question Parsing Issues

**MCQs not parsing correctly:**
- Ensure format: `A. Option1`, `B. Option2`, etc.
- Mark correct answer: `(Correct: A)`
- Check console logs for parsing errors

**Short questions issues:**
- Number questions: `1. Question text`
- One question per line
- OpenAI is flexible with formats

## Next Steps

1. **Test the system:**
   ```bash
   npm run dev
   ```

2. **Create your first exam:**
   - Visit http://localhost:5173/teacher
   - Click "Load Example"
   - Click "Generate Quiz Structure with AI"
   - See the magic happen!

3. **Check the database:**
   ```bash
   mongosh quickexam
   db.exams.find().pretty()
   ```

4. **View all exams:**
   - http://localhost:3001/api/quizzes

## Support

Your setup is complete with:
- ✅ OpenAI API configured
- ✅ Database models created
- ✅ API endpoints ready
- ✅ Frontend integrated

The system is ready to:
1. Accept natural language questions from teachers
2. Parse them using OpenAI GPT-4o-mini
3. Structure them into JSON format
4. Save to MongoDB with Question/Answer/Marks
5. Display beautiful previews

Enjoy creating AI-powered exams! 🚀
