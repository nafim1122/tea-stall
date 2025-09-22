import express from 'express';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { protect, authorize } from '../middleware/auth.js';
import { 
  validateOrder, 
  validateOrderStatus, 
  validateOrderRating,
  validateObjectId, 
  validatePagination 
} from '../middleware/validation.js';

const router = express.Router();

// @desc    Create new order from cart
// @route   POST /api/orders
// @access  Private
router.post('/', protect, validateOrder, async (req, res) => {
  try {
    const {
      orderType,
      paymentMethod,
      customerInfo,
      tableNumber,
      specialInstructions
    } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name price image category');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate stock availability
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product || !product.isActive || !product.inStock) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product.name} is not available`
        });
      }
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stockQuantity} items available for ${item.product.name}`
        });
      }
    }

    // Generate order number
    const orderNumber = await Order.generateOrderNumber();

    // Prepare order items with product details
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      productDetails: {
        name: item.product.name,
        price: item.product.price,
        image: item.product.image
      },
      quantity: item.quantity,
      price: item.price,
      customizations: item.customizations,
      notes: item.notes
    }));

    // Create order
    const order = await Order.create({
      orderNumber,
      user: req.user.id,
      items: orderItems,
      orderType,
      paymentMethod,
      pricing: {
        subtotal: cart.totalPrice,
        discount: {
          code: cart.discount.code,
          amount: cart.discount.amount
        },
        tax: {
          rate: cart.tax.rate,
          amount: cart.tax.amount
        },
        deliveryFee: cart.deliveryFee,
        total: cart.finalTotal
      },
      customerInfo: {
        name: customerInfo.name || req.user.name,
        email: customerInfo.email || req.user.email,
        phone: customerInfo.phone,
        address: customerInfo.address
      },
      tableNumber,
      specialInstructions
    });

    // Update product stock quantities
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stockQuantity: -item.quantity } }
      );
    }

    // Clear the cart
    await cart.clearCart();

    // Populate and return the order
    await order.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
router.get('/', protect, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = { user: req.user.id };

    // Status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Order type filter
    if (req.query.orderType) {
      query.orderType = req.query.orderType;
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      query['timestamps.orderedAt'] = {};
      if (req.query.startDate) {
        query['timestamps.orderedAt'].$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query['timestamps.orderedAt'].$lte = new Date(req.query.endDate);
      }
    }

    const orders = await Order.find(query)
      .sort({ 'timestamps.orderedAt': -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .populate('assignedTo', 'name');

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/all
// @access  Private (Admin only)
router.get('/all', protect, authorize('admin'), validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    // Status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Order type filter
    if (req.query.orderType) {
      query.orderType = req.query.orderType;
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      query['timestamps.orderedAt'] = {};
      if (req.query.startDate) {
        query['timestamps.orderedAt'].$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query['timestamps.orderedAt'].$lte = new Date(req.query.endDate);
      }
    }

    const orders = await Order.find(query)
      .sort({ 'timestamps.orderedAt': -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .populate('assignedTo', 'name');

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, validateObjectId(), async (req, res) => {
  try {
    let query = { _id: req.params.id };

    // Non-admin users can only view their own orders
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }

    const order = await Order.findOne(query)
      .populate('user', 'name email phone')
      .populate('assignedTo', 'name')
      .populate('notes.addedBy', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin only)
router.put('/:id/status', protect, authorize('admin'), validateObjectId(), validateOrderStatus, async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await order.updateStatus(status, req.user.id);
    await order.populate('user', 'name email');

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    if (error.message.startsWith('Cannot transition')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, validateObjectId(), async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation reason is required'
      });
    }

    let query = { _id: req.params.id };

    // Non-admin users can only cancel their own orders
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await order.cancelOrder(reason, req.user.id);

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stockQuantity: item.quantity } }
      );
    }

    await order.populate('user', 'name email');

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });
  } catch (error) {
    if (error.message === 'Order cannot be cancelled at this stage') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Add order rating
// @route   POST /api/orders/:id/rating
// @access  Private
router.post('/:id/rating', protect, validateObjectId(), validateOrderRating, async (req, res) => {
  try {
    const { score, comment } = req.body;

    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await order.addRating(score, comment);

    res.status(200).json({
      success: true,
      message: 'Rating added successfully',
      data: { order }
    });
  } catch (error) {
    if (error.message === 'Can only rate completed orders') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to add rating',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Add order note
// @route   POST /api/orders/:id/notes
// @access  Private (Admin only)
router.post('/:id/notes', protect, authorize('admin'), validateObjectId(), async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Note content is required'
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await order.addNote(content, req.user.id);
    await order.populate('notes.addedBy', 'name');

    res.status(200).json({
      success: true,
      message: 'Note added successfully',
      data: { order }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add note',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get order statistics (Admin only)
// @route   GET /api/orders/stats/overview
// @access  Private (Admin only)
router.get('/stats/overview', protect, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter['timestamps.orderedAt'] = {};
      if (startDate) dateFilter['timestamps.orderedAt'].$gte = new Date(startDate);
      if (endDate) dateFilter['timestamps.orderedAt'].$lte = new Date(endDate);
    }

    const stats = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.total' },
          averageOrderValue: { $avg: '$pricing.total' },
          completedOrders: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          cancelledOrders: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
        }
      }
    ]);

    const statusStats = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$pricing.total' }
        }
      }
    ]);

    const orderTypeStats = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$orderType',
          count: { $sum: 1 },
          totalValue: { $sum: '$pricing.total' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {},
        statusBreakdown: statusStats,
        orderTypeBreakdown: orderTypeStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;