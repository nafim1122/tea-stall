import { body, param, query, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User validation rules
export const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

export const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors
];

// Product validation rules
export const validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('price')
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Price must be between 0 and 10000'),
  body('category')
    .isIn(['tea', 'coffee', 'snacks', 'pastries', 'beverages', 'breakfast', 'lunch', 'dinner'])
    .withMessage('Invalid category'),
  body('stockQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  handleValidationErrors
];

export const validateProductUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Price must be between 0 and 10000'),
  body('category')
    .optional()
    .isIn(['tea', 'coffee', 'snacks', 'pastries', 'beverages', 'breakfast', 'lunch', 'dinner'])
    .withMessage('Invalid category'),
  body('stockQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  handleValidationErrors
];

// Cart validation rules
export const validateCartItem = [
  body('productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('quantity')
    .isInt({ min: 1, max: 50 })
    .withMessage('Quantity must be between 1 and 50'),
  body('customizations')
    .optional()
    .isArray()
    .withMessage('Customizations must be an array'),
  handleValidationErrors
];

export const validateCartUpdate = [
  body('quantity')
    .isInt({ min: 0, max: 50 })
    .withMessage('Quantity must be between 0 and 50'),
  handleValidationErrors
];

// Order validation rules
export const validateOrder = [
  body('orderType')
    .isIn(['dine-in', 'takeaway', 'delivery'])
    .withMessage('Invalid order type'),
  body('paymentMethod')
    .isIn(['cash', 'card', 'mobile-banking', 'online'])
    .withMessage('Invalid payment method'),
  body('customerInfo.name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Customer name must be between 2 and 50 characters'),
  body('customerInfo.phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('tableNumber')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Table number must be between 1 and 100'),
  handleValidationErrors
];

export const validateOrderStatus = [
  body('status')
    .isIn(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'])
    .withMessage('Invalid order status'),
  handleValidationErrors
];

export const validateOrderRating = [
  body('score')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating score must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
  handleValidationErrors
];

// Common validation rules
export const validateObjectId = (field = 'id') => [
  param(field)
    .isMongoId()
    .withMessage(`Invalid ${field}`),
  handleValidationErrors
];

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

export const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  handleValidationErrors
];