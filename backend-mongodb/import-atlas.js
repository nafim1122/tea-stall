// Import script to load data into MongoDB Atlas
import mongoose from 'mongoose';
import fs from 'fs';

// You'll replace this with your actual Atlas connection string
const ATLAS_URI = 'REPLACE_WITH_YOUR_ATLAS_CONNECTION_STRING';

async function importToAtlas(atlasConnectionString) {
  try {
    // Check if backup file exists
    if (!fs.existsSync('tea-stall-backup.json')) {
      console.error('❌ Backup file not found! Run export-data.js first');
      return;
    }

    console.log('📁 Reading backup data...');
    const backupData = JSON.parse(fs.readFileSync('tea-stall-backup.json', 'utf8'));

    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(atlasConnectionString);
    console.log('✅ Connected to Atlas successfully!');

    const db = mongoose.connection.db;

    // Import each collection
    for (const [collectionName, documents] of Object.entries(backupData)) {
      if (documents && documents.length > 0) {
        console.log(`📦 Importing ${documents.length} documents to ${collectionName}...`);
        
        // Clear existing collection (optional)
        await db.collection(collectionName).deleteMany({});
        
        // Insert documents
        await db.collection(collectionName).insertMany(documents);
        console.log(`✅ Successfully imported ${documents.length} documents to ${collectionName}`);
      } else {
        console.log(`⚠️ No documents to import for ${collectionName}`);
      }
    }

    console.log('\n🎉 Import to Atlas completed successfully!');

    // Verify the import
    console.log('\n📊 Verification - Atlas Database Contents:');
    for (const collectionName of Object.keys(backupData)) {
      const count = await db.collection(collectionName).countDocuments();
      console.log(`  • ${collectionName}: ${count} documents`);
    }

    console.log('\n🌟 Your tea-stall database is now live on MongoDB Atlas!');

  } catch (error) {
    console.error('❌ Import to Atlas failed:', error.message);
    if (error.message.includes('REPLACE_WITH_YOUR_ATLAS_CONNECTION_STRING')) {
      console.log('\n💡 Instructions:');
      console.log('1. Get your Atlas connection string from the Atlas dashboard');
      console.log('2. Replace the ATLAS_URI in this script');
      console.log('3. Or run: importToAtlas("your_connection_string")');
    }
  } finally {
    await mongoose.disconnect();
  }
}

// Export function for external use
export { importToAtlas };

// Run import if connection string is provided as argument
const connectionString = process.argv[2];
if (connectionString && connectionString !== 'REPLACE_WITH_YOUR_ATLAS_CONNECTION_STRING') {
  importToAtlas(connectionString);
} else if (import.meta.url === `file://${process.argv[1]}`) {
  importToAtlas(ATLAS_URI);
}