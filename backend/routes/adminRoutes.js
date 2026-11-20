const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllShops,
  updateShopStatus,
  getCategories,
  createCategory,
  deleteCategory,
  getMasterProducts,
  createMasterProduct,
  getAllOrders,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Strictly require Admin Role for all routes in this file
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/shops', getAllShops);
router.put('/shops/:id', updateShopStatus);

router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);

router.get('/products', getMasterProducts);
router.post('/products', createMasterProduct);

router.get('/orders', getAllOrders);

module.exports = router;
