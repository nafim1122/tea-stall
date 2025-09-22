# Tea Stall MongoDB Backend

A comprehensive Node.js backend for the Tea Stall management system using Express.js, MongoDB, and Mongoose.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Product Management**: CRUD operations for tea, coffee, snacks, pastries, and beverages
- **Cart Management**: Real-time cart operations with customizations and pricing
- **Order Processing**: Complete order lifecycle from creation to completion
- **User Management**: Admin panel for user management and statistics
- **Data Validation**: Comprehensive input validation and error handling
- **Security**: Rate limiting, CORS, helmet, and other security middleware
- **Database**: MongoDB with Mongoose ODM and proper indexing
- **API Documentation**: RESTful API with consistent response format

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 4.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs, helmet, cors, express-rate-limit
- **Validation**: express-validator
- **Logging**: morgan
- **Environment**: dotenv

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud)
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tea-stall/backend-mongodb
```

2. Install dependencies:
```bash
npm install
```

3. Environment Setup:
```bash
cp .env.example .env
# Edit .env with your configuration
```

Required environment variables:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tea-stall
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

4. Start MongoDB service

5. Seed the database:
```bash
npm run seed
```

6. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile
- `PUT /password` - Change password
- `POST /logout` - Logout user
- `POST /refresh` - Refresh JWT token

### Products (`/api/products`)
- `GET /` - Get all products (with filtering, search, pagination)
- `GET /:id` - Get single product
- `POST /` - Create product (Admin only)
- `PUT /:id` - Update product (Admin only)
- `DELETE /:id` - Delete product (Admin only)
- `POST /:id/reviews` - Add product review
- `GET /categories/list` - Get product categories
- `GET /featured/list` - Get featured products
- `GET /stats/overview` - Get product statistics (Admin only)

### Cart (`/api/cart`)
- `GET /` - Get user cart
- `POST /items` - Add item to cart
- `PUT /items/:productId` - Update cart item quantity
- `DELETE /items/:productId` - Remove item from cart
- `DELETE /` - Clear cart
- `POST /discount` - Apply discount code
- `DELETE /discount` - Remove discount
- `POST /tax` - Set tax rate
- `POST /delivery` - Set delivery fee
- `GET /summary` - Get cart summary

### Orders (`/api/orders`)
- `POST /` - Create order from cart
- `GET /` - Get user orders
- `GET /all` - Get all orders (Admin only)
- `GET /:id` - Get single order
- `PUT /:id/status` - Update order status (Admin only)
- `PUT /:id/cancel` - Cancel order
- `POST /:id/rating` - Add order rating
- `POST /:id/notes` - Add order note (Admin only)
- `GET /stats/overview` - Get order statistics (Admin only)

### Users (`/api/users`) - Admin Only
- `GET /` - Get all users
- `GET /:id` - Get single user
- `POST /` - Create new user
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user (soft delete)
- `PATCH /:id/toggle-status` - Toggle user active status
- `GET /stats/overview` - Get user statistics
- `GET /recent/list` - Get recent users

## Database Models

### User Model
- Authentication and profile information
- Role-based access (customer/admin)
- Address and preferences
- Password hashing with bcrypt

### Product Model
- Comprehensive product information
- Categories, pricing, and inventory
- Nutritional information and dietary tags
- Review system with ratings
- Search indexing

### Cart Model
- User-specific cart management
- Item customizations and notes
- Automatic total calculations
- Discount and tax handling
- Expiration management

### Order Model
- Complete order lifecycle tracking
- Payment and delivery information
- Order status management
- Rating and review system
- Admin notes and history

## Security Features

- **Authentication**: JWT tokens with secure secret
- **Authorization**: Role-based access control
- **Rate Limiting**: Configurable request limits
- **Input Validation**: Comprehensive validation rules
- **Password Security**: bcrypt hashing with salt
- **CORS**: Configurable cross-origin policies
- **Headers**: Security headers with helmet
- **Error Handling**: Secure error responses

## Development

### Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run seed       # Seed database with sample data
npm test           # Run tests (jest)
```

### Code Structure

```
backend-mongodb/
├── models/         # Mongoose models
├── routes/         # API route handlers
├── middleware/     # Custom middleware
├── scripts/        # Database scripts
├── uploads/        # File upload directory
├── server.js       # Main application file
├── package.json    # Dependencies and scripts
└── .env           # Environment variables
```

### Sample Data

The seeder creates:
- **Admin user**: admin@teastall.com / admin123
- **Customer user**: customer@example.com / customer123
- **12 products** across 5 categories
- **Sample reviews** for featured products

## Production Deployment

### Environment Setup
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tea-stall
JWT_SECRET=secure_production_secret_here
CLIENT_URL=https://your-frontend-domain.com
```

### Deployment Steps
1. Set up MongoDB Atlas or production database
2. Configure environment variables
3. Install dependencies: `npm ci --production`
4. Run database seeder: `npm run seed`
5. Start application: `npm start`

### Performance Considerations
- Database indexing for efficient queries
- Rate limiting to prevent abuse
- Compression middleware for response optimization
- Proper error logging and monitoring

## API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors (if applicable)
  ]
}
```

### Pagination Response
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## Error Handling

The application includes comprehensive error handling:

- **Validation Errors**: Input validation with detailed error messages
- **Authentication Errors**: JWT and authorization failures
- **Database Errors**: MongoDB operation failures
- **Application Errors**: Custom business logic errors
- **Server Errors**: Unexpected server failures

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the documentation
- Review API endpoints
- Examine sample data structure
- Check environment configuration

## Changelog

### v1.0.0
- Initial release with complete backend functionality
- User authentication and authorization
- Product management system
- Cart and order processing
- Admin panel features
- Comprehensive API documentation