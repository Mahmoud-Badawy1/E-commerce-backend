// Script to fix the paymobOrderId unique index issue in carts collection
const mongoose = require('mongoose');
require('dotenv').config();

async function fixCartIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/test');
    console.log('Connected to MongoDB');

    // Get the carts collection
    const db = mongoose.connection.db;
    const cartsCollection = db.collection('carts');

    // List all indexes
    console.log('\n=== Current Indexes on carts collection ===');
    const indexes = await cartsCollection.indexes();
    indexes.forEach(index => {
      console.log(JSON.stringify(index, null, 2));
    });

    // Check if paymobOrderId_1 index exists
    const paymobIndex = indexes.find(idx => idx.name === 'paymobOrderId_1');
    
    if (paymobIndex) {
      console.log('\n⚠️  Found problematic index: paymobOrderId_1');
      console.log('This unique index is causing the duplicate key error.');
      console.log('\n🔧 Dropping the index...');
      
      // Drop the problematic index
      await cartsCollection.dropIndex('paymobOrderId_1');
      console.log('✅ Successfully dropped paymobOrderId_1 index');
      
      // Verify it's been removed
      const updatedIndexes = await cartsCollection.indexes();
      console.log('\n=== Updated Indexes ===');
      updatedIndexes.forEach(index => {
        console.log(JSON.stringify(index, null, 2));
      });
    } else {
      console.log('\n✅ paymobOrderId_1 index not found. The issue may have been resolved already.');
    }

    console.log('\n✨ Fix completed! You can now add products to cart.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the fix
fixCartIndex();
