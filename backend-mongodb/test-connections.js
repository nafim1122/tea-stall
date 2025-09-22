// Script to quickly test different database connection options
import mongoose from 'mongoose';

// Test connection to any MongoDB URI
async function testConnection(uri, name) {
  try {
    console.log(`🔄 Testing ${name} connection...`);
    await mongoose.connect(uri, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000
    });
    console.log(`✅ ${name} connection successful!`);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📁 Available collections: ${collections.length}`);
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.error(`❌ ${name} connection failed:`, error.message);
    await mongoose.disconnect();
    return false;
  }
}

// Test local MongoDB
export async function testLocal() {
  return await testConnection('mongodb://localhost:27017/tea-stall', 'Local MongoDB');
}

// Test Atlas Free Tier (you'll update this)
export async function testAtlas(atlasUri) {
  return await testConnection(atlasUri, 'MongoDB Atlas');
}

// Test Railway (you'll update this)
export async function testRailway(railwayUri) {
  return await testConnection(railwayUri, 'Railway MongoDB');
}

// Run tests
async function runAllTests() {
  console.log('🧪 Testing database connections...\n');
  
  // Test local first
  await testLocal();
  
  console.log('\n💡 To test cloud databases:');
  console.log('   1. Get your connection string');
  console.log('   2. Run: testAtlas("your_connection_string")');
  console.log('   3. Or: testRailway("your_connection_string")');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}