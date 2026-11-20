const Shop = require('../models/Shop');
const ShopProduct = require('../models/ShopProduct');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Helper to get or verify seller's shop
const getSellerShop = async (userId) => {
  const shop = await Shop.findOne({ owner: userId });
  return shop;
};

// @desc    Get Seller's Shop Details
// @route   GET /api/seller/shop
// @access  Private (Seller only)
exports.getMyShop = async (req, res, next) => {
  try {
    const shop = await getSellerShop(req.user.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'No shop associated with this seller account.' });
    }
    res.json({ success: true, shop });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Seller's Shop Details
// @route   PUT /api/seller/shop
// @access  Private (Seller only)
exports.updateMyShop = async (req, res, next) => {
  try {
    let shop = await getSellerShop(req.user.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const { name, phone, description, isOpen, deliveryRadiusKm, bannerImage, address, coordinates } = req.body;

    if (name) shop.name = name;
    if (phone) shop.phone = phone;
    if (description) shop.description = description;
    if (typeof isOpen !== 'undefined') shop.isOpen = isOpen;
    if (deliveryRadiusKm) shop.deliveryRadiusKm = deliveryRadiusKm;
    if (bannerImage) shop.bannerImage = bannerImage;
    if (address) shop.address = address;
    if (coordinates && Array.isArray(coordinates)) {
      shop.location = {
        type: 'Point',
        coordinates: coordinates,
      };
    }

    await shop.save();

    res.json({ success: true, shop, message: 'Shop details updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Shop Inventory
// @route   GET /api/seller/inventory
// @access  Private (Seller only)
exports.getInventory = async (req, res, next) => {
  try {
    const shop = await getSellerShop(req.user.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const inventory = await ShopProduct.find({ shop: shop._id })
      .populate({
        path: 'product',
        populate: { path: 'category', select: 'name slug' },
      })
      .sort({ updatedAt: -1 });

    // Also get all available master products not yet in this shop
    const stockedProductIds = inventory.map(item => item.product ? item.product._id : null).filter(Boolean);
    const availableMasterProducts = await Product.find({ _id: { $nin: stockedProductIds } })
      .populate('category', 'name slug');

    res.json({
      success: true,
      count: inventory.length,
      inventory,
      availableMasterProducts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to shop inventory
// @route   POST /api/seller/inventory
// @access  Private (Seller only)
exports.addToInventory = async (req, res, next) => {
  try {
    const shop = await getSellerShop(req.user.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const { productId, price, discountPrice, stock, isAvailable } = req.body;

    const existing = await ShopProduct.findOne({ shop: shop._id, product: productId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Product already in your inventory' });
    }

    const shopProduct = await ShopProduct.create({
      shop: shop._id,
      product: productId,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      stock: Number(stock) || 10,
      isAvailable: typeof isAvailable !== 'undefined' ? isAvailable : true,
    });

    const populated = await ShopProduct.findById(shopProduct._id)
      .populate({
        path: 'product',
        populate: { path: 'category', select: 'name slug' },
      });

    res.status(201).json({ success: true, item: populated, message: 'Product added to your inventory' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update inventory item (price, stock, availability toggle)
// @route   PUT /api/seller/inventory/:id
// @access  Private (Seller only)
exports.updateInventoryItem = async (req, res, next) => {
  try {
    const shop = await getSellerShop(req.user.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const item = await ShopProduct.findOne({ _id: req.params.id, shop: shop._id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    const { price, discountPrice, stock, isAvailable } = req.body;

    if (typeof price !== 'undefined') item.price = Number(price);
    if (typeof discountPrice !== 'undefined') item.discountPrice = discountPrice ? Number(discountPrice) : null;
    if (typeof stock !== 'undefined') item.stock = Number(stock);
    if (typeof isAvailable !== 'undefined') item.isAvailable = isAvailable;

    await item.save();

    const populated = await ShopProduct.findById(item._id)
      .populate({
        path: 'product',
        populate: { path: 'category', select: 'name slug' },
      });

    res.json({ success: true, item: populated, message: 'Inventory updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Seller's Orders
// @route   GET /api/seller/orders
// @access  Private (Seller only)
exports.getSellerOrders = async (req, res, next) => {
  try {
    const shop = await getSellerShop(req.user.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const { status } = req.query;
    let query = { shop: shop._id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/seller/orders/:id/status
// @access  Private (Seller only)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const shop = await getSellerShop(req.user.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const { status, note } = req.body;
    const order = await Order.findOne({ _id: req.params.id, shop: shop._id })
      .populate('customer', 'name email phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order marked as ${status} by shop`,
    });

    if (status === 'delivered') {
      order.paymentStatus = 'paid';
    }

    await order.save();

    // Broadcast realtime update to customer room via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`order_${order._id}`).emit('orderStatusUpdated', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        updatedAt: order.updatedAt,
      });
      io.to(`customer_${order.customer._id}`).emit('customerOrderNotification', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
      });
    }

    res.json({ success: true, order, message: `Order status updated to '${status}'` });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Seller Dashboard Analytics
// @route   GET /api/seller/stats
// @access  Private (Seller only)
exports.getSellerStats = async (req, res, next) => {
  try {
    const shop = await getSellerShop(req.user.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const totalOrders = await Order.countDocuments({ shop: shop._id });
    const pendingOrders = await Order.countDocuments({ shop: shop._id, status: { $in: ['placed', 'confirmed', 'packing'] } });
    
    // Revenue aggregate
    const revenueAgg = await Order.aggregate([
      { $match: { shop: shop._id, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$subtotal' } } },
    ]);
    const grossRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;
    const commissionDeduction = Math.round(grossRevenue * ((shop.commissionPercent || 10) / 100));
    const netPayout = grossRevenue - commissionDeduction;

    const totalProducts = await ShopProduct.countDocuments({ shop: shop._id });
    const outOfStock = await ShopProduct.countDocuments({ shop: shop._id, $or: [{ stock: 0 }, { isAvailable: false }] });

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        grossRevenue,
        commissionDeduction,
        netPayout,
        totalProducts,
        outOfStock,
        isOpen: shop.isOpen,
        isApproved: shop.isApproved,
      }
    });
  } catch (error) {
    next(error);
  }
};
