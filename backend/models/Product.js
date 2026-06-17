const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add product name'],
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Please select a brand'],
    enum: ['Cax & King', '7 GRM', 'CK2']
  },
  type: {
    type: String,
    required: [true, 'Please select product type'],
    enum: ['Jeans', 'Trousers']
  },
  pricePerPiece: {
    type: Number,
    required: [true, 'Please add wholesale price per piece']
  },
  piecesPerBundle: {
    type: Number,
    default: 5,
    required: true
  },
  moq: {
    type: Number,
    default: 50,
    required: [true, 'Please specify Minimum Order Quantity (MOQ)']
  },
  sizes: {
    type: [Number],
    default: [28, 30, 32, 34, 36]
  },
  colors: [
    {
      name: { type: String, required: true },
      hexCode: { type: String, default: '#000000' },
      stock: { type: Number, default: 100 },
      images: { type: [String], default: [] }
    }
  ],
  images: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    trim: true
  },
  inStock: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', ProductSchema);
