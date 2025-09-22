import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [2, 'Product name must be at least 2 characters long'],
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
    max: [10000, 'Price cannot exceed 10000']
  },
  originalPrice: {
    type: Number,
    default: null,
    min: [0, 'Original price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: {
      values: ['tea', 'coffee', 'snacks', 'pastries', 'beverages', 'breakfast', 'lunch', 'dinner'],
      message: 'Category must be one of: tea, coffee, snacks, pastries, beverages, breakfast, lunch, dinner'
    }
  },
  subcategory: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: [true, 'Product image is required'],
    default: '/placeholder.svg'
  },
  images: [{
    type: String
  }],
  inStock: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Stock quantity cannot be negative']
  },
  unit: {
    type: String,
    enum: ['piece', 'cup', 'plate', 'serving', 'kg', 'gram', 'liter', 'ml'],
    default: 'piece'
  },
  preparationTime: {
    type: Number, // in minutes
    default: 5,
    min: [1, 'Preparation time must be at least 1 minute'],
    max: [120, 'Preparation time cannot exceed 120 minutes']
  },
  ingredients: [{
    name: { type: String, required: true },
    quantity: { type: String },
    allergen: { type: Boolean, default: false }
  }],
  nutritionalInfo: {
    calories: { type: Number, min: 0 },
    protein: { type: Number, min: 0 },
    carbs: { type: Number, min: 0 },
    fat: { type: Number, min: 0 },
    fiber: { type: Number, min: 0 },
    sugar: { type: Number, min: 0 }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isVegetarian: {
    type: Boolean,
    default: false
  },
  isVegan: {
    type: Boolean,
    default: false
  },
  isGlutenFree: {
    type: Boolean,
    default: false
  },
  spiceLevel: {
    type: String,
    enum: ['none', 'mild', 'medium', 'hot', 'very-hot'],
    default: 'none'
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Review comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  salePrice: {
    type: Number,
    min: [0, 'Sale price cannot be negative']
  },
  saleStartDate: {
    type: Date
  },
  saleEndDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ inStock: 1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for current effective price
productSchema.virtual('effectivePrice').get(function() {
  const now = new Date();
  if (this.salePrice && 
      this.saleStartDate && 
      this.saleEndDate && 
      now >= this.saleStartDate && 
      now <= this.saleEndDate) {
    return this.salePrice;
  }
  return this.price;
});

// Virtual for availability status
productSchema.virtual('availability').get(function() {
  if (!this.isActive) return 'inactive';
  if (!this.inStock || this.stockQuantity === 0) return 'out-of-stock';
  if (this.stockQuantity <= 5) return 'low-stock';
  return 'in-stock';
});

// Method to update rating
productSchema.methods.updateRating = function() {
  if (this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating.average = Number((totalRating / this.reviews.length).toFixed(1));
    this.rating.count = this.reviews.length;
  } else {
    this.rating.average = 0;
    this.rating.count = 0;
  }
};

// Method to add review
productSchema.methods.addReview = function(userId, rating, comment) {
  // Remove existing review from same user
  this.reviews = this.reviews.filter(review => !review.user.equals(userId));
  
  // Add new review
  this.reviews.push({
    user: userId,
    rating,
    comment,
    createdAt: new Date()
  });
  
  this.updateRating();
  return this.save();
};

// Pre-save middleware to update rating
productSchema.pre('save', function(next) {
  if (this.isModified('reviews')) {
    this.updateRating();
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;