const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Helper to get hex code for colors
const getColorHex = (name) => {
  const n = name.toLowerCase().trim();
  if (n.includes('black')) return '#111111';
  if (n.includes('dark indigo') || n.includes('dark blue')) return '#0d1b3e';
  if (n.includes('ice blue') || n.includes('light blue')) return '#add8e6';
  if (n.includes('indigo blue') || n.includes('indigo')) return '#2e5894';
  if (n.includes('grey') || n.includes('gray')) return '#808080';
  if (n.includes('khaki')) return '#f0e68c';
  if (n.includes('beige')) return '#f5f5dc';
  if (n.includes('olive')) return '#808000';
  return '#000000';
};

// Configure Multer for Product Image Upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/products/';
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed!'));
    }
  }
});

// @desc    Get all products (with optional filtering)
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { brand, type, size, color, search } = req.query;
    let query = {};

    if (brand) {
      query.brand = brand;
    }
    if (type) {
      query.type = type;
    }
    if (size) {
      query.sizes = Number(size);
    }
    if (color) {
      query['colors.name'] = color;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, authorize('admin'), upload.array('images', 5), async (req, res) => {
  try {
    const { name, brand, type, pricePerPiece, piecesPerBundle, moq, sizes, colors, description, inStock } = req.body;

    // Build the images array from file uploads
    const imageUrls = req.files 
      ? req.files.map(file => `/uploads/products/${file.filename}`) 
      : [];

    let parsedColors = [];
    if (colors) {
      const rawColors = typeof colors === 'string' ? JSON.parse(colors) : colors;
      if (Array.isArray(rawColors)) {
        parsedColors = rawColors.map(c => {
          if (typeof c === 'object' && c.name) {
            return {
              name: c.name.trim(),
              hexCode: c.hexCode || getColorHex(c.name),
              stock: Number(c.stock) || 100
            };
          } else if (typeof c === 'string') {
            return {
              name: c.trim(),
              hexCode: getColorHex(c),
              stock: 100
            };
          }
          return c;
        });
      } else if (typeof rawColors === 'string') {
        parsedColors = rawColors.split(',').map(c => c.trim()).filter(Boolean).map(cName => ({
          name: cName,
          hexCode: getColorHex(cName),
          stock: 100
        }));
      }
    }

    const product = await Product.create({
      name,
      brand,
      type,
      pricePerPiece: Number(pricePerPiece),
      piecesPerBundle: Number(piecesPerBundle) || 5,
      moq: Number(moq) || 50,
      sizes: sizes ? (typeof sizes === 'string' ? JSON.parse(sizes) : sizes) : [28, 30, 32, 34, 36],
      colors: parsedColors,
      images: imageUrls,
      description,
      inStock: inStock === 'true' || inStock === true
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), upload.array('images', 5), async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const { name, brand, type, pricePerPiece, piecesPerBundle, moq, sizes, colors, description, inStock } = req.body;

    let parsedColors;
    if (colors) {
      const rawColors = typeof colors === 'string' ? JSON.parse(colors) : colors;
      if (Array.isArray(rawColors)) {
        parsedColors = rawColors.map(c => {
          if (typeof c === 'object' && c.name) {
            return {
              name: c.name.trim(),
              hexCode: c.hexCode || getColorHex(c.name),
              stock: Number(c.stock) || 100
            };
          } else if (typeof c === 'string') {
            return {
              name: c.trim(),
              hexCode: getColorHex(c),
              stock: 100
            };
          }
          return c;
        });
      } else if (typeof rawColors === 'string') {
        parsedColors = rawColors.split(',').map(c => c.trim()).filter(Boolean).map(cName => ({
          name: cName,
          hexCode: getColorHex(cName),
          stock: 100
        }));
      }
    }

    let updatedFields = {
      name,
      brand,
      type,
      pricePerPiece: Number(pricePerPiece),
      piecesPerBundle: Number(piecesPerBundle) || 5,
      moq: Number(moq) || 50,
      sizes: sizes ? (typeof sizes === 'string' ? JSON.parse(sizes) : sizes) : [28, 30, 32, 34, 36],
      description,
      inStock: inStock === 'true' || inStock === true
    };

    if (parsedColors) {
      updatedFields.colors = parsedColors;
    }

    // If new images are uploaded, append or replace them
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(file => `/uploads/products/${file.filename}`);
      updatedFields.images = [...product.images, ...newImageUrls];
    }

    product = await Product.findByIdAndUpdate(req.params.id, updatedFields, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Delete associated images from the filesystem
    product.images.forEach(imgUrl => {
      const filePath = path.join(__dirname, '..', imgUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
