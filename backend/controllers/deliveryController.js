const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Get all available orders ready for delivery partner pickup
// @route   GET /api/delivery/available
// @access  Private (Delivery Partner only)
exports.getAvailableOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      deliveryMode: 'delivery_partner',
      deliveryPartner: null,
      status: { $in: ['placed', 'confirmed', 'packing', 'ready_for_pickup'] },
    })
      .populate('shop', 'name phone address location bannerImage')
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept a delivery request (Atomic assignment)
// @route   POST /api/delivery/orders/:id/accept
// @access  Private (Delivery Partner only)
exports.acceptOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const riderId = req.user.id;

    // Check if rider already has an active ongoing delivery
    const existingActive = await Order.findOne({
      deliveryPartner: riderId,
      status: { $in: ['confirmed', 'packing', 'ready_for_pickup', 'out_for_delivery'] },
    });

    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active ongoing delivery! Complete it first before accepting another.',
      });
    }

    // Atomically find & assign to prevent race condition between multiple riders
    const order = await Order.findOneAndUpdate(
      {
        _id: orderId,
        deliveryPartner: null,
        deliveryMode: 'delivery_partner',
        status: { $ne: 'cancelled' },
      },
      {
        deliveryPartner: riderId,
        $push: {
          statusHistory: {
            status: 'confirmed',
            timestamp: new Date(),
            note: `Delivery partner ${req.user.name} accepted the order for pickup.`,
          },
        },
      },
      { new: true }
    )
      .populate('shop', 'name phone address location')
      .populate('customer', 'name phone email');

    if (!order) {
      return res.status(400).json({
        success: false,
        message: 'This delivery request has already been accepted by another partner or is no longer available.',
      });
    }

    // Realtime broadcast via Socket.io
    const io = req.app.get('io');
    if (io) {
      // Notify other riders to remove from their available list
      io.to('delivery_partners').emit('deliveryOrderClaimed', { orderId: order._id });

      // Notify seller
      io.to(`shop_${order.shop._id}`).emit('deliveryPartnerAssigned', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        deliveryPartner: {
          id: req.user._id,
          name: req.user.name,
          phone: req.user.phone,
          vehicleType: req.user.vehicleType || 'Bike',
          vehicleNumber: req.user.vehicleNumber || 'DL-01-BB-2026',
        },
      });

      // Notify customer in tracking room
      io.to(`order_${order._id}`).emit('orderStatusUpdated', {
        orderId: order._id,
        status: order.status,
        deliveryPartner: {
          name: req.user.name,
          phone: req.user.phone,
        },
      });
    }

    res.json({
      success: true,
      order,
      message: 'Order accepted! Please navigate to the seller store to pick up items.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm store pickup (rider received package from seller)
// @route   PUT /api/delivery/orders/:id/pickup
// @access  Private (Delivery Partner only)
exports.pickupOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      deliveryPartner: req.user.id,
    })
      .populate('shop', 'name phone address')
      .populate('customer', 'name phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or not assigned to you' });
    }

    order.status = 'out_for_delivery';
    order.pickedUpAt = new Date();
    order.statusHistory.push({
      status: 'out_for_delivery',
      timestamp: new Date(),
      note: `Package picked up from store by rider ${req.user.name}. On the way to customer!`,
    });

    await order.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`order_${order._id}`).emit('orderStatusUpdated', {
        orderId: order._id,
        status: 'out_for_delivery',
        note: 'Order is out for delivery with rider!',
      });
      io.to(`shop_${order.shop._id}`).emit('orderStatusUpdated', {
        orderId: order._id,
        status: 'out_for_delivery',
      });
      io.to(`customer_${order.customer._id}`).emit('customerOrderNotification', {
        orderId: order._id,
        status: 'out_for_delivery',
        message: 'Your BharatBasket order is out for delivery! Rider is on the way.',
      });
    }

    res.json({
      success: true,
      order,
      message: 'Store pickup confirmed! Now delivering to customer.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm delivery to customer doorstep
// @route   PUT /api/delivery/orders/:id/deliver
// @access  Private (Delivery Partner only)
exports.deliverOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      deliveryPartner: req.user.id,
    })
      .populate('shop', 'name phone address')
      .populate('customer', 'name phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or not assigned to you' });
    }

    order.status = 'delivered';
    order.paymentStatus = 'paid';
    order.deliveredAt = new Date();
    order.statusHistory.push({
      status: 'delivered',
      timestamp: new Date(),
      note: `Order safely delivered to customer by rider ${req.user.name}.`,
    });

    await order.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`order_${order._id}`).emit('orderStatusUpdated', {
        orderId: order._id,
        status: 'delivered',
        note: 'Order delivered successfully! Thank you for ordering with BharatBasket.',
      });
      io.to(`shop_${order.shop._id}`).emit('orderStatusUpdated', {
        orderId: order._id,
        status: 'delivered',
      });
      io.to(`customer_${order.customer._id}`).emit('customerOrderNotification', {
        orderId: order._id,
        status: 'delivered',
        message: 'Order delivered! Enjoy your fresh groceries from BharatBasket.',
      });
    }

    res.json({
      success: true,
      order,
      payoutEarned: order.deliveryPartnerPayout || 45,
      message: `Delivery completed successfully! ₹${order.deliveryPartnerPayout || 45} added to your earnings.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently active delivery for the rider
// @route   GET /api/delivery/active
// @access  Private (Delivery Partner only)
exports.getActiveDelivery = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      deliveryPartner: req.user.id,
      status: { $in: ['placed', 'confirmed', 'packing', 'ready_for_pickup', 'out_for_delivery'] },
    })
      .populate('shop', 'name phone address location bannerImage')
      .populate('customer', 'name phone email');

    res.json({
      success: true,
      order: order || null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get delivery history and earnings summary
// @route   GET /api/delivery/history
// @access  Private (Delivery Partner only)
exports.getDeliveryHistory = async (req, res, next) => {
  try {
    const orders = await Order.find({
      deliveryPartner: req.user.id,
      status: 'delivered',
    })
      .populate('shop', 'name address')
      .populate('customer', 'name phone')
      .sort({ deliveredAt: -1, createdAt: -1 });

    const totalEarnings = orders.reduce((acc, curr) => acc + (curr.deliveryPartnerPayout || 45), 0);

    // Calculate today's earnings
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter(o => new Date(o.deliveredAt || o.updatedAt) >= today);
    const todayEarnings = todayOrders.reduce((acc, curr) => acc + (curr.deliveryPartnerPayout || 45), 0);

    res.json({
      success: true,
      totalDeliveries: orders.length,
      totalEarnings,
      todayDeliveries: todayOrders.length,
      todayEarnings,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle online/offline duty status
// @route   PUT /api/delivery/duty
// @access  Private (Delivery Partner only)
exports.toggleDuty = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { isOnline } = req.body;
    user.isOnline = typeof isOnline !== 'undefined' ? isOnline : !user.isOnline;
    await user.save();

    res.json({
      success: true,
      isOnline: user.isOnline,
      message: user.isOnline
        ? 'You are now ONLINE. Ready to receive delivery orders!'
        : 'You are now OFFLINE. Deliveries paused.',
    });
  } catch (error) {
    next(error);
  }
};
