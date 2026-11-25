const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AddressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' }, // Home, Work, Other
  fullAddress: { type: String, required: true },
  city: { type: String, default: '' },
  pincode: { type: String, default: '' },
  coordinates: {
    type: [Number], // [longitude, latitude]
    default: [77.2090, 28.6139], // Default New Delhi center
  },
  isDefault: { type: Boolean, default: false }
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  },
  phone: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['customer', 'seller', 'admin', 'delivery_partner'],
    default: 'customer',
  },
  isOnline: {
    type: Boolean,
    default: true,
  },
  vehicleType: {
    type: String,
    default: 'Bike',
  },
  vehicleNumber: {
    type: String,
    default: 'DL-01-BB-2026',
  },
  addresses: [AddressSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
