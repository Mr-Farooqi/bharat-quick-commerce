const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  unit: {
    type: String,
    required: true,
    default: '1 pc', // e.g. '500 g', '1 kg', '1 L', '1 pack'
  },
  brand: {
    type: String,
    default: 'Generic',
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
  },
  defaultPrice: {
    type: Number,
    required: true,
    default: 50,
  },
  isMaster: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
