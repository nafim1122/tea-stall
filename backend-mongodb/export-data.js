// Simple export script for MongoDB data
import mongoose from 'mongoose';
import fs from 'fs';

async function exportData() {
  try {
    console.log('🔄 Connecting to local MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/tea-stall');
    console.log('✅ Connected successfully!');

    const db = mongoose.connection.db;
    const exportData = {};

    // Export products
    console.log('📦 Exporting products...');
    const products = await db.collection('products').find({}).toArray();
    exportData.products = products;
    console.log(`✅ Exported ${products.length} products`);

    // Export users
    console.log('👥 Exporting users...');
    const users = await db.collection('users').find({}).toArray();
    exportData.users = users;
    console.log(`✅ Exported ${users.length} users`);

    // Export orders
    console.log('🛍️ Exporting orders...');
    const orders = await db.collection('orders').find({}).toArray();
    exportData.orders = orders;
    console.log(`✅ Exported ${orders.length} orders`);

    // Export carts
    console.log('🛒 Exporting carts...');
    const carts = await db.collection('carts').find({}).toArray();
    exportData.carts = carts;
    console.log(`✅ Exported ${carts.length} carts`);

    // Save to file
    const filename = 'tea-stall-backup.json';
    fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
    console.log(`📁 Data saved to: ${filename}`);
    
    console.log('\n📊 Export Summary:');
    console.log(`  • Products: ${products.length}`);
    console.log(`  • Users: ${users.length}`);
    console.log(`  • Orders: ${orders.length}`);
    console.log(`  • Carts: ${carts.length}`);
    console.log('\n🎉 Export completed successfully!');

  } catch (error) {
    console.error('❌ Export failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

exportData();