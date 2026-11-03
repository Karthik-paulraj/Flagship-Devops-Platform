const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');
const { validateOrder } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(validateOrder, createOrder)
  .get(admin, getAllOrders);

router.get('/my-orders', getMyOrders);

router.route('/:id').get(getOrderById);

router.route('/:id/status').put(admin, updateOrderStatus);

module.exports = router;
