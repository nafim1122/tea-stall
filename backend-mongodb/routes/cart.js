import express from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { validateCartItem, validateCartUpdate, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name price image category inStock stockQuantity');

    if (!cart) {
      cart = await Cart.create({ user: req.user.id });
    }

    res.status(200).json({
      success: true,
      data: { cart }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
router.post('/items', protect, validateCartItem, async (req, res) => {
  try {
    const { productId, quantity, customizations = [], notes = '' } = req.body;

    // Check if product exists and is available
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.isActive || !product.inStock) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }

    if (product.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stockQuantity} items available in stock`
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id });
    }

    // Add item to cart
    await cart.addItem(productId, quantity, product.effectivePrice, customizations, notes);

    // Populate and return updated cart
    await cart.populate('items.product', 'name price image category inStock stockQuantity');

    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      data: { cart }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:productId
// @access  Private
router.put('/items/:productId', protect, validateObjectId('productId'), validateCartUpdate, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, customizations = [] } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    if (quantity > 0) {
      // Check product availability
      const product = await Product.findById(productId);
      if (!product || !product.isActive || !product.inStock) {
        return res.status(400).json({
          success: false,
          message: 'Product is not available'
        });
      }

      if (product.stockQuantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stockQuantity} items available in stock`
        });
      }
    }

    // Update item quantity
    await cart.updateItemQuantity(productId, quantity, customizations);

    // Populate and return updated cart
    await cart.populate('items.product', 'name price image category inStock stockQuantity');

    res.status(200).json({
      success: true,
      message: quantity > 0 ? 'Cart item updated successfully' : 'Item removed from cart',
      data: { cart }
    });
  } catch (error) {
    if (error.message === 'Item not found in cart') {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:productId
// @access  Private
router.delete('/items/:productId', protect, validateObjectId('productId'), async (req, res) => {
  try {
    const { productId } = req.params;
    const { customizations = [] } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Remove item from cart
    await cart.removeItem(productId, customizations);

    // Populate and return updated cart
    await cart.populate('items.product', 'name price image category inStock stockQuantity');

    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
      data: { cart }
    });
  } catch (error) {
    if (error.message === 'Item not found in cart') {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    await cart.clearCart();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: { cart }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Apply discount to cart
// @route   POST /api/cart/discount
// @access  Private
router.post('/discount', protect, async (req, res) => {
  try {
    const { code, amount = 0, percentage = 0 } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Discount code is required'
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    if (cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot apply discount to empty cart'
      });
    }

    // Here you would typically validate the discount code against a discounts collection
    // For now, we'll accept any code and apply the provided amount/percentage
    await cart.applyDiscount(code, amount, percentage);

    // Populate and return updated cart
    await cart.populate('items.product', 'name price image category inStock stockQuantity');

    res.status(200).json({
      success: true,
      message: 'Discount applied successfully',
      data: { cart }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to apply discount',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Remove discount from cart
// @route   DELETE /api/cart/discount
// @access  Private
router.delete('/discount', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.discount = { code: '', amount: 0, percentage: 0 };
    cart.calculateTotals();
    await cart.save();

    // Populate and return updated cart
    await cart.populate('items.product', 'name price image category inStock stockQuantity');

    res.status(200).json({
      success: true,
      message: 'Discount removed successfully',
      data: { cart }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove discount',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Set tax rate
// @route   POST /api/cart/tax
// @access  Private
router.post('/tax', protect, async (req, res) => {
  try {
    const { rate } = req.body;

    if (typeof rate !== 'number' || rate < 0 || rate > 100) {
      return res.status(400).json({
        success: false,
        message: 'Tax rate must be a number between 0 and 100'
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    await cart.setTaxRate(rate);

    // Populate and return updated cart
    await cart.populate('items.product', 'name price image category inStock stockQuantity');

    res.status(200).json({
      success: true,
      message: 'Tax rate updated successfully',
      data: { cart }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update tax rate',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Set delivery fee
// @route   POST /api/cart/delivery
// @access  Private
router.post('/delivery', protect, async (req, res) => {
  try {
    const { fee } = req.body;

    if (typeof fee !== 'number' || fee < 0) {
      return res.status(400).json({
        success: false,
        message: 'Delivery fee must be a non-negative number'
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    await cart.setDeliveryFee(fee);

    // Populate and return updated cart
    await cart.populate('items.product', 'name price image category inStock stockQuantity');

    res.status(200).json({
      success: true,
      message: 'Delivery fee updated successfully',
      data: { cart }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update delivery fee',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get cart summary
// @route   GET /api/cart/summary
// @access  Private
router.get('/summary', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          summary: {
            totalItems: 0,
            subtotal: 0,
            discount: 0,
            tax: 0,
            deliveryFee: 0,
            total: 0
          }
        }
      });
    }

    const summary = {
      totalItems: cart.totalItems,
      subtotal: cart.totalPrice,
      discount: cart.discount.amount,
      tax: cart.tax.amount,
      deliveryFee: cart.deliveryFee,
      total: cart.finalTotal
    };

    res.status(200).json({
      success: true,
      data: { summary }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart summary',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;