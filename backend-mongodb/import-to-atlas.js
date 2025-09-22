// Import script to load data into MongoDB Atlas
import mongoose from 'mongoose';
import fs from 'fs';

// You'll update this with your Atlas connection string
const ATLAS_URI = 'REPLACE_WITH_YOUR_ATLAS_CONNECTION_STRING';

async function importToAtlas() {
  try {
    // Check if export file exists
    const exportPath = './tea-stall-export.json';
    if (!fs.existsSync(exportPath)) {
      console.error('❌ Export file not found. Run migrate-to-atlas.js first');
      return;
    }

    console.log('📁 Reading export data...');
    const exportData = JSON.parse(fs.readFileSync(exportPath, 'utf8'));

    console.log('🔄 Connecting to Atlas...');
    await mongoose.connect(ATLAS_URI);
    console.log('✅ Connected to Atlas database');

    const db = mongoose.connection.db;

    // Import each collection
    for (const [collectionName, documents] of Object.entries(exportData)) {
      if (documents.length > 0) {
        console.log(`📦 Importing ${documents.length} documents to ${collectionName}...`);
        
        // Clear existing data (optional - remove if you want to preserve)
        await db.collection(collectionName).deleteMany({});
        
        // Insert documents
        await db.collection(collectionName).insertMany(documents);
        console.log(`✅ Imported ${documents.length} documents to ${collectionName}`);
      } else {
        console.log(`⚠️ No documents to import for ${collectionName}`);
      }
    }

    console.log('🎉 Import completed successfully!');

    // Verify import
    console.log('\n📊 Verification:');
    for (const collectionName of Object.keys(exportData)) {
      const count = await db.collection(collectionName).countDocuments();
      console.log(`  • ${collectionName}: ${count} documents`);
    }

  } catch (error) {
    console.error('❌ Import failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔐 Database connection closed');
  }
}

// Run import if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  importToAtlas();
}

export { importToAtlas };