import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function viewData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB Atlas\n');

    const db = mongoose.connection.db;

    // View Exams
    console.log('📝 EXAMS:');
    console.log('='.repeat(80));
    const exams = await db.collection('exams').find({}).toArray();
    exams.forEach((exam, i) => {
      console.log(`\n${i + 1}. ${exam.exam_title}`);
      console.log(`   Type: ${exam.exam_type}`);
      console.log(`   Duration: ${exam.duration} minutes`);
      console.log(`   Questions: ${exam.questions?.length || 0}`);
      console.log(`   Total Marks: ${exam.total_marks}`);
      console.log(`   Created: ${exam.createdAt}`);
    });

    // View Students
    console.log('\n\n👥 STUDENTS:');
    console.log('='.repeat(80));
    const students = await db.collection('students').find({}).toArray();
    students.forEach((student, i) => {
      console.log(`\n${i + 1}. ${student.name}`);
      console.log(`   Email: ${student.email}`);
      console.log(`   Registered: ${student.createdAt}`);
    });

    // View Exam Sessions (Results)
    console.log('\n\n📊 EXAM SESSIONS (Student Results):');
    console.log('='.repeat(80));
    const sessions = await db.collection('examsessions').find({}).toArray();
    sessions.forEach((session, i) => {
      console.log(`\n${i + 1}. ${session.student_name} - ${session.exam_title}`);
      console.log(`   Email: ${session.student_email}`);
      console.log(`   Score: ${session.marks_obtained}/${session.total_marks} (${session.percentage.toFixed(2)}%)`);
      console.log(`   Status: ${session.status}`);
      console.log(`   Started: ${session.started_at}`);
      console.log(`   Completed: ${session.completed_at || 'In Progress'}`);
      console.log(`   Answers: ${session.answers?.length || 0} questions answered`);
    });

    console.log('\n' + '='.repeat(80));
    console.log(`\nTotal: ${exams.length} exams, ${students.length} students, ${sessions.length} exam attempts`);

    await mongoose.disconnect();
    console.log('\n✓ Disconnected');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

viewData();
