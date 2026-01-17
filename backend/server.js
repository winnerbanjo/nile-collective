// CRITICAL: Global error handlers - MUST be at the very top before any other code
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION - Server will continue running:', error);
  console.error('Error stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

// Load environment variables FIRST
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

// ✅ NUCLEAR CORS FIX: Allow all origins temporarily to prove connection works
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

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

app.get('/health', (req, res) => {
  res.send('OK');
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working', timestamp: new Date().toISOString() });
});

app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);

// Verify Cloudinary configuration
console.log('Cloudinary initialized with ID: do4mbqgjn');
console.log('Cloudinary Cloud Name:', cloudinary.config().cloud_name);

// MongoDB connection
try {
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    family: 4
  })
  .then(() => {
    console.log('✅ MongoDB Atlas connected successfully');
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`✅ CORS enabled for production and local development`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT} (Check MongoDB connection!)`);
    });
  });
} catch (error) {
  console.error('❌ Error during server startup:', error);
  app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT} (with errors)`);
  });
}
