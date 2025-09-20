const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teatime', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Product Schema
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

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, required: true, trim: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

// Cart Schema
const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 0.1 },
  unit: { type: String, enum: ['kg', 'piece'], required: true },
  unitPriceAtTime: { type: Number, required: true, min: 0 },
  totalPriceAtTime: { type: Number, required: true, min: 0 },
  sessionId: { type: String, required: true }, // For guest users
  createdAt: { type: Date, default: Date.now }
});

const CartItem = mongoose.model('CartItem', cartItemSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0.1 },
    unit: { type: String, enum: ['kg', 'piece'], required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 }
  }],
  total: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, required: true },
  transactionId: { type: String },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'delivered'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid token or user not found.' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
};

// Create default admin user if it doesn't exist
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const defaultAdmin = new User({
        name: 'Tea Stall Admin',
        email: 'admin@teatime.com',
        password: 'admin123', // This will be hashed by the pre-save hook
        phone: '+8801742236623',
        role: 'admin'
      });
      await defaultAdmin.save();
      console.log('Default admin user created: admin@teatime.com / admin123');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// Initialize default admin
createDefaultAdmin();

// Validation middleware
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[0-9\-\(\)\s]{10,20}$/;
  return phoneRegex.test(phone);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateRegisterData = (req, res, next) => {
  const { name, email, password, phone } = req.body;
  
  if (!name || !email || !password || !phone) {
    return res.status(400).json({ 
      error: 'Missing required fields: name, email, password, phone' 
    });
  }
  
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  if (!validatePassword(password)) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  
  if (!validatePhone(phone)) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }
  
  next();
};

const validateLoginData = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  next();
};
const validateProduct = (req, res, next) => {
  const { name, base_price_per_kg, unit, image_url } = req.body;
  
  if (!name || !base_price_per_kg || !unit || !image_url) {
    return res.status(400).json({ 
      error: 'Missing required fields: name, base_price_per_kg, unit, image_url' 
    });
  }
  
  if (base_price_per_kg <= 0) {
    return res.status(400).json({ error: 'Price must be greater than 0' });
  }
  
  if (!['kg', 'piece'].includes(unit)) {
    return res.status(400).json({ error: 'Unit must be either "kg" or "piece"' });
  }
  
  next();
};

const validateCartItem = (req, res, next) => {
  const { productId, quantity } = req.body;
  
  if (!productId || !quantity) {
    return res.status(400).json({ error: 'Missing required fields: productId, quantity' });
  }
  
  if (quantity <= 0) {
    return res.status(400).json({ error: 'Quantity must be greater than 0' });
  }
  
  next();
};

// Routes

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({ inStock: true }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Admin: Create product
app.post('/api/admin/products', authenticateToken, requireAdmin, validateProduct, async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      updatedAt: new Date()
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Admin: Update product
app.put('/api/admin/products/:id', authenticateToken, requireAdmin, validateProduct, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Admin: Delete product
app.delete('/api/admin/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Add item to cart
app.post('/api/cart/add', validateCartItem, async (req, res) => {
  try {
    const { productId, quantity, sessionId } = req.body;
    
    // Get product to calculate server-side price
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (!product.inStock) {
      return res.status(400).json({ error: 'Product is out of stock' });
    }
    
    // Validate quantity based on unit
    if (product.unit === 'kg' && quantity < 0.1) {
      return res.status(400).json({ error: 'Minimum quantity for kg products is 0.1' });
    }
    
    if (product.unit === 'piece' && (quantity < 1 || quantity % 1 !== 0)) {
      return res.status(400).json({ error: 'Quantity for piece products must be whole numbers' });
    }
    
    // Calculate server-side prices (never trust client)
    const unitPriceAtTime = product.base_price_per_kg;
    const totalPriceAtTime = unitPriceAtTime * quantity;
    
    // Check if item already exists in cart
    const existingItem = await CartItem.findOne({ productId, sessionId });
    
    if (existingItem) {
      // Update existing item
      existingItem.quantity += quantity;
      existingItem.totalPriceAtTime = unitPriceAtTime * existingItem.quantity;
      await existingItem.save();
      res.json(existingItem);
    } else {
      // Create new cart item
      const cartItem = new CartItem({
        productId,
        quantity,
        unit: product.unit,
        unitPriceAtTime,
        totalPriceAtTime,
        sessionId: sessionId || 'guest'
      });
      
      await cartItem.save();
      res.status(201).json(cartItem);
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Get cart items
app.get('/api/cart/:sessionId', async (req, res) => {
  try {
    const cartItems = await CartItem.find({ sessionId: req.params.sessionId })
      .populate('productId')
      .sort({ createdAt: -1 });
    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart items' });
  }
});

// Update cart item quantity
app.put('/api/cart/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }
    
    const cartItem = await CartItem.findById(req.params.id).populate('productId');
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    
    // Recalculate price based on current product price
    const product = await Product.findById(cartItem.productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    cartItem.quantity = quantity;
    cartItem.unitPriceAtTime = product.base_price_per_kg;
    cartItem.totalPriceAtTime = product.base_price_per_kg * quantity;
    
    await cartItem.save();
    res.json(cartItem);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// Remove cart item
app.delete('/api/cart/:id', async (req, res) => {
  try {
    const cartItem = await CartItem.findByIdAndDelete(req.params.id);
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    const { items, paymentMethod, address, phone, transactionId } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }
    
    if (!paymentMethod || !address || !phone) {
      return res.status(400).json({ error: 'Missing required order information' });
    }
    
    // Validate and recalculate prices for all items
    let total = 0;
    const validatedItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }
      
      if (!product.inStock) {
        return res.status(400).json({ error: `Product ${product.name} is out of stock` });
      }
      
      const unitPrice = product.base_price_per_kg;
      const totalPrice = unitPrice * item.quantity;
      total += totalPrice;
      
      validatedItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        unit: product.unit,
        unitPrice,
        totalPrice
      });
    }
    
    const order = new Order({
      items: validatedItems,
      total,
      paymentMethod,
      transactionId,
      address,
      phone
    });
    
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get orders (admin)
app.get('/api/admin/orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Authentication Routes

// Register user
app.post('/api/auth/register', validateRegisterData, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Check if phone already exists
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ error: 'User with this phone number already exists' });
    }
    
    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone.trim()
    });
    
    await user.save();
    
    // Generate token
    const token = generateToken(user._id);
    
    res.status(201).json({
      message: 'Registration successful',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Login user
app.post('/api/auth/login', validateLoginData, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Get user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
app.put('/api/auth/profile/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, phone } = req.body;
    
    // Check if user is updating their own profile or is admin
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. You can only update your own profile.' });
    }
    
    // Validation
    if (name && !name.trim()) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }
    
    if (phone && !validatePhone(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }
    
    // Check if phone already exists for another user
    if (phone) {
      const existingPhone = await User.findOne({ 
        phone: phone.trim(), 
        _id: { $ne: userId } 
      });
      if (existingPhone) {
        return res.status(400).json({ error: 'This phone number is already in use' });
      }
    }
    
    const updateData = { updatedAt: new Date() };
    if (name) updateData.name = name.trim();
    if (phone) updateData.phone = phone.trim();
    
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user.toJSON());
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Verify token
app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Token verification failed' });
  }
});

// Logout (client-side mainly, but can be used for server-side cleanup)
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    // In a more advanced setup, you might want to blacklist the token
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;