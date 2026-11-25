const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, default: '1 pc' },
  image: { type: String, default: '' },
});

const OrderStatusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'packing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    default: '',
  }
});

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true,
  },
  items: [OrderItemSchema],
  subtotal: {
    type: Number,
    required: true,
  },
  deliveryFee: {
    type: Number,
    default: 15, // Nominal quick-commerce delivery fee
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  deliveryAddress: {
    label: { type: String, default: 'Home' },
    fullAddress: { type: String, required: true },
    city: { type: String, default: '' },
    pincode: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
  },
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'packing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'placed',
  },
  deliveryMode: {
    type: String,
    enum: ['self', 'delivery_partner'],
    default: 'delivery_partner',
  },
  deliveryPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  deliveryPartnerPayout: {
    type: Number,
    default: 45, // Rs. 45 trip payout for delivery partner
  },
  pickedUpAt: {
    type: Date,
  },
  deliveredAt: {
    type: Date,
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'ONLINE'],
    default: 'COD',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  statusHistory: [OrderStatusHistorySchema],
}, { timestamps: true });

// Auto generate orderNumber
OrderSchema.pre('validate', function (next) {
  if (!this.orderNumber) {
    const random = Math.floor(100000 + Math.random() * 900000);
    this.orderNumber = `BHT-${random}`;
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
