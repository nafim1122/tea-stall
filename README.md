# Tea Stall Management System

A comprehensive tea stall management application built with React, TypeScript, Node.js, Express, and MongoDB. Complete migration from Firebase to MongoDB with full authentication and e-commerce functionality.

## 🚀 Features

- **Modern Frontend**: React 18 + TypeScript + Vite
- **Robust Backend**: Node.js + Express + MongoDB
- **Authentication**: JWT-based user authentication (migrated from Firebase)
- **Product Management**: Full CRUD operations for tea products
- **Shopping Cart**: Add/remove items with flexible quantity options
- **Order Processing**: Complete ordering system with payment methods
- **Admin Panel**: Product management and user administration
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS
- **Cloud Database**: MongoDB Atlas integration (optional local MongoDB)

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- shadcn-ui components
- Custom hooks for state management

### Backend (NEW!)
- Node.js + Express.js
- MongoDB with Mongoose ODM
- JWT Authentication
- bcryptjs for password hashing
- Express middleware (CORS, helmet, rate limiting)

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local OR MongoDB Atlas account)
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```sh
git clone https://github.com/nafim1122/tea-stall.git
cd tea-stall
```

### 2. Install Dependencies
```sh
# Frontend dependencies
npm install

# Backend dependencies
cd backend-mongodb
npm install
cd ..
```

### 3. Environment Setup

**Backend Environment** (`backend-mongodb/.env`):
```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/tea-stall

# OR MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tea-stall

JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
NODE_ENV=development
PORT=5000
```

### 4. Database Setup

**Option A: Seed Local Database**
```sh
cd backend-mongodb
npm run seed
```

**Option B: Use MongoDB Atlas**
```sh
# Export local data
node export-data.js

# Import to Atlas (replace with your connection string)
node import-atlas.js "mongodb+srv://user:pass@cluster.mongodb.net/tea-stall"
```

### 5. Start Development Servers

**Backend:**
```sh
cd backend-mongodb
npm run dev
```

**Frontend:**
```sh
npm run dev
```

## 📁 Project Structure

```
tea-stall/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Page components (Index.tsx updated)
│   ├── services/          # API services (api.ts - NEW!)
│   ├── hooks/             # Custom hooks (useAuth.tsx - NEW!)
│   └── types/             # TypeScript definitions
├── backend-mongodb/        # Complete backend (NEW!)
│   ├── models/            # Mongoose models
│   ├── routes/            # Express API routes
│   ├── middleware/        # Authentication & validation
│   ├── scripts/           # Database utilities
│   └── server.js          # Main server
├── backend/               # Legacy backend (deprecated)
└── public/               # Static assets
```

## 🔧 Available Scripts

### Frontend
- `npm run dev` - Development server (http://localhost:8080)
- `npm run build` - Production build
- `npm run preview` - Preview build
- `npm run lint` - Code linting

### Backend
- `npm start` - Production server
- `npm run dev` - Development server (http://localhost:5000)
- `npm run seed` - Seed database with sample data
- `npm test` - Run tests

### Database Management
```sh
cd backend-mongodb

# View local database
node view-database.js

# Export data
node export-data.js

# Test connections
node test-connections.js

# Import to Atlas
node import-atlas.js "your_atlas_connection_string"
```

## 🔐 Authentication System

**Migrated from Firebase to JWT!**

### Default Accounts (after seeding):
- **Admin**: admin@teastall.com / admin123
- **Customer**: customer@example.com / customer123

### Features:
- User registration and login
- Role-based access (admin/customer)
- JWT token authentication
- Protected API routes
- Persistent login sessions

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Products
- `GET /api/products` - Get all products (with pagination)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Cart Management
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item quantity
- `DELETE /api/cart/remove` - Remove item from cart
- `DELETE /api/cart/clear` - Clear entire cart

### Orders
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Place new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status (Admin)

## 🌐 Deployment Options

### Frontend
- **Vercel** (recommended): Zero-config deployment
- **Netlify**: Static site hosting
- **GitHub Pages**: Free hosting

### Backend
- **Railway**: Free tier with MongoDB support
- **Render**: Easy Node.js deployment
- **Railway.app**: Built-in MongoDB templates

### Database
- **MongoDB Atlas**: Free M0 tier (512MB)
- **Local MongoDB**: Development only

## 🔄 Migration Status

✅ **Completed:**
- Firebase to MongoDB migration
- JWT authentication system
- Complete backend API
- Frontend integration
- Database export/import tools
- MongoDB Atlas support

## 🐛 Troubleshooting

### Common Issues:

1. **MongoDB Connection Failed**
   ```sh
   # Check if MongoDB is running locally
   mongosh --eval "db.adminCommand('ping')"
   
   # Or verify Atlas connection string
   node backend-mongodb/test-atlas.js
   ```

2. **Authentication Errors**
   ```sh
   # Verify JWT secrets in .env
   # Check if backend server is running on port 5000
   ```

3. **CORS Issues**
   ```sh
   # Backend is configured for localhost:8080 (frontend)
   # Update CORS settings in server.js if needed
   ```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

---

**🍵 Built with love for tea enthusiasts everywhere!**

*Migration completed: September 2025*
