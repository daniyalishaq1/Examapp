import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB Atlas');

    const db = mongoose.connection.db;

    // List all databases
    const admin = db.admin();
    const dbs = await admin.listDatabases();
    console.log('\n📚 Available Databases:');
    dbs.databases.forEach(db => {
      console.log(`  - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });

    // Check collections in quickexam database
    console.log('\n📁 Collections in "quickexam" database:');
    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log('  ⚠️  No collections found - database is empty!');
    } else {
      for (const coll of collections) {
        const count = await db.collection(coll.name).countDocuments();
        console.log(`  - ${coll.name}: ${count} documents`);
      }
    }

    await mongoose.disconnect();
    console.log('\n✓ Disconnected');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
