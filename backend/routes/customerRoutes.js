const express = require('express');
const router = express.Router();
const {
  getNearbyShops,
  getShopProducts,
  getCategories,
  placeOrder,
  getCustomerOrders,
  getOrderDetails,
} = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public endpoints
router.get('/shops', getNearbyShops);
router.get('/shops/:shopId/products', getShopProducts);
router.get('/categories', getCategories);

// Protected customer endpoints
router.post('/orders', protect, authorize('customer'), placeOrder);
router.get('/orders', protect, authorize('customer'), getCustomerOrders);
router.get('/orders/:id', protect, getOrderDetails);

module.exports = router;
