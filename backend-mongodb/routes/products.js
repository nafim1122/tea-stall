import express from 'express';
import Product from '../models/Product.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { 
  validateProduct, 
  validateProductUpdate, 
  validateObjectId, 
  validatePagination,
  validateSearch
} from '../middleware/validation.js';

const router = express.Router();

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', validatePagination, validateSearch, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };
    
    // Search functionality
    if (req.query.q) {
      query.$text = { $search: req.query.q };
    }

    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Stock filter
    if (req.query.inStock === 'true') {
      query.inStock = true;
      query.stockQuantity = { $gt: 0 };
    }

    // Featured filter
    if (req.query.featured === 'true') {
      query.isFeatured = true;
    }

    // Vegetarian filter
    if (req.query.vegetarian === 'true') {
      query.isVegetarian = true;
    }

    // Build sort
    let sort = {};
    if (req.query.sort) {
      const sortField = req.query.sort;
      const sortOrder = req.query.order === 'desc' ? -1 : 1;
      sort[sortField] = sortOrder;
    } else {
      sort = { createdAt: -1 }; // Default sort by newest
    }

    // Execute query
    const products = await Product.find(query)
      .populate('createdBy', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        products,
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
      message: 'Failed to fetch products',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', validateObjectId(), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('reviews.user', 'name avatar');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not available'
      });
    }

    res.status(200).json({
      success: true,
      data: { product }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), validateProduct, async (req, res) => {
  try {
    const productData = {
      ...req.body,
      createdBy: req.user.id
    };

    const product = await Product.create(productData);
    
    await product.populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), validateObjectId(), validateProductUpdate, async (req, res) => {
  try {
    const updates = {
      ...req.body,
      updatedBy: req.user.id
    };

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('createdBy updatedBy', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), validateObjectId(), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Soft delete by setting isActive to false
    product.isActive = false;
    product.updatedBy = req.user.id;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, validateObjectId(), async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot review inactive product'
      });
    }

    await product.addReview(req.user.id, rating, comment);
    
    const updatedProduct = await Product.findById(req.params.id)
      .populate('reviews.user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: { product: updatedProduct }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add review',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get product categories
// @route   GET /api/products/categories/list
// @access  Public
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    
    res.status(200).json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get featured products
// @route   GET /api/products/featured/list
// @access  Public
router.get('/featured/list', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    
    const products = await Product.find({ 
      isActive: true, 
      isFeatured: true,
      inStock: true 
    })
      .populate('createdBy', 'name')
      .sort({ 'rating.average': -1, createdAt: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: { products }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get product statistics (Admin only)
// @route   GET /api/products/stats/overview
// @access  Private (Admin only)
router.get('/stats/overview', protect, authorize('admin'), async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: { $sum: { $cond: ['$isActive', 1, 0] } },
          inStockProducts: { $sum: { $cond: ['$inStock', 1, 0] } },
          featuredProducts: { $sum: { $cond: ['$isFeatured', 1, 0] } },
          averagePrice: { $avg: '$price' },
          totalStockValue: { $sum: { $multiply: ['$price', '$stockQuantity'] } }
        }
      }
    ]);

    const categoryStats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averagePrice: { $avg: '$price' },
          totalStockValue: { $sum: { $multiply: ['$price', '$stockQuantity'] } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {},
        categoryBreakdown: categoryStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;