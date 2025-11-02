# QuickExam - Quick Start Guide

## 🚀 Your System is Ready!

Your QuickExam application is fully configured with:
- ✅ **OpenAI GPT-4o-mini** for intelligent question parsing
- ✅ **MongoDB support** (works with or without it)
- ✅ **Separate MCQ/Short sections** with marks configuration
- ✅ **Beautiful preview interface**

## Start the Application

```bash
npm run dev
```

This starts:
- **Backend**: http://localhost:3001 (OpenAI + Database)
- **Frontend**: http://localhost:5173/teacher (UI)

## Create Your First Exam

### Option 1: Use the Example (Easiest)

1. Open http://localhost:5173/teacher
2. Click **"Load Example"** button (top right)
3. Click **"Generate Quiz Structure with AI"**
4. See the magic! ✨

### Option 2: Create Your Own

1. Fill in:
   - **Exam Title**: e.g., "Midterm Exam"
   - **Exam Type**: Select "Mixed" to see both sections
   - **Duration**: e.g., "30" minutes

2. **For MCQ Questions** (Blue Section):
   - Set marks per MCQ: e.g., "2"
   - Enter questions like:
     ```
     1. What is AI?
     A. Artificial Intelligence
     B. Animal Instinct
     C. Automated Input
     D. Active Integration
     (Correct: A)

     2. What is ML?
     A. Machine Learning
     B. Manual Labor
     C. Multiple Lists
     D. Main Loop
     (Correct: A)
     ```

3. **For Short Questions** (Purple Section):
   - Set marks per short: e.g., "5"
   - Enter questions like:
     ```
     1. Explain machine learning in 2 lines.
     2. What are neural networks?
     3. Describe supervised learning.
     ```

4. Click **"Generate Quiz Structure with AI"**

## What Happens Next

### Backend Processing:
```
Your Natural Language Input
         ↓
OpenAI GPT-4o-mini Parsing
         ↓
Structured JSON Output
         ↓
MongoDB Storage (if running)
         ↓
Response to Frontend
```

### You'll See:
- 🔄 Loading spinner
- ✅ Success toast: "Quiz structured successfully! Ready to publish."
- 📋 Beautiful preview cards with:
  - Question text
  - MCQ options (with correct answer highlighted in green)
  - Short questions with expected answers
  - Marks per question
  - Total marks calculated

## Understanding the Output

### MCQ Question Card:
```
┌─────────────────────────────────────────────┐
│ 1  What is AI?                     [MCQ] 2M │
│                                               │
│ ● A. Artificial Intelligence ✓ (Green)      │
│ ● B. Animal Instinct                        │
│ ● C. Automated Input                        │
│ ● D. Active Integration                     │
│                                               │
│ ✓ Correct Answer: Artificial Intelligence   │
└─────────────────────────────────────────────┘
```

### Short Question Card:
```
┌─────────────────────────────────────────────┐
│ 2  Explain ML in 2 lines.      [Short] 5M  │
│                                               │
│ ✓ Expected Answer:                           │
│   Machine learning is a subset of AI that    │
│   enables systems to learn from data...      │
└─────────────────────────────────────────────┘
```

## Check System Status

Visit: http://localhost:3001/api/health

You should see:
```json
{
  "success": true,
  "llm_provider": "openai",
  "openai_configured": true,
  "database_connected": false,  // true if MongoDB is running
  "database_name": "Not connected"  // "quickexam" if connected
}
```

## MongoDB (Optional)

### Why MongoDB?
- Persistent storage of exams
- Query and retrieve past exams
- Database statistics
- Production-ready

### Without MongoDB:
- ✅ App works perfectly
- ⚠️ Exams stored in memory only
- ⚠️ Lost on server restart

### To Install MongoDB:

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Verify:**
```bash
mongosh
# Should connect successfully
```

**Restart Server:**
```bash
# Stop server (Ctrl+C)
npm run dev
```

