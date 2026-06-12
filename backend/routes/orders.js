const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for Payment Screenshot Upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/screenshots/';
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'screenshot-' + uniqueSuffix + path.extname(file.originalname));
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

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, upload.single('screenshot'), async (req, res) => {
  try {
    const { items, totalAmount, deliveryAddress } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a payment screenshot' });
    }

    const orderItems = typeof items === 'string' ? JSON.parse(items) : items;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, error: 'No items in the order' });
    }

    const order = await Order.create({
      buyer: req.user.id,
      items: orderItems,
      totalAmount: Number(totalAmount),
      deliveryAddress,
      paymentScreenshot: `/uploads/screenshots/${req.file.filename}`,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Get orders (role-based: returns all if admin, or user-specific if buyer)
// @route   GET /api/orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const orders = await Order.find()
        .populate('buyer', 'name shopName phone email')
        .populate('items.product')
        .sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
      });
    } else {
      const orders = await Order.find({ buyer: req.user.id })
        .populate('items.product')
        .sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Get logged in buyer orders
// @route   GET /api/orders/my-orders
// @access  Private
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Get all orders
// @route   GET /api/orders/all-orders
// @access  Private/Admin
router.get('/all-orders', protect, authorize('admin'), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('buyer', 'name shopName phone email')
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;

    let order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const updatedFields = {};
    if (status) updatedFields.status = status;

    order = await Order.findByIdAndUpdate(req.params.id, updatedFields, {
      new: true,
      runValidators: true
    }).populate('buyer', 'name shopName phone email').populate('items.product');

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
