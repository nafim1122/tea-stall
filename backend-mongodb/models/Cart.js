import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    max: [50, 'Quantity cannot exceed 50']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  customizations: [{
    option: { type: String, required: true },
    value: { type: String, required: true },
    additionalPrice: { type: Number, default: 0 }
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [200, 'Notes cannot exceed 200 characters']
  }
}, {
  _id: false,
  timestamps: true
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    code: { type: String, trim: true },
    amount: { type: Number, default: 0, min: 0 },
    percentage: { type: Number, default: 0, min: 0, max: 100 }
  },
  tax: {
    rate: { type: Number, default: 0, min: 0, max: 100 },
    amount: { type: Number, default: 0, min: 0 }
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: 0
  },
  finalTotal: {
    type: Number,
    default: 0,
    min: 0
  },
  sessionId: {
    type: String,
    trim: true
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    },
    expires: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
cartSchema.index({ user: 1 });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for subtotal before tax and fees
cartSchema.virtual('subtotal').get(function() {
  return this.totalPrice - this.discount.amount;
});

// Methods to calculate totals
cartSchema.methods.calculateTotals = function() {
  // Calculate total items and price
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  
  this.totalPrice = this.items.reduce((total, item) => {
    const customizationPrice = item.customizations.reduce((sum, custom) => sum + custom.additionalPrice, 0);
    return total + ((item.price + customizationPrice) * item.quantity);
  }, 0);

  // Calculate subtotal after discount
  const subtotal = Math.max(0, this.totalPrice - this.discount.amount);

  // Calculate tax
  this.tax.amount = (subtotal * this.tax.rate) / 100;

  // Calculate final total
  this.finalTotal = subtotal + this.tax.amount + this.deliveryFee;

  this.lastModified = new Date();
};

// Method to add item to cart
cartSchema.methods.addItem = function(productId, quantity, price, customizations = [], notes = '') {
  const existingItemIndex = this.items.findIndex(item => 
    item.product.toString() === productId.toString() &&
    JSON.stringify(item.customizations) === JSON.stringify(customizations)
  );

  if (existingItemIndex > -1) {
    // Update existing item
    this.items[existingItemIndex].quantity += quantity;
    this.items[existingItemIndex].notes = notes || this.items[existingItemIndex].notes;
  } else {
    // Add new item
    this.items.push({
      product: productId,
      quantity,
      price,
      customizations,
      notes
    });
  }

  this.calculateTotals();
  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function(productId, quantity, customizations = []) {
  const itemIndex = this.items.findIndex(item => 
    item.product.toString() === productId.toString() &&
    JSON.stringify(item.customizations) === JSON.stringify(customizations)
  );

  if (itemIndex > -1) {
    if (quantity <= 0) {
      this.items.splice(itemIndex, 1);
    } else {
      this.items[itemIndex].quantity = quantity;
    }
    this.calculateTotals();
    return this.save();
  } else {
    throw new Error('Item not found in cart');
  }
};

// Method to remove item from cart
cartSchema.methods.removeItem = function(productId, customizations = []) {
  const itemIndex = this.items.findIndex(item => 
    item.product.toString() === productId.toString() &&
    JSON.stringify(item.customizations) === JSON.stringify(customizations)
  );

  if (itemIndex > -1) {
    this.items.splice(itemIndex, 1);
    this.calculateTotals();
    return this.save();
  } else {
    throw new Error('Item not found in cart');
  }
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.totalItems = 0;
  this.totalPrice = 0;
  this.discount = { code: '', amount: 0, percentage: 0 };
  this.tax = { rate: 0, amount: 0 };
  this.deliveryFee = 0;
  this.finalTotal = 0;
  this.lastModified = new Date();
  return this.save();
};

// Method to apply discount
cartSchema.methods.applyDiscount = function(code, amount = 0, percentage = 0) {
  this.discount = { code, amount, percentage };
  
  if (percentage > 0) {
    this.discount.amount = (this.totalPrice * percentage) / 100;
  }
  
  this.calculateTotals();
  return this.save();
};

// Method to set tax rate
cartSchema.methods.setTaxRate = function(rate) {
  this.tax.rate = rate;
  this.calculateTotals();
  return this.save();
};

// Method to set delivery fee
cartSchema.methods.setDeliveryFee = function(fee) {
  this.deliveryFee = fee;
  this.calculateTotals();
  return this.save();
};

// Pre-save middleware
cartSchema.pre('save', function(next) {
  this.calculateTotals();
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;