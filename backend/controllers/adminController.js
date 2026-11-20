const Shop = require('../models/Shop');
const User = require('../models/User');
const Order = require('../models/Order');
const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalApprovedShops = await Shop.countDocuments({ isApproved: true });
    const totalPendingShops = await Shop.countDocuments({ isApproved: false });
    const totalOrders = await Order.countDocuments();

    // Total GMV (Gross Merchandise Value)
    const salesAggregation = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } },
    ]);
    const totalSales = salesAggregation.length > 0 ? salesAggregation[0].totalSales : 0;

    // Platform estimated commission (10% average)
    const platformRevenue = Math.round(totalSales * 0.1);

    // Recent orders
    const recentOrders = await Order.find()
      .populate('customer', 'name email phone')
      .populate('shop', 'name phone')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalSellers,
        totalApprovedShops,
        totalPendingShops,
        totalOrders,
        totalSales,
        platformRevenue,
      },
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all shops (filter by status)
// @route   GET /api/admin/shops
// @access  Private (Admin only)
exports.getAllShops = async (req, res, next) => {
  try {
    const { status } = req.query;
    let filter = {};
    if (status === 'pending') filter.isApproved = false;
    if (status === 'approved') filter.isApproved = true;

    const shops = await Shop.find(filter)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: shops.length,
      shops,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or update shop status & commission
// @route   PUT /api/admin/shops/:id
// @access  Private (Admin only)
exports.updateShopStatus = async (req, res, next) => {
  try {
    const { isApproved, isOpen, commissionPercent } = req.body;
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    if (typeof isApproved !== 'undefined') shop.isApproved = isApproved;
    if (typeof isOpen !== 'undefined') shop.isOpen = isOpen;
    if (typeof commissionPercent !== 'undefined') shop.commissionPercent = commissionPercent;

    await shop.save();

    res.json({
      success: true,
      shop,
      message: `Shop '${shop.name}' updated successfully. Approved: ${shop.isApproved}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Category Management
// @route   GET /api/admin/categories
// @access  Private (Admin only)
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1, name: 1 });
    res.json({ success: true, count: categories.length, categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Category
// @route   POST /api/admin/categories
// @access  Private (Admin only)
exports.createCategory = async (req, res, next) => {
  try {
    const { name, image, icon, displayOrder } = req.body;
    const category = await Category.create({ name, image, icon, displayOrder });
    res.status(201).json({ success: true, category, message: 'Category created' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Category
// @route   DELETE /api/admin/categories/:id
// @access  Private (Admin only)
exports.deleteCategory = async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get master products
// @route   GET /api/admin/products
// @access  Private (Admin only)
exports.getMasterProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate('category', 'name slug').sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

// @desc    Create master product
// @route   POST /api/admin/products
// @access  Private (Admin only)
exports.createMasterProduct = async (req, res, next) => {
  try {
    const { name, category, description, unit, brand, image, defaultPrice } = req.body;
    const product = await Product.create({
      name,
      category,
      description,
      unit,
      brand,
      image,
      defaultPrice,
      createdBy: req.user.id,
    });
    res.status(201).json({ success: true, product, message: 'Master product created successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders across platform
// @route   GET /api/admin/orders
// @access  Private (Admin only)
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email phone')
      .populate('shop', 'name phone address')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};
