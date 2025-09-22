import express from 'express';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateUserUpdate, validateObjectId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    // Role filter
    if (req.query.role) {
      query.role = req.query.role;
    }

    // Active status filter
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    // Email verification filter
    if (req.query.emailVerified !== undefined) {
      query.emailVerified = req.query.emailVerified === 'true';
    }

    // Search by name or email
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    // Sort options
    let sort = {};
    if (req.query.sort) {
      const sortField = req.query.sort;
      const sortOrder = req.query.order === 'desc' ? -1 : 1;
      sort[sortField] = sortOrder;
    } else {
      sort = { createdAt: -1 }; // Default sort by newest
    }

    const users = await User.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-password -verificationToken -resetPasswordToken -resetPasswordExpire');

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
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
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin only)
router.get('/:id', protect, authorize('admin'), validateObjectId(), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -verificationToken -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), validateObjectId(), validateUserUpdate, async (req, res) => {
  try {
    const allowedUpdates = ['name', 'email', 'role', 'phone', 'address', 'isActive', 'emailVerified'];
    const updates = {};

    // Filter allowed updates
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Prevent admin from deactivating themselves
    if (updates.isActive === false && req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    // Prevent admin from changing their own role
    if (updates.role && req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -verificationToken -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Delete user (soft delete)
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), validateObjectId(), async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete by deactivating the user
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Create new user (Admin only)
// @route   POST /api/users
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, role = 'customer', phone, address } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      address,
      emailVerified: true // Admin-created users are pre-verified
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get user statistics (Admin only)
// @route   GET /api/users/stats/overview
// @access  Private (Admin only)
router.get('/stats/overview', protect, authorize('admin'), async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
          verifiedUsers: { $sum: { $cond: ['$emailVerified', 1, 0] } },
          adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
          customerUsers: { $sum: { $cond: [{ $eq: ['$role', 'customer'] }, 1, 0] } }
        }
      }
    ]);

    // User registration trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const registrationTrend = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {},
        registrationTrend
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get recent users (Admin only)
// @route   GET /api/users/recent/list
// @access  Private (Admin only)
router.get('/recent/list', protect, authorize('admin'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const users = await User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name email role createdAt lastLogin');

    res.status(200).json({
      success: true,
      data: { users }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent users',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Toggle user active status
// @route   PATCH /api/users/:id/toggle-status
// @access  Private (Admin only)
router.patch('/:id/toggle-status', protect, authorize('admin'), validateObjectId(), async (req, res) => {
  try {
    // Prevent admin from deactivating themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own status'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isActive: user.isActive
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle user status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;