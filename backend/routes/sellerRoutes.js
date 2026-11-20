const express = require('express');
const router = express.Router();
const {
  getMyShop,
  updateMyShop,
  getInventory,
  addToInventory,
  updateInventoryItem,
  getSellerOrders,
  updateOrderStatus,
  getSellerStats,
} = require('../controllers/sellerController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Strictly require Seller Role for all routes in this file
router.use(protect);
router.use(authorize('seller'));

router.get('/shop', getMyShop);
router.put('/shop', updateMyShop);

router.get('/stats', getSellerStats);

router.get('/inventory', getInventory);
router.post('/inventory', addToInventory);
router.put('/inventory/:id', updateInventoryItem);

router.get('/orders', getSellerOrders);
router.put('/orders/:id/status', updateOrderStatus);

module.exports = router;
