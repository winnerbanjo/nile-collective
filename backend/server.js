// CRITICAL: Global error handlers - MUST be at the very top before any other code
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION - Server will continue running:', error);
  console.error('Error stack:', error.stack);
  // Don't exit - let the server continue
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION at:', promise, 'reason:', reason);
  // Don't exit - let the server continue
});

// Load environment variables FIRST, before any other imports that might use them
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import productRoutes from './routes/productRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import userRoutes from './routes/userRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import cloudinary from './config/cloudinary.js';

const app = express();
const PORT = process.env.PORT || 5001;

// CORS - MUST be the very first middleware, before anything else
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type'],
  optionsSuccessStatus: 200
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Nile Collective API' });
});

// Test route to verify server is running
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working', timestamp: new Date().toISOString() });
});

// Product routes
app.use('/api/products', productRoutes);

// Upload routes
app.use('/api/upload', uploadRoutes);
console.log('✅ Upload routes mounted at /api/upload');

// Settings routes
app.use('/api/settings', settingsRoutes);

// Order routes
app.use('/api/orders', orderRoutes);

// Newsletter routes
app.use('/api/newsletter', newsletterRoutes);

// User routes
app.use('/api/users', userRoutes);

// Review routes
app.use('/api/reviews', reviewRoutes);

// Verify Cloudinary configuration
console.log('Cloudinary initialized with ID: do4mbqgjn');
console.log('Cloudinary Cloud Name:', cloudinary.config().cloud_name);

// Debug: Log all registered routes
console.log('📋 Registered Routes:');
console.log('  GET  /');
console.log('  GET  /api/test');
console.log('  *    /api/products');
console.log('  *    /api/upload');
console.log('  GET  /api/upload/test');
console.log('  POST /api/upload/image');
console.log('  GET  /api/settings');
console.log('  PUT  /api/settings');
console.log('  GET  /api/orders');
console.log('  POST /api/orders');
console.log('  POST /api/orders/verify');
console.log('  POST /api/orders/manual');
console.log('  PUT  /api/orders/:id/status');
console.log('  GET  /api/orders/:id');
console.log('  GET  /api/orders/myorders');
console.log('  POST /api/newsletter/subscribe');
  console.log('  POST /api/users/register');
  console.log('  POST /api/users/login');
  console.log('  GET  /api/users/:id/cart');
  console.log('  PUT  /api/users/:id/cart');
  console.log('  GET  /api/reviews');
  console.log('  GET  /api/reviews/product/:productId');
  console.log('  POST /api/reviews');
  console.log('  PUT  /api/reviews/:id/approve');
  console.log('  DELETE /api/reviews/:id');

// MongoDB connection - wrapped in try/catch for safety
try {
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000, // Increased timeout
    family: 4
  })
  .then(() => {
    console.log('✅ MongoDB Atlas connected successfully');
    console.log('READY_STATE: ' + mongoose.connection.readyState);
    
    // Check if readyState is 1 (connected)
    if (mongoose.connection.readyState !== 1) {
      console.warn('⚠️ MongoDB connection readyState is not 1. Current state:', mongoose.connection.readyState);
      console.warn('⚠️ Server will start anyway - connection may be in progress');
    }
    
    // Start server only after MongoDB connection is verified
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`✅ CORS enabled for: http://localhost:3000 and http://localhost:3001`);
      console.log(`✅ Upload endpoint ready: http://localhost:${PORT}/api/upload/image`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('⚠️ Server will start anyway - database operations may fail');
    // Start server anyway - don't crash the whole app
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT} (without database connection)`);
      console.log(`⚠️ WARNING: Database connection failed - some features may not work`);
    });
  });
} catch (error) {
  console.error('❌ Error during server startup:', error);
  // Still try to start the server
  app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT} (with errors)`);
    console.log(`⚠️ WARNING: Startup errors occurred - check logs above`);
  });
}
