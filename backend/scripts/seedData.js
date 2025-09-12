const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teatime', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Product Schema (same as in server.js)
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  image_url: { type: String, required: true },
  base_price_per_kg: { type: Number, required: true, min: 0 },
  old_price_per_kg: { type: Number, min: 0 },
  unit: { type: String, enum: ['kg', 'piece'], required: true },
  category: { type: String, trim: true },
  inStock: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// Sample data
const sampleProducts = [
  {
    name: 'Premium Black Tea',
    description: 'Premium quality black tea from Sreemangal gardens',
    image_url: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop',
    base_price_per_kg: 800,
    old_price_per_kg: 900,
    unit: 'kg',
    category: 'Black Tea',
    inStock: true
  },
  {
    name: 'Green Tea Special',
    description: 'Fresh green tea with natural antioxidants',
    image_url: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop',
    base_price_per_kg: 1200,
    old_price_per_kg: 1350,
    unit: 'kg',
    category: 'Green Tea',
    inStock: true
  },
  {
    name: 'Organic Honey',
    description: 'Pure organic honey from Sundarban forests',
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    base_price_per_kg: 1500,
    old_price_per_kg: 1700,
    unit: 'kg',
    category: 'Honey',
    inStock: true
  },
  {
    name: 'Tea Cups Set',
    description: 'Traditional ceramic tea cups (sold per piece)',
    image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop',
    base_price_per_kg: 250,
    old_price_per_kg: 300,
    unit: 'piece',
    category: 'Accessories',
    inStock: true
  },
  {
    name: 'White Tea Premium',
    description: 'Rare white tea with delicate flavor profile',
    image_url: 'https://images.unsplash.com/photo-1558642891-54be180ea339?w=400&h=300&fit=crop',
    base_price_per_kg: 2000,
    old_price_per_kg: 2200,
    unit: 'kg',
    category: 'White Tea',
    inStock: true
  },
  {
    name: 'Oolong Tea Special',
    description: 'Semi-fermented oolong tea with complex taste',
    image_url: 'https://images.unsplash.com/photo-1471943311424-646960669fbc?w=400&h=300&fit=crop',
    base_price_per_kg: 1800,
    old_price_per_kg: 2000,
    unit: 'kg',
    category: 'Oolong Tea',
    inStock: true
  },
  {
    name: 'Tea Strainer',
    description: 'Stainless steel tea strainer (sold per piece)',
    image_url: 'https://images.unsplash.com/photo-1589985901429-897dea6b2b1e?w=400&h=300&fit=crop',
    base_price_per_kg: 150,
    old_price_per_kg: 180,
    unit: 'piece',
    category: 'Accessories',
    inStock: true
  },
  {
    name: 'Herbal Tea Mix',
    description: 'Blend of medicinal herbs and tea leaves',
    image_url: 'https://images.unsplash.com/photo-1628773822503-930a7eaecf80?w=400&h=300&fit=crop',
    base_price_per_kg: 1000,
    old_price_per_kg: 1150,
    unit: 'kg',
    category: 'Herbal Tea',
    inStock: true
  }
];

async function seedData() {
  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${products.length} products`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedData();