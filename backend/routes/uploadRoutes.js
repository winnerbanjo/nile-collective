import express from 'express';
import upload from '../middleware/upload.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

console.log('📦 Upload router initialized');

// Test route to verify upload router is working
router.get('/test', (req, res) => {
  console.log('✅ Test route hit: GET /api/upload/test');
  res.json({ message: 'Upload router is working', path: '/api/upload/test' });
});

// Upload image to Cloudinary
// Route: POST /api/upload/image (full path when mounted at /api/upload)
// Field name: 'image' (must match FormData.append('image', file))
router.post('/image', upload.single('image'), async (req, res) => {
  // Log at the very top to see if file is reaching the backend
  console.log('--- UPLOAD ATTEMPT ---');
  console.log('File received by backend:', req.file);
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  
  try {
    console.log('=== IMAGE UPLOAD REQUEST ===');
    console.log('✅ Route hit: POST /api/upload/image');
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('Full URL:', req.originalUrl);
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('Upload request received. File:', req.file ? '✅ Present' : '❌ Missing');
    
    // Log the file object as requested
    console.log('File received by backend:', req.file);
    
    if (!req.file) {
      console.error('❌ No file in request');
      console.log('Request body keys:', Object.keys(req.body));
      console.log('Request body:', req.body);
      console.log('Multer error:', req.error);
      return res.status(400).json({ message: 'No image file provided' });
    }

    console.log('File details:', {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer ? `Buffer (${req.file.buffer.length} bytes)` : 'No buffer'
    });
    
    // Verify field name matches
    if (req.file.fieldname !== 'image') {
      console.error('⚠️ WARNING: Field name mismatch!');
      console.error('Expected: image');
      console.error('Received:', req.file.fieldname);
    }

    // Convert buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;

    // Debug: Check Cloudinary config before upload
    const cloudinaryConfig = cloudinary.config();
    console.log('Using Cloudinary Cloud Name:', cloudinaryConfig.cloud_name);
    console.log('Cloudinary Config:', {
      cloud_name: cloudinaryConfig.cloud_name,
      api_key: cloudinaryConfig.api_key ? `${cloudinaryConfig.api_key.substring(0, 4)}...` : 'missing',
      api_secret: cloudinaryConfig.api_secret ? '***' : 'missing'
    });

    console.log('📤 Uploading to Cloudinary...');
    console.log('DataURI format:', dataURI.substring(0, 50) + '...' + ` (${dataURI.length} chars)`);
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'nile-collective',
      resource_type: 'image',
    });

    console.log('✅ Cloudinary upload successful!');
    console.log('Cloudinary Result:', {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    });

    // Return the URL in the exact format the frontend expects
    res.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: 'Failed to upload image', 
      error: error.message 
    });
  }
});

export default router;
