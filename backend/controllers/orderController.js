const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendOrderEmail } = require('../services/emailService');

const tierForPoints = (points) => {
    if (points >= 5000) return 'Platinum';
    if (points >= 2000) return 'Gold';
    if (points >= 800) return 'Silver';
    return 'Bronze';
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const { items, shippingAddress, paymentMethod, itemsPrice, shippingPrice, totalPrice } = req.body;

    if (!items || items.length === 0) {
        res.status(400);
        throw new Error('No order items');
    }

    const preparedItems = [];
    for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
            res.status(404);
            throw new Error(`Product not found: ${item.product}`);
        }
        if (item.quantity > product.stock) {
            res.status(400);
            throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
        }

        preparedItems.push({
            product: product._id,
            name: item.name || product.name,
            image: item.image || product.images?.[0] || '',
            price: Number.isFinite(item.price) ? item.price : product.price,
            quantity: item.quantity,
        });
    }

    for (const item of preparedItems) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    const order = await Order.create({
        user: req.user._id,
        items: preparedItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        totalPrice,
    });

    const user = await User.findById(req.user._id);
    if (user) {
        sendOrderEmail({
            email: user.email,
            name: user.name,
            orderId: order._id,
            totalPrice: order.totalPrice,
        }).catch((err) => {
            console.error('Order email failed:', err.message);
        });
    }

    res.status(201).json({ success: true, data: order });
});

// @desc    Get logged in user orders
// @route   GET /api/orders/mine
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }
    if (
        order.user._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'generalAdmin'
    ) {
        res.status(403);
        throw new Error('Not authorized');
    }
    res.json({ success: true, data: order });
});

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private (generalAdmin)
const getAllOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status } = req.query;
    const filter = status ? { status } : {};
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
        .populate('user', 'name email')
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), data: orders });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (generalAdmin)
const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    const nextStatus = req.body.status;

    if (order.status !== 'cancelled' && nextStatus === 'cancelled') {
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        }
    }

    if (order.status === 'cancelled' && nextStatus !== 'cancelled') {
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (!product) {
                res.status(404);
                throw new Error(`Product not found: ${item.product}`);
            }
            if (item.quantity > product.stock) {
                res.status(400);
                throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
            }
        }
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
        }
    }

    const wasDelivered = order.status === 'delivered';
    const willBeDelivered = nextStatus === 'delivered';

    if (!wasDelivered && willBeDelivered && !order.loyaltyPointsAwarded) {
        const pointsToAward = Math.max(1, Math.floor(order.totalPrice));
        const user = await User.findById(order.user);
        if (user) {
            user.loyaltyPoints += pointsToAward;
            user.loyaltyTier = tierForPoints(user.loyaltyPoints);
            await user.save();
        }
        order.loyaltyPointsAwarded = true;
        order.loyaltyPointsValue = pointsToAward;
    }

    if (wasDelivered && nextStatus === 'cancelled' && order.loyaltyPointsAwarded) {
        const user = await User.findById(order.user);
        if (user) {
            user.loyaltyPoints = Math.max(0, user.loyaltyPoints - (order.loyaltyPointsValue || 0));
            user.loyaltyTier = tierForPoints(user.loyaltyPoints);
            await user.save();
        }
        order.loyaltyPointsAwarded = false;
        order.loyaltyPointsValue = 0;
    }

    order.status = req.body.status;
    if (req.body.status === 'delivered') {
        order.isPaid = true;
        order.paidAt = Date.now();
    }
    await order.save();
    res.json({ success: true, data: order });
});

module.exports = { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus };
