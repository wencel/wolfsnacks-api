# Wolfsnacks API - Backend Server

A RESTful API backend for managing sales and orders for a small business. Built with Node.js, Express, and MongoDB to provide a robust foundation for the Wolfsnacks business management application.

## 🎯 Project Overview

This API serves as the backend infrastructure for a comprehensive business management tool that tracks customers, products, sales, and orders. It features secure authentication, data validation, and efficient database operations designed for daily operational use.

This is the backend API of a full-stack solution. The frontend application is available at [wolfsnack-vite](https://github.com/wencel/wolfsnack-vite).

## ✨ Features

### Core Functionality

* **User Management**: Secure user registration, authentication, and account activation
* **Customer Management**: CRUD operations for customer information with location tracking
* **Product Management**: Track products with types, presentations, weights, pricing, and stock levels
* **Sales Management**: Record and manage sales transactions with product tracking
* **Order Management**: Monitor and manage business orders
* **Authentication**: JWT-based authentication with secure password hashing
* **Data Validation**: Comprehensive input validation and error handling
* **Image Processing**: User avatar upload and processing with Sharp
* **Email Integration**: Account activation emails via Gmail

### Technical Highlights

* **RESTful API Design**: Clean, intuitive API endpoints following REST conventions
* **MongoDB with Mongoose**: Efficient data modeling with relationships and virtuals
* **JWT Authentication**: Secure token-based authentication system
* **Password Security**: Bcrypt hashing with strong password requirements
* **Data Validation**: Input validation using Mongoose schemas and custom validators
* **Cascade Deletes**: Automatic cleanup of related data when users are deleted
* **CORS Configuration**: Secure cross-origin resource sharing
* **Error Handling**: Comprehensive error messages and status codes
* **Multi-user Support**: User-scoped data isolation for security

## 🛠️ Tech Stack

### Core

* **Node.js 22.x** - JavaScript runtime
* **Express 4.x** - Web framework
* **MongoDB** - NoSQL database
* **Mongoose 8.x** - MongoDB object modeling

### Authentication & Security

* **JSON Web Tokens (JWT)** - Token-based authentication
* **Bcrypt** - Password hashing
* **CORS** - Cross-origin resource sharing

### Utilities

* **Validator** - Input validation
* **Multer** - File upload handling
* **Sharp** - Image processing
* **Nodemailer** - Email service with Gmail integration
* **Mongoose Sequence** - Auto-incrementing sequences

### Development Tools

* **Nodemon** - Development server with auto-reload
* **Jest** - Testing framework
* **Supertest** - HTTP assertion testing
* **env-cmd** - Environment variable management
* **Chalk** - Terminal string styling

## 📁 Project Structure

```
src/
├── app.js              # Express app configuration
├── index.js            # Server entry point
├── constants.js        # Application constants and error messages
├── utils.js            # Utility functions
├── db/
│   └── mongoose.js     # MongoDB connection
├── models/             # Mongoose schemas
│   ├── user.js         # User model with authentication
│   ├── customer.js     # Customer model
│   ├── product.js      # Product model
│   ├── order.js        # Order model
│   ├── sale.js         # Sale model
│   └── alternateProductSchema.js
├── routers/            # API route handlers
│   ├── user.js         # User authentication routes
│   ├── customer.js     # Customer CRUD routes
│   ├── product.js      # Product CRUD routes
│   ├── order.js        # Order CRUD routes
│   ├── sale.js         # Sale CRUD routes
│   └── utils.js        # Utility routes
├── middlewares/
│   └── auth.js         # JWT authentication middleware
└── emails/
    └── account.js      # Email templates and sending

config/
└── dev.env            # Development environment variables

tests/
├── fixtures/          # Test data and utilities
└── user.test.js       # User model tests
```

## 🚀 Getting Started

### Prerequisites

* Node.js (v22.x or higher)
* MongoDB (running locally or remote instance)
* npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd wolfsnacks-api
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `config/dev.env` file (or copy from the example):

```env
# Server Configuration
PORT=3001

# Database
MONGODB_URL=mongodb://localhost:27017/wolfsnacks-dev

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-here

# Email Service (Gmail)
GMAIL_USER=your-gmail-address@gmail.com
GMAIL_APP_PASS=your-16-character-app-password

# Web Application URL
WEB_URL=http://localhost:5173
```

**Note:** To generate a Gmail app password:
1. Go to your Google Account settings
2. Enable 2-Step Verification if not already enabled
3. Go to Security → 2-Step Verification → App passwords
4. Generate a new app password for "Mail" and "Other (Custom name)"
5. Use the generated 16-character password for `GMAIL_APP_PASS`

4. Start MongoDB:

Ensure MongoDB is running on your system. If running locally:

```bash
mongod --dbpath=/path/to/mongodb-data
```

5. Start the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

### Production Deployment

#### Render Deployment

This project is configured for deployment on [Render](https://render.com). The `Procfile` and `render.yaml` are already set up.

**Steps to deploy on Render:**

1. **Create a new Web Service** on Render and connect your GitHub repository

2. **Configure Environment Variables** in Render dashboard:
   - `MONGODB_URL` - Your MongoDB connection string (e.g., MongoDB Atlas)
   - `JWT_SECRET` - A strong secret key for JWT token signing
   - `GMAIL_USER` - Your Gmail address (e.g., `you@gmail.com`)
   - `GMAIL_APP_PASS` - Your Gmail 16-character app password (generate from Google Account settings)
   - `WEB_URL` - Your frontend application URL (e.g., `https://your-frontend.onrender.com`)
   - `ALLOWED_ORIGINS` - Comma-separated list of additional allowed origins (optional, defaults include localhost and Heroku URLs)

3. **Build & Deploy Settings:**
   - Build Command: `npm install` (auto-detected)
   - Start Command: `npm start` (auto-detected from Procfile)
   - Node Version: 22.x (specified in package.json)

4. **MongoDB Setup:**
   - Use MongoDB Atlas or Render's MongoDB service
   - Ensure your MongoDB instance allows connections from Render's IP addresses

**Example Environment Variables:**
```env
MONGODB_URL=mongodb+srv://username:password@your-mongo-db-url
JWT_SECRET=your-super-secret-production-jwt-key
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASS=your-16-character-app-password
WEB_URL=https://your-frontend-app.onrender.com
ALLOWED_ORIGINS=https://your-frontend-app.onrender.com,https://another-domain.com
```

**Note:** Render automatically sets the `PORT` environment variable, so you don't need to configure it.

#### Heroku Deployment

For Heroku deployment:

```bash
npm start
```

The `Procfile` is configured for Heroku deployment.

## 📡 API Endpoints

### Authentication

* `POST /api/users` - Register a new user
* `POST /api/users/login` - User login
* `POST /api/users/logout` - User logout
* `POST /api/users/logoutAll` - Logout from all devices
* `GET /api/users/me` - Get current user profile
* `PATCH /api/users/me` - Update user profile
* `DELETE /api/users/me` - Delete user account
* `POST /api/users/me/avatar` - Upload user avatar
* `DELETE /api/users/me/avatar` - Delete user avatar
* `GET /api/users/:id/avatar` - Get user avatar
* `POST /api/users/activate` - Activate user account

### Products

* `POST /api/products` - Create a new product (requires auth)
* `GET /api/products` - Get all products with filtering (requires auth)
* `GET /api/products/:id` - Get a specific product (requires auth)
* `PATCH /api/products/:id` - Update a product (requires auth)
* `DELETE /api/products/:id` - Delete a product (requires auth)

**Query Parameters for GET /api/products:**
- `presentation` - Filter by presentation type
- `textQuery` - Search by name or presentation
- `limit` - Number of results (default: 10)
- `skip` - Number of results to skip (default: 0)

### Customers

* `POST /api/customers` - Create a new customer (requires auth)
* `GET /api/customers` - Get all customers with filtering (requires auth)
* `GET /api/customers/:id` - Get a specific customer (requires auth)
* `PATCH /api/customers/:id` - Update a customer (requires auth)
* `DELETE /api/customers/:id` - Delete a customer (requires auth)

### Orders

* `POST /api/orders` - Create a new order (requires auth)
* `GET /api/orders` - Get all orders with filtering (requires auth)
* `GET /api/orders/:id` - Get a specific order (requires auth)
* `PATCH /api/orders/:id` - Update an order (requires auth)
* `DELETE /api/orders/:id` - Delete an order (requires auth)

### Sales

* `POST /api/sales` - Create a new sale (requires auth)
* `GET /api/sales` - Get all sales with filtering (requires auth)
* `GET /api/sales/:id` - Get a specific sale (requires auth)
* `PATCH /api/sales/:id` - Update a sale (requires auth)
* `DELETE /api/sales/:id` - Delete a sale (requires auth)

### Utilities

* `GET /api/utils/localities` - Get list of available localities
* `GET /api/utils/presentations` - Get list of available presentations
* `GET /api/utils/productTypes` - Get list of available product types

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected endpoints:

1. Register or login to receive a JWT token
2. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### Password Requirements

Passwords must meet the following criteria:
* Minimum 8 characters
* At least one uppercase letter
* At least one lowercase letter
* At least one number
* At least one special character

## 📊 Data Models

### User

* `name` - User's full name
* `email` - Unique email address
* `password` - Hashed password
* `active` - Account activation status
* `tokens` - Array of active JWT tokens
* `avatar` - User profile picture (Buffer)

### Product

* `name` - Product type (Maxigalleta, Minigalleta, Chips)
* `presentation` - Presentation type (Sobre, Caja Sello Plus, Recarga, Bombonera)
* `weight` - Product weight (must be > 0)
* `basePrice` - Base price (must be > 0)
* `sellingPrice` - Selling price (must be > 0)
* `stock` - Current stock quantity (must be >= 0)
* `user` - Reference to owner user

### Customer

* `name` - Customer name
* `email` - Customer email (optional, validated)
* `address` - Customer address
* `storeName` - Store name
* `phoneNumber` - Primary phone number (numeric)
* `secondaryPhoneNumber` - Secondary phone number (optional)
* `locality` - Locality (from predefined list)
* `town` - Town name
* `idNumber` - Identification number
* `user` - Reference to owner user

### Order & Sale

Both models track business transactions with:
* Product references
* Quantities
* Prices
* Customer references
* User ownership

## 🧪 Testing

Run tests:

```bash
npm test
```

Tests use Jest and Supertest for API endpoint testing.

## 📝 Available Scripts

* `npm start` - Start production server
* `npm run dev` - Start development server with nodemon
* `npm run debug` - Start server in debug mode
* `npm test` - Run tests in watch mode

## 🏗️ Architecture Decisions

### Database Design

* **MongoDB**: Chosen for flexibility in schema design and scalability
* **Mongoose**: Provides schema validation, middleware, and type casting
* **User Scoping**: All data is scoped to users for multi-tenant support
* **Virtual Fields**: Used for computed properties (e.g., product fullName)
* **Indexes**: Text indexes for search functionality, unique indexes for data integrity

### Security

* **JWT Tokens**: Stateless authentication for scalability
* **Password Hashing**: Bcrypt with salt rounds for password security
* **Input Validation**: Mongoose schema validation and custom validators
* **CORS**: Whitelist-based CORS configuration
* **User Isolation**: All queries filtered by user ID

### Error Handling

* **Consistent Error Format**: All errors return `{ error: "message" }`
* **HTTP Status Codes**: Proper status codes (400, 401, 404, 500)
* **Validation Errors**: Detailed validation error messages
* **Error Constants**: Centralized error messages in `constants.js`

## 🔒 Security Considerations

* All passwords are hashed using bcrypt before storage
* JWT tokens are required for protected endpoints
* User data is isolated by user ID
* Input validation on all endpoints
* CORS configured to allow only trusted origins
* Cascade deletes prevent orphaned data

## 🔌 Frontend Integration

This API is designed to work with the frontend application:

**Frontend Repository**: [wolfsnack-vite](https://github.com/wencel/wolfsnack-vite)

The frontend should be configured with:

```env
VITE_API_URL=http://localhost:3001/api
```

## 📦 Key Dependencies

See `package.json` for the complete list. Notable dependencies:

* **express** - Web framework
* **mongoose** - MongoDB ODM
* **jsonwebtoken** - JWT authentication
* **bcrypt** - Password hashing
* **multer** - File uploads
* **sharp** - Image processing
* **validator** - Input validation
* **nodemailer** - Email sending with Gmail

## 🤝 Contributing

This is a personal project, but feedback and suggestions are welcome!

## 📄 License

MIT License

## 👨‍💻 Author

**Wencel Santos**

Built as a showcase of Node.js and Express proficiency, and as a practical business management solution.

---

## 🔗 Related Repositories

* **Frontend Application**: [wolfsnack-vite](https://github.com/wencel/wolfsnack-vite)

**Note**: This API is designed to work with the frontend application. Ensure both are running and properly configured for full functionality.
