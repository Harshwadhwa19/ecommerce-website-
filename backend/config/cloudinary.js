const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary Credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Storage for Product Images
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jg-jeans/products',
    allowed_formats: ['jpeg', 'jpg', 'png', 'webp'],
    transformation: [{ width: 800, height: 1000, crop: 'limit' }] // Optimize and normalize image sizes
  }
});

// Configure Storage for Payment Proof Screenshots
const screenshotStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jg-jeans/screenshots',
    allowed_formats: ['jpeg', 'jpg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 1500, crop: 'limit' }] // Optimize payment receipts
  }
});

// Initialize Multer upload engines
const uploadProducts = multer({ 
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

const uploadScreenshots = multer({ 
  storage: screenshotStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

module.exports = {
  cloudinary,
  uploadProducts,
  uploadScreenshots
};
