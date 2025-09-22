import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productDetails: {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true }
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
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
  _id: false
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  orderType: {
    type: String,
    enum: ['dine-in', 'takeaway', 'delivery'],
    required: true,
    default: 'dine-in'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partial-refund'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'mobile-banking', 'online'],
    required: true
  },
  paymentDetails: {
    transactionId: { type: String },
    gateway: { type: String },
    paidAt: { type: Date },
    refundedAt: { type: Date },
    refundAmount: { type: Number, default: 0 }
  },
  pricing: {
    subtotal: { type: Number, required: true, min: 0 },
    discount: {
      code: { type: String },
      amount: { type: Number, default: 0, min: 0 }
    },
    tax: {
      rate: { type: Number, default: 0, min: 0 },
      amount: { type: Number, default: 0, min: 0 }
    },
    deliveryFee: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 }
  },
  customerInfo: {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      landmark: { type: String },
      deliveryInstructions: { type: String }
    }
  },
  tableNumber: {
    type: Number,
    min: 1,
    max: 100
  },
  estimatedPrepTime: {
    type: Number, // in minutes
    default: 15,
    min: 1
  },
  actualPrepTime: {
    type: Number // in minutes
  },
  specialInstructions: {
    type: String,
    trim: true,
    maxlength: [500, 'Special instructions cannot exceed 500 characters']
  },
  timestamps: {
    orderedAt: { type: Date, default: Date.now },
    confirmedAt: { type: Date },
    preparingAt: { type: Date },
    readyAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date }
  },
  rating: {
    score: { type: Number, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 500 },
    ratedAt: { type: Date }
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  refundReason: {
    type: String,
    trim: true
  },
  notes: [{
    content: { type: String, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    addedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderType: 1 });
orderSchema.index({ 'timestamps.orderedAt': -1 });
orderSchema.index({ createdAt: -1 });

// Virtual for total items
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for order duration
orderSchema.virtual('duration').get(function() {
  if (this.timestamps.completedAt && this.timestamps.orderedAt) {
    return Math.round((this.timestamps.completedAt - this.timestamps.orderedAt) / (1000 * 60)); // in minutes
  }
  return null;
});

// Virtual for time since order
orderSchema.virtual('timeSinceOrder').get(function() {
  return Math.round((new Date() - this.timestamps.orderedAt) / (1000 * 60)); // in minutes
});

// Method to generate order number
orderSchema.statics.generateOrderNumber = async function() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  const lastOrder = await this.findOne({
    orderNumber: new RegExp(`^${dateStr}`)
  }).sort({ orderNumber: -1 });
  
  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
    sequence = lastSequence + 1;
  }
  
  return `${dateStr}${sequence.toString().padStart(4, '0')}`;
};

// Method to update status
orderSchema.methods.updateStatus = function(newStatus, userId = null) {
  const validTransitions = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['preparing', 'cancelled'],
    'preparing': ['ready', 'cancelled'],
    'ready': ['completed', 'cancelled'],
    'completed': [],
    'cancelled': []
  };

  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
  }

  this.status = newStatus;
  this.timestamps[`${newStatus}At`] = new Date();

  if (newStatus === 'completed' && this.timestamps.preparingAt) {
    this.actualPrepTime = Math.round((new Date() - this.timestamps.preparingAt) / (1000 * 60));
  }

  if (userId) {
    this.assignedTo = userId;
  }

  return this.save();
};

// Method to add note
orderSchema.methods.addNote = function(content, userId) {
  this.notes.push({
    content,
    addedBy: userId,
    addedAt: new Date()
  });
  return this.save();
};

// Method to update payment status
orderSchema.methods.updatePaymentStatus = function(status, details = {}) {
  this.paymentStatus = status;
  
  if (status === 'paid') {
    this.paymentDetails.paidAt = new Date();
  } else if (status === 'refunded' || status === 'partial-refund') {
    this.paymentDetails.refundedAt = new Date();
  }

  Object.assign(this.paymentDetails, details);
  return this.save();
};

// Method to cancel order
orderSchema.methods.cancelOrder = function(reason, userId = null) {
  if (!['pending', 'confirmed', 'preparing'].includes(this.status)) {
    throw new Error('Order cannot be cancelled at this stage');
  }

  this.status = 'cancelled';
  this.timestamps.cancelledAt = new Date();
  this.cancellationReason = reason;

  if (userId) {
    this.assignedTo = userId;
  }

  return this.save();
};

// Method to add rating
orderSchema.methods.addRating = function(score, comment = '') {
  if (this.status !== 'completed') {
    throw new Error('Can only rate completed orders');
  }

  this.rating = {
    score,
    comment,
    ratedAt: new Date()
  };

  return this.save();
};

// Pre-save middleware to update timestamps
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    this.timestamps.orderedAt = new Date();
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;