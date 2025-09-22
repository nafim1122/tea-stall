// Quick Atlas connection test
import mongoose from 'mongoose';

async function testAtlasConnection() {
  // Replace YOUR_PASSWORD with your actual password
  const atlasUri = 'mongodb+srv://nafim:YOUR_PASSWORD@cluster0.cxdltx.mongodb.net/tea-stall?retryWrites=true&w=majority';
  
  try {
    console.log('🔄 Testing Atlas connection...');
    console.log('📍 Connecting to: cluster0.cxdltx.mongodb.net');
    
    await mongoose.connect(atlasUri, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000
    });
    
    console.log('✅ Atlas connection successful!');
    console.log('🌐 Your cluster is ready for data!');
    
    // Test database operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📁 Collections found: ${collections.length}`);
    
    await mongoose.disconnect();
    console.log('🔐 Disconnected from Atlas');
    
  } catch (error) {
    console.error('❌ Atlas connection failed:', error.message);
    console.log('\n💡 Common issues:');
    console.log('1. Check if you replaced YOUR_PASSWORD with actual password');
    console.log('2. Ensure your IP address is whitelisted (0.0.0.0/0)');
    console.log('3. Verify the username is correct (nafim)');
  }
}

// To test: Replace YOUR_PASSWORD in the URI above and run this file
testAtlasConnection();