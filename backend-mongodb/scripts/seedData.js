import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    console.log('Starting data seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      name: 'Tea Stall Admin',
      email: 'admin@teastall.com',
      password: 'admin123',
      role: 'admin',
      phone: '+8801712345678',
      emailVerified: true,
      address: {
        street: '123 Main Street',
        city: 'Dhaka',
        state: 'Dhaka Division',
        zipCode: '1000',
        country: 'Bangladesh'
      }
    });

    // Create test customer
    const customerUser = await User.create({
      name: 'John Doe',
      email: 'customer@example.com',
      password: 'customer123',
      role: 'customer',
      phone: '+8801712345679',
      emailVerified: true,
      address: {
        street: '456 Oak Avenue',
        city: 'Dhaka',
        state: 'Dhaka Division',
        zipCode: '1205',
        country: 'Bangladesh'
      }
    });

    console.log('Created users');

    // Create products
    const products = [
      // Tea Products
      {
        name: 'Classic Black Tea',
        description: 'Rich and robust black tea with a perfect balance of strength and flavor. Sourced from the finest tea gardens.',
        price: 25,
        originalPrice: 30,
        category: 'tea',
        subcategory: 'black-tea',
        image: '/placeholder.svg',
        inStock: true,
        stockQuantity: 100,
        unit: 'cup',
        preparationTime: 5,
        ingredients: [
          { name: 'Black tea leaves', quantity: '2g', allergen: false },
          { name: 'Water', quantity: '200ml', allergen: false }
        ],
        nutritionalInfo: {
          calories: 2,
          protein: 0.1,
          carbs: 0.5,
          fat: 0,
          fiber: 0,
          sugar: 0
        },
        tags: ['black tea', 'classic', 'energizing'],
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        spiceLevel: 'none',
        isActive: true,
        isFeatured: true,
        createdBy: adminUser._id
      },
      {
        name: 'Masala Chai',
        description: 'Traditional spiced tea with cardamom, cinnamon, ginger, and cloves. A perfect blend of aromatic spices.',
        price: 35,
        category: 'tea',
        subcategory: 'spiced-tea',
        image: '/placeholder.svg',
        inStock: true,
        stockQuantity: 80,
        unit: 'cup',
        preparationTime: 8,
        ingredients: [
          { name: 'Black tea leaves', quantity: '2g', allergen: false },
          { name: 'Milk', quantity: '100ml', allergen: true },
          { name: 'Cardamom', quantity: '1 pod', allergen: false },
          { name: 'Cinnamon', quantity: '1 stick', allergen: false },
          { name: 'Ginger', quantity: '2g', allergen: false },
          { name: 'Sugar', quantity: '10g', allergen: false }
        ],
        nutritionalInfo: {
          calories: 85,
          protein: 3.2,
          carbs: 12,
          fat: 3.1,
          fiber: 0.2,
          sugar: 12
        },
        tags: ['masala chai', 'spiced', 'milk tea', 'traditional'],
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: true,
        spiceLevel: 'mild',
        isActive: true,
        isFeatured: true,
        createdBy: adminUser._id
      },
      {
        name: 'Green Tea',
        description: 'Light and refreshing green tea with antioxidants. Perfect for health-conscious tea lovers.',
        price: 30,
        category: 'tea',
        subcategory: 'green-tea',
        image: '/placeholder.svg',
        inStock: true,
        stockQuantity: 90,
        unit: 'cup',
        preparationTime: 4,
        ingredients: [
          { name: 'Green tea leaves', quantity: '2g', allergen: false },
          { name: 'Water', quantity: '200ml', allergen: false }
        ],
        nutritionalInfo: {
          calories: 2,
          protein: 0.2,
          carbs: 0.3,
          fat: 0,
          fiber: 0,
          sugar: 0
        },
        tags: ['green tea', 'healthy', 'antioxidants'],
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        spiceLevel: 'none',
        isActive: true,
        isFeatured: false,
        createdBy: adminUser._id
      },

      // Coffee Products
      {
        name: 'Espresso',
        description: 'Strong and concentrated coffee shot. Perfect base for all coffee drinks.',
        price: 45,
        category: 'coffee',
        subcategory: 'espresso',
        image: '/placeholder.svg',
        inStock: true,
        stockQuantity: 75,
        unit: 'cup',
        preparationTime: 3,
        ingredients: [
          { name: 'Coffee beans', quantity: '18g', allergen: false },
          { name: 'Water', quantity: '30ml', allergen: false }
        ],
        nutritionalInfo: {
          calories: 5,
          protein: 0.3,
          carbs: 0.8,
          fat: 0.2,
          fiber: 0,
          sugar: 0
        },
        tags: ['espresso', 'strong', 'concentrated'],
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        spiceLevel: 'none',
        isActive: true,
        isFeatured: true,
        createdBy: adminUser._id
      },
      {
        name: 'Cappuccino',
        description: 'Perfect balance of espresso, steamed milk, and milk foam. A classic Italian coffee experience.',
        price: 65,
        category: 'coffee',
        subcategory: 'milk-coffee',
        image: '/placeholder.svg',
        inStock: true,
        stockQuantity: 60,
        unit: 'cup',
        preparationTime: 6,
        ingredients: [
          { name: 'Espresso', quantity: '30ml', allergen: false },
          { name: 'Steamed milk', quantity: '150ml', allergen: true },
          { name: 'Milk foam', quantity: '50ml', allergen: true }
        ],
        nutritionalInfo: {
          calories: 120,
          protein: 6.2,
          carbs: 9.5,
          fat: 6.5,
          fiber: 0,
          sugar: 9.5
        },
        tags: ['cappuccino', 'milk coffee', 'foam'],
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: true,
        spiceLevel: 'none',
        isActive: true,
        isFeatured: true,
        createdBy: adminUser._id
      },
      {
        name: 'Cold Brew Coffee',
        description: 'Smooth and refreshing cold coffee brewed slowly for 12 hours. Less acidic and naturally sweet.',
        price: 55,
        category: 'coffee',
        subcategory: 'cold-coffee',
        image: '/placeholder.svg',
        inStock: true,
        stockQuantity: 40,
        unit: 'cup',
        preparationTime: 2,
        ingredients: [
          { name: 'Cold brew concentrate', quantity: '100ml', allergen: false },
          { name: 'Ice', quantity: '100g', allergen: false },
          { name: 'Water', quantity: '100ml', allergen: false }
        ],
        nutritionalInfo: {
          calories: 5,
          protein: 0.3,
          carbs: 1,
          fat: 0,
          fiber: 0,
          sugar: 0
        },
        tags: ['cold brew', 'iced coffee', 'smooth'],
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        spiceLevel: 'none',
        isActive: true,
        isFeatured: false,
        createdBy: adminUser._id
      },

      // Snacks
      {
        name: 'Samosa',
        description: 'Crispy triangular pastry filled with spiced potatoes and peas. A popular tea-time snack.',
        price: 15,
        category: 'snacks',
        subcategory: 'fried',
        image: '/placeholder.svg',
        inStock: true,
        stockQuantity: 120,
        unit: 'piece',
        preparationTime: 5,
        ingredients: [
          { name: 'Wheat flour', quantity: '30g', allergen: true },
          { name: 'Potatoes', quantity: '40g', allergen: false },
          { name: 'Green peas', quantity: '10g', allergen: false },
          { name: 'Spices', quantity: '2g', allergen: false },
          { name: 'Oil', quantity: '15ml', allergen: false }
        ],
        nutritionalInfo: {
          calories: 180,
          protein: 4.2,
          carbs: 22,
          fat: 8.5,
          fiber: 2.8,
          sugar: 2
        },
        tags: ['samosa', 'fried', 'spicy', 'vegetarian'],
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: false,
        spiceLevel: 'medium',
        isActive: true,
        isFeatured: true,
        createdBy: adminUser._id
      },
      {
        name: 'Biscuit',
        description: 'Crunchy tea biscuits perfect for dunking. Made with premium ingredients.',
        price: 8,
        category: 'snacks',
        subcategory: 'baked',
        image: '/placeholder.svg',
        inStock: true,
        stockQuantity: 200,
        unit: 'piece',
        preparationTime: 1,
        ingredients: [
          { name: 'Wheat flour', quantity: '15g', allergen: true },
          { name: 'Sugar', quantity: '3g', allergen: false },
          { name: 'Butter', quantity: '2g', allergen: true },
          { name: 'Milk', quantity: '1ml', allergen: true }
        ],
        nutritionalInfo: {
          calories: 85,
          protein: 1.8,
          carbs: 14,
          fat: 2.8,
          fiber: 0.5,
          sugar: 3
        },
        tags: ['biscuit', 'tea time', 'crunchy'],
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: false,
        spiceLevel: 'none',
        isActive: true,
        isFeatured: false,
        createdBy: adminUser._id
      },

      // Pastries
      {
        name: 'Chocolate Croissant',
        description: 'Buttery, flaky pastry filled with rich dark chocolate. Perfect with morning coffee.',
        price: 85,
        category: 'pastries',
        subcategory: 'croissant',
        image: '/placeholder.svg',
        inStock: true,
        stockQuantity: 25,
        unit: 'piece',
        preparationTime: 3,
        ingredients: [
          { name: 'Puff pastry', quantity: '80g', allergen: true },
          { name: 'Dark chocolate', quantity: '15g', allergen: false },
          { name: 'Butter', quantity: '10g', allergen: true },
          { name: 'Egg wash', quantity: '5ml', allergen: true }
        ],
        nutritionalInfo: {
          calories: 320,
          protein: 6.5,
          carbs: 28,
          fat: 20,
          fiber: 2,
          sugar: 8
        },
        tags: ['croissant', 'chocolate', 'buttery', 'flaky'],
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: false,
        spiceLevel: 'none',
        isActive: true,
        isFeatured: true,
        createdBy: adminUser._id
      },
      {
        name: 'Blueberry Muffin',
        description: 'Soft and moist muffin loaded with fresh blueberries. A delightful breakfast treat.',
        price: 75,
        category: 'pastries',
        subcategory: 'muffin',
        image: '/placeholder.svg',
        inStock: true,
        stockQuantity: 30,
        unit: 'piece',
        preparationTime: 2,
        ingredients: [
          { name: 'Flour', quantity: '60g', allergen: true },
          { name: 'Blueberries', quantity: '25g', allergen: false },
          { name: 'Sugar', quantity: '20g', allergen: false },
          { name: 'Butter', quantity: '15g', allergen: true },
          { name: 'Egg', quantity: '1 piece', allergen: true },
          { name: 'Milk', quantity: '30ml', allergen: true }
        ],
        nutritionalInfo: {
          calories: 285,
          protein: 5.8,
          carbs: 42,
          fat: 11,
          fiber: 2.5,
          sugar: 22
        },
        tags: ['muffin', 'blueberry', 'soft', 'breakfast'],
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: false,
        spiceLevel: 'none',
        isActive: true,
        isFeatured: false,
        createdBy: adminUser._id
      },

      // Beverages
      {
        name: 'Fresh Lemon Juice',
        description: 'Refreshing fresh lemon juice with a hint of mint. Perfect thirst quencher.',
        price: 40,
        category: 'beverages',
        subcategory: 'juice',
        image: '/placeholder.svg',
        inStock: true,
        stockQuantity: 50,
        unit: 'cup',
        preparationTime: 3,
        ingredients: [
          { name: 'Fresh lemon', quantity: '2 pieces', allergen: false },
          { name: 'Water', quantity: '200ml', allergen: false },
          { name: 'Sugar', quantity: '15g', allergen: false },
          { name: 'Mint leaves', quantity: '5 pieces', allergen: false },
          { name: 'Ice', quantity: '50g', allergen: false }
        ],
        nutritionalInfo: {
          calories: 65,
          protein: 0.2,
          carbs: 17,
          fat: 0,
          fiber: 0.5,
          sugar: 15
        },
        tags: ['lemon juice', 'fresh', 'refreshing', 'citrus'],
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        spiceLevel: 'none',
        isActive: true,
        isFeatured: false,
        createdBy: adminUser._id
      },
      {
        name: 'Mango Lassi',
        description: 'Creamy yogurt-based drink blended with sweet mango pulp. A traditional favorite.',
        price: 60,
        category: 'beverages',
        subcategory: 'dairy',
        image: '/placeholder.svg',
        inStock: true,
        stockQuantity: 35,
        unit: 'cup',
        preparationTime: 4,
        ingredients: [
          { name: 'Mango pulp', quantity: '100g', allergen: false },
          { name: 'Yogurt', quantity: '150ml', allergen: true },
          { name: 'Sugar', quantity: '10g', allergen: false },
          { name: 'Cardamom', quantity: '1 pod', allergen: false },
          { name: 'Ice', quantity: '30g', allergen: false }
        ],
        nutritionalInfo: {
          calories: 185,
          protein: 6.8,
          carbs: 32,
          fat: 4.2,
          fiber: 1.5,
          sugar: 30
        },
        tags: ['mango lassi', 'yogurt', 'creamy', 'traditional'],
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: true,
        spiceLevel: 'none',
        isActive: true,
        isFeatured: true,
        createdBy: adminUser._id
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`Created ${createdProducts.length} products`);

    // Add some reviews to products
    const reviews = [
      { productIndex: 0, userId: customerUser._id, rating: 5, comment: 'Perfect black tea! Strong and flavorful.' },
      { productIndex: 1, userId: customerUser._id, rating: 4, comment: 'Great masala chai, just like homemade.' },
      { productIndex: 3, userId: customerUser._id, rating: 5, comment: 'Best espresso in town!' },
      { productIndex: 4, userId: customerUser._id, rating: 4, comment: 'Excellent cappuccino with perfect foam.' },
      { productIndex: 6, userId: customerUser._id, rating: 5, comment: 'Crispy and delicious samosas!' },
      { productIndex: 8, userId: customerUser._id, rating: 4, comment: 'Buttery croissant with rich chocolate.' }
    ];

    for (const review of reviews) {
      const product = createdProducts[review.productIndex];
      await product.addReview(review.userId, review.rating, review.comment);
    }

    console.log('Added product reviews');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nCreated accounts:');
    console.log('Admin: admin@teastall.com / admin123');
    console.log('Customer: customer@example.com / customer123');
    console.log(`\nCreated ${createdProducts.length} products across categories:`);
    console.log('- Tea: 3 products');
    console.log('- Coffee: 3 products');
    console.log('- Snacks: 2 products');
    console.log('- Pastries: 2 products');
    console.log('- Beverages: 2 products');

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

const runSeeder = async () => {
  await connectDB();
  await seedData();
  process.exit(0);
};

runSeeder();