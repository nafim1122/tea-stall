// MongoDB Database Viewer for Tea Stall
import mongoose from 'mongoose';

async function viewDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/tea-stall');
    console.log('🔗 Connected to tea-stall database\n');
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections in database:');
    collections.forEach(col => console.log(`  - ${col.name}`));
    console.log('');

    // Show products count
    const productsCount = await mongoose.connection.db.collection('products').countDocuments();
    console.log(`📦 Products: ${productsCount} items`);
    
    // Show users count
    const usersCount = await mongoose.connection.db.collection('users').countDocuments();
    console.log(`👥 Users: ${usersCount} accounts`);
    
    // Show orders count
    const ordersCount = await mongoose.connection.db.collection('orders').countDocuments();
    console.log(`🛍️ Orders: ${ordersCount} orders`);
    
    // Show sample products
    console.log('\n🍵 Sample Products:');
    const sampleProducts = await mongoose.connection.db.collection('products').find({}).limit(3).toArray();
    sampleProducts.forEach(product => {
      console.log(`  • ${product.name} - ₹${product.price} (${product.category})`);
    });
    
    // Show sample users
    console.log('\n👤 User Accounts:');
    const sampleUsers = await mongoose.connection.db.collection('users').find({}, {projection: {password: 0}}).toArray();
    sampleUsers.forEach(user => {
      console.log(`  • ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n📊 Database viewing completed!');
  }
}

// Run the viewer
viewDatabase();