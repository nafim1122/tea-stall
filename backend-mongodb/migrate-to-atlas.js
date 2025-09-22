// Migration script to export data from local MongoDB to Atlas
import mongoose from 'mongoose';
import fs from 'fs';

const LOCAL_URI = 'mongodb://localhost:27017/tea-stall';

async function exportLocalData() {
  try {
    console.log('🔄 Connecting to local MongoDB...');
    await mongoose.connect(LOCAL_URI);
    console.log('✅ Connected to local database');

    const db = mongoose.connection.db;
    
    // Export collections
    const collections = ['products', 'users', 'orders', 'carts'];
    const exportData = {};

    for (const collectionName of collections) {
      console.log(`📦 Exporting ${collectionName}...`);
      const data = await db.collection(collectionName).find({}).toArray();
      exportData[collectionName] = data;
      console.log(`✅ Exported ${data.length} documents from ${collectionName}`);
    }

    // Save to file
    const exportPath = './tea-stall-export.json';
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    console.log(`📁 Data exported to: ${exportPath}`);
    console.log('🎉 Export completed successfully!');

    // Show summary
    console.log('\n📊 Export Summary:');
    Object.entries(exportData).forEach(([collection, data]) => {
      console.log(`  • ${collection}: ${data.length} documents`);
    });

  } catch (error) {
    console.error('❌ Export failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔐 Database connection closed');
  }
}

// Run export if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  exportLocalData();
}

export { exportLocalData };