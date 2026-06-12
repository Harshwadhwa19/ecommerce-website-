const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all registered buyers
// @route   GET /api/buyers
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const buyers = await User.find({ role: 'buyer' }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: buyers.length,
      data: buyers
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
