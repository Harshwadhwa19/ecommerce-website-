const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      productName: {
        type: String,
        required: true
      },
      color: {
        type: String,
        required: true
      },
      bundleQty: {
        type: Number,
        required: true
      },
      piecesPerBundle: {
        type: Number,
        default: 5,
        required: true
      },
      pricePerPiece: {
        type: Number,
        required: true
      },
      totalPrice: {
        type: Number,
        required: true
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryAddress: {
    type: String
  },
  storeName: {
    type: String,
    required: [true, 'Please add store name']
  },
  buyerName: {
    type: String,
    required: [true, 'Please add buyer name']
  },
  phone: {
    type: String,
    required: [true, 'Please add mobile number']
  },
  shippingAddress: {
    type: String,
    required: [true, 'Please add shipping address']
  },
  city: {
    type: String,
    required: [true, 'Please add city']
  },
  state: {
    type: String,
    required: [true, 'Please add state']
  },
  pincode: {
    type: String,
    required: [true, 'Please add pincode']
  },
  gstNumber: {
    type: String
  },
  paymentScreenshot: {
    type: String,
    required: [true, 'Please upload UPI/Bank payment screenshot']
  },
  status: {
    type: String,
    enum: ['Pending Verification', 'Payment Verified', 'Dispatched', 'Delivered', 'Rejected'],
    default: 'Pending Verification'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);
