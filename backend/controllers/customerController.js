const Shop = require('../models/Shop');
const ShopProduct = require('../models/ShopProduct');
const Category = require('../models/Category');
const Order = require('../models/Order');

// @desc    Get nearby shops for customer
// @route   GET /api/customer/shops
// @access  Public
exports.getNearbyShops = async (req, res, next) => {
  try {
    const { lng, lat, distance = 10 } = req.query;

    let query = { isApproved: true, isOpen: true };

    // If coordinates provided, find shops within distance km
    if (lng && lat && !isNaN(parseFloat(lng)) && !isNaN(parseFloat(lat))) {
      const longitude = parseFloat(lng);
      const latitude = parseFloat(lat);

      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: distance * 1000, // convert km to meters
        },
      };
    }

    let shops = await Shop.find(query).select('-owner');

    // If no geospatial matches, fallback to all approved & open shops for demo convenience
    if (shops.length === 0) {
      shops = await Shop.find({ isApproved: true }).limit(10);
    }

    res.json({ success: true, count: shops.length, shops });
  } catch (error) {
    next(error);
  }
};

// @desc    Get products of a specific shop
// @route   GET /api/customer/shops/:shopId/products
// @access  Public
exports.getShopProducts = async (req, res, next) => {
  try {
    const { shopId } = req.params;
    const { category, search } = req.query;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    let query = { shop: shopId, isAvailable: true };

    const inventoryItems = await ShopProduct.find(query)
      .populate({
        path: 'product',
        populate: { path: 'category', select: 'name slug icon image' },
      });

    // Filter by category or search in memory
    let filtered = inventoryItems.filter(item => item.product !== null);

    if (category) {
      filtered = filtered.filter(item => 
        item.product.category && item.product.category.slug === category
      );
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(item =>
        item.product.name.toLowerCase().includes(q) ||
        (item.product.brand && item.product.brand.toLowerCase().includes(q))
      );
    }

    res.json({
      success: true,
      shop: {
        id: shop._id,
        name: shop.name,
        address: shop.address,
        rating: shop.rating,
        isOpen: shop.isOpen,
        bannerImage: shop.bannerImage,
      },
      count: filtered.length,
      products: filtered,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active categories
// @route   GET /api/customer/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    res.json({ success: true, count: categories.length, categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Place a new order (with live Socket.io notification to seller)
// @route   POST /api/customer/orders
// @access  Private (Customer only)
exports.placeOrder = async (req, res, next) => {
  try {
    const { shopId, items, deliveryAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
    }

    const shop = await Shop.findById(shopId);
    if (!shop || !shop.isApproved) {
      return res.status(400).json({ success: false, message: 'Selected shop is currently not accepting orders' });
    }

    // Verify stock and compute subtotal
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const shopProduct = await ShopProduct.findOne({ shop: shopId, product: item.productId })
        .populate('product');

      if (!shopProduct || !shopProduct.isAvailable || shopProduct.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Item '${shopProduct ? shopProduct.product.name : 'Unknown'}' is out of stock or unavailable`,
        });
      }

      const activePrice = shopProduct.discountPrice || shopProduct.price;
      subtotal += activePrice * item.quantity;

      orderItems.push({
        product: shopProduct.product._id,
        name: shopProduct.product.name,
        price: activePrice,
        quantity: item.quantity,
        unit: shopProduct.product.unit,
        image: shopProduct.product.image,
      });

      // Decrement inventory stock
      shopProduct.stock -= item.quantity;
      if (shopProduct.stock === 0) {
        shopProduct.isAvailable = false;
      }
      await shopProduct.save();
    }

    const deliveryFee = subtotal > 199 ? 0 : 15; // Free delivery above 199
    const totalAmount = subtotal + deliveryFee;

    const order = await Order.create({
      customer: req.user.id,
      shop: shopId,
      items: orderItems,
      subtotal,
      deliveryFee,
      totalAmount,
      deliveryAddress: {
        label: deliveryAddress.label || 'Home',
        fullAddress: deliveryAddress.fullAddress,
        city: deliveryAddress.city || 'Delhi',
        pincode: deliveryAddress.pincode || '110001',
        contactPhone: deliveryAddress.contactPhone || req.user.phone || '',
      },
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentMethod === 'ONLINE' ? 'paid' : 'pending',
      status: 'placed',
      statusHistory: [
        {
          status: 'placed',
          timestamp: new Date(),
          note: 'Order successfully placed by customer',
        }
      ],
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('shop', 'name phone address');

    // Emit live WebSocket alert to the Seller's room!
    const io = req.app.get('io');
    if (io) {
      io.to(`shop_${shopId}`).emit('newOrderPlaced', {
        orderId: populatedOrder._id,
        orderNumber: populatedOrder.orderNumber,
        customerName: populatedOrder.customer.name,
        totalAmount: populatedOrder.totalAmount,
        itemsCount: populatedOrder.items.length,
        items: populatedOrder.items,
        deliveryAddress: populatedOrder.deliveryAddress,
        createdAt: populatedOrder.createdAt,
      });
      console.log(`[Socket.io] Realtime notification sent to room: shop_${shopId} for order ${populatedOrder.orderNumber}`);
    }

    res.status(201).json({
      success: true,
      order: populatedOrder,
      message: 'Order placed successfully! Expected delivery in 12-15 minutes.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in customer's order history
// @route   GET /api/customer/orders
// @access  Private (Customer only)
exports.getCustomerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate('shop', 'name phone address bannerImage')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order tracking info
// @route   GET /api/customer/orders/:id
// @access  Private (Customer or Owner/Admin)
exports.getOrderDetails = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('shop', 'name phone address bannerImage rating')
      .populate('customer', 'name email phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify ownership
    if (order.customer._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};
