# Tea Time Backend API

A Node.js/Express backend for the Tea Time e-commerce platform with price-per-kg functionality.

## Features

- **Product Management**: CRUD operations for products with price-per-kg/piece
- **Cart System**: Server-side price calculation and validation
- **Order Processing**: Complete order management with price verification
- **Admin Panel**: Product and order management APIs
- **Security**: Rate limiting, CORS, input validation, and sanitization
- **Database**: MongoDB with Mongoose ODM

## Installation

1. **Clone and navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start MongoDB** (make sure MongoDB is running on your system)

5. **Seed the database** (optional)
```bash
npm run seed
```

6. **Start the server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/admin/products` - Create product (admin)
- `PUT /api/admin/products/:id` - Update product (admin)
- `DELETE /api/admin/products/:id` - Delete product (admin)

### Cart
- `POST /api/cart/add` - Add item to cart
- `GET /api/cart/:sessionId` - Get cart items
- `PUT /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove cart item

### Orders
- `POST /api/orders` - Create order
- `GET /api/admin/orders` - Get all orders (admin)

### Health Check
- `GET /api/health` - Server health status

## Data Models

### Product Schema
```javascript
{
  name: String (required),
  description: String,
  image_url: String (required),
  base_price_per_kg: Number (required, min: 0),
  old_price_per_kg: Number (min: 0),
  unit: String (enum: ['kg', 'piece'], required),
  category: String,
  inStock: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Cart Item Schema
```javascript
{
  productId: ObjectId (ref: Product, required),
  quantity: Number (required, min: 0.1),
  unit: String (enum: ['kg', 'piece'], required),
  unitPriceAtTime: Number (required, min: 0),
  totalPriceAtTime: Number (required, min: 0),
  sessionId: String (required),
  createdAt: Date
}
```

### Order Schema
```javascript
{
  items: [{
    productId: ObjectId (ref: Product),
    name: String,
    quantity: Number,
    unit: String,
    unitPrice: Number,
    totalPrice: Number
  }],
  total: Number (required, min: 0),
  paymentMethod: String (required),
  transactionId: String,
  address: String (required),
  phone: String (required),
  status: String (enum: ['pending', 'confirmed', 'delivered']),
  createdAt: Date
}
```

## Key Features

### Server-Side Price Calculation
- All prices are calculated on the server to prevent tampering
- Cart items store price at the time of addition
- Orders recalculate prices during checkout for accuracy

### Input Validation
- Comprehensive validation for all endpoints
- Quantity validation based on unit type (kg vs piece)
- Price and product existence verification

### Security Features
- Rate limiting to prevent abuse
- CORS configuration for frontend integration
- Input sanitization and validation
- Helmet.js for security headers

### Error Handling
- Comprehensive error handling middleware
- Detailed error messages for debugging
- Proper HTTP status codes

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/teatime
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-super-secure-jwt-secret-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode with auto-reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Seed database with sample data
npm run seed
```

## Production Deployment

1. Set `NODE_ENV=production` in environment variables
2. Use a production MongoDB instance
3. Configure proper CORS origins
4. Set up proper logging and monitoring
5. Use PM2 or similar process manager

## Testing

The API includes comprehensive error handling and validation. Test with tools like:
- Postman
- curl
- Frontend integration
- Automated tests (Jest/Supertest)

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all validations are in place