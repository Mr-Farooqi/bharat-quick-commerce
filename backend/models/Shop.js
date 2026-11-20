const mongoose = require('mongoose');

const ShopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide shop name'],
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    trim: true,
    default: 'Local grocery and essentials shop',
  },
  phone: {
    type: String,
    required: [true, 'Please provide shop contact number'],
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: 'Delhi' },
    pincode: { type: String, required: true },
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      default: [77.2090, 28.6139], // Default New Delhi center
    },
  },
  deliveryRadiusKm: {
    type: Number,
    default: 8, // Delivery range in km
  },
  isApproved: {
    type: Boolean,
    default: false, // Must be approved by Super Admin
  },
  isOpen: {
    type: Boolean,
    default: true,
  },
  commissionPercent: {
    type: Number,
    default: 10, // Platform commission
  },
  bannerImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
  },
  rating: {
    type: Number,
    default: 4.8,
  },
}, { timestamps: true });

// Geospatial index for radius searching
ShopSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Shop', ShopSchema);
