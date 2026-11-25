const express = require('express');
const router = express.Router();
const {
  getAvailableOrders,
  acceptOrder,
  pickupOrder,
  deliverOrder,
  getActiveDelivery,
  getDeliveryHistory,
  toggleDuty,
} = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All delivery routes strictly require delivery_partner role
router.use(protect);
router.use(authorize('delivery_partner'));

router.get('/available', getAvailableOrders);
router.get('/active', getActiveDelivery);
router.get('/history', getDeliveryHistory);
router.put('/duty', toggleDuty);

router.post('/orders/:id/accept', acceptOrder);
router.put('/orders/:id/pickup', pickupOrder);
router.put('/orders/:id/deliver', deliverOrder);

module.exports = router;
