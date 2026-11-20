const mongoose = require('mongoose');

const ShopProductSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  price: {
    type: Number,
    required: [true, 'Please provide selling price'],
  },
  discountPrice: {
    type: Number,
    default: null, // If set, this is the discounted price
  },
  stock: {
    type: Number,
    required: true,
    default: 10,
    min: 0,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// Prevent duplicate entries for the same product in the same shop
ShopProductSchema.index({ shop: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('ShopProduct', ShopProductSchema);
