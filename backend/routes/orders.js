const express = require('express');
const router = express.Router();
const {
    createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.route('/').post(protect, createOrder).get(protect, authorize('generalAdmin'), getAllOrders);
router.get('/mine', protect, getMyOrders);
router.route('/:id').get(protect, getOrder);
router.route('/:id/status').put(protect, authorize('generalAdmin'), updateOrderStatus);

module.exports = router;
