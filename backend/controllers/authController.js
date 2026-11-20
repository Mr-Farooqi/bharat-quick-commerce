const User = require('../models/User');
const Shop = require('../models/Shop');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user (Customer or Seller)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, shopName, shopAddress, shopPhone } = req.body;

    // Validate email uniqueness
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Restrict direct admin creation via public register endpoint
    const userRole = (role === 'admin') ? 'customer' : (role || 'customer');

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: userRole,
    });

    // If registering as a seller, create initial pending shop profile
    let shop = null;
    if (userRole === 'seller' && shopName) {
      shop = await Shop.create({
        name: shopName,
        owner: user._id,
        phone: shopPhone || phone || '0000000000',
        address: shopAddress || {
          street: 'Market Complex, Main Road',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
        },
        isApproved: false, // Must be approved by Super Admin
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      shop: shop ? { id: shop._id, name: shop.name, isApproved: shop.isApproved } : null,
      message: userRole === 'seller'
        ? 'Seller account created! Your shop profile is submitted for Admin approval.'
        : 'Account created successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password, requestedRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check user exists with password included
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Role verification (if user logs into Admin portal, verify role is admin)
    if (requestedRole && user.role !== requestedRole) {
      return res.status(403).json({
        success: false,
        message: `Unauthorized portal access. You are registered as '${user.role}', not '${requestedRole}'.`,
      });
    }

    let shop = null;
    if (user.role === 'seller') {
      shop = await Shop.findOne({ owner: user._id });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
      },
      shop: shop ? {
        id: shop._id,
        name: shop.name,
        isApproved: shop.isApproved,
        isOpen: shop.isOpen,
      } : null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let shop = null;
    if (user.role === 'seller') {
      shop = await Shop.findOne({ owner: user._id });
    }

    res.json({
      success: true,
      user,
      shop,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user addresses
// @route   POST /api/auth/addresses
// @access  Private
exports.addAddress = async (req, res, next) => {
  try {
    const { label, fullAddress, city, pincode, coordinates, isDefault } = req.body;
    const user = await User.findById(req.user.id);

    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push({
      label: label || 'Home',
      fullAddress,
      city,
      pincode,
      coordinates: coordinates || [77.2090, 28.6139],
      isDefault: isDefault || user.addresses.length === 0,
    });

    await user.save();

    res.json({
      success: true,
      addresses: user.addresses,
      message: 'Address added successfully',
    });
  } catch (error) {
    next(error);
  }
};
