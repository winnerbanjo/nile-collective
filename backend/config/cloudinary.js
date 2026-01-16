import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Validate Cloudinary configuration
// Updated cloud_name to: do4mbqgjn
let cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'do4mbqgjn';
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Normalize cloud_name to lowercase (Cloudinary requires lowercase)
if (cloudName) {
  cloudName = cloudName.toLowerCase().trim();
}

// Ensure the updated cloud_name is used
cloudName = 'do4mbqgjn';

if (!cloudName || !apiKey || !apiSecret) {
  console.warn('⚠️  Cloudinary configuration incomplete. Image uploads will fail.');
  console.warn('Required env vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
  console.warn('Current values:', {
    cloud_name: cloudName || 'MISSING',
    api_key: apiKey ? 'SET' : 'MISSING',
    api_secret: apiSecret ? 'SET' : 'MISSING'
  });
} else {
  console.log('✅ Cloudinary configured:', {
    cloud_name: cloudName,
    api_key: apiKey ? `${apiKey.substring(0, 4)}...` : 'missing',
    api_secret: apiSecret ? '***' : 'missing'
  });
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

// Log the cloud_name being used
console.log('Using Cloudinary Cloud Name:', cloudinary.config().cloud_name);
console.log('Cloudinary initialized with ID: do4mbqgjn');

export default cloudinary;