Now you'll see:
```
✓ MongoDB Connected Successfully
📦 Database: quickexam
```

And when you create exams:
```
✓ Exam saved to database: 673fa1b5c8e4f2a3d1e5b9c7
```

## Example Questions Format

### MCQ Format (Flexible):

**Format 1: Multi-line**
```
1. What is Python?
A. Snake
B. Programming Language
C. Math Tool
D. Database
(Correct: B)
```

**Format 2: Inline**
```
1. What is Python? A. Snake B. Programming Language C. Math Tool D. Database (Correct: B)
```

Both work! OpenAI is smart enough to parse various formats.

### Short Question Format:

```
1. Explain object-oriented programming.
2. What are the benefits of using React?
3. Describe the MVC architecture pattern.
```

Just list the questions - OpenAI will generate expected answers.

## API Testing

### Create Exam:
```bash
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

### Get All Exams:
```bash
curl http://localhost:3001/api/quizzes
```

### Get Stats:
```bash
curl http://localhost:3001/api/stats
```

## Troubleshooting

### Frontend Shows Errors
**Problem:** Health check failing
**Solution:** Make sure server is running on port 3001
```bash
# In one terminal
npm run server

# In another terminal
npm run client
```

### OpenAI Not Working
**Problem:** Using mock parser instead of OpenAI
**Check `.env`:**
```env
OPENAI_API_KEY=sk-proj-...  # Must be set
LLM_PROVIDER=openai          # Must be "openai"
```
**Restart server after changes**

### Questions Not Parsing Well
**Tips:**
- Number your questions: `1.`, `2.`, etc.
- For MCQ, use letters: `A.`, `B.`, `C.`, `D.`
- Mark correct answer: `(Correct: A)`
- Keep format consistent
- OpenAI is flexible but clear format helps

### MongoDB Connection Refused
**It's OK!** The app works without MongoDB.

**To fix (optional):**
```bash
# Install
brew install mongodb-community

# Start
brew services start mongodb-community

# Verify
mongosh
```

## Tips for Best Results

### 1. Clear Question Format
```
✅ Good:
1. What is AI?
A. Artificial Intelligence
B. Animal Instinct
(Correct: A)

❌ Avoid:
Q1 - What is AI? (a) Artificial Intelligence (b) Animal Instinct - Answer: a
```

### 2. One Question Per Number
```
✅ Good:
1. First question?
2. Second question?

❌ Avoid:
1. First question? Second question?
```

### 3. Specify Marks Clearly
Use the marks configuration fields instead of including marks in text (though OpenAI can parse both).

### 4. Consistent Answer Format
```
✅ Use:
(Correct: A)  or  Correct: A

❌ Avoid:
ans: A  or  answer is A
```

## Next Steps

1. **Create a few test exams** to get familiar with the system
2. **Try different question formats** to see OpenAI's flexibility
3. **Install MongoDB** for persistent storage (optional)
4. **Check the preview** to ensure questions are parsed correctly
5. **Use the stats endpoint** to monitor your exam collection

## Features to Explore

### Current:
- ✅ Natural language input
- ✅ AI parsing with OpenAI
- ✅ Separate MCQ/Short sections
- ✅ Marks configuration
- ✅ Beautiful previews
- ✅ Database storage (optional)

### Coming Soon:
- 📝 Student exam interface
- ✅ Auto-grading for MCQs
- 📊 Analytics dashboard
- 📄 Export to PDF
- 🏦 Question bank

## Support & Documentation

- **[README.md](README.md)** - Full documentation
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup instructions
- **[INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md)** - Technical details

## You're All Set! 🎉

Your QuickExam system is configured and ready to use with:
- 🤖 OpenAI GPT-4o-mini for intelligent parsing
- 💾 MongoDB support (works with or without)
- ⚡ Fast and reliable API
- 🎨 Beautiful user interface

Start creating AI-powered exams now:
```bash
npm run dev
```

Then visit: http://localhost:5173/teacher

Happy exam creating! 📚✨
