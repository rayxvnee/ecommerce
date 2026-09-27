const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get all products with search, filter, pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const { keyword, category, shop, minPrice, maxPrice, page = 1, limit = 12 } = req.query;

    const filter = {};
    if (keyword) filter.$text = { $search: keyword };
    if (category) filter.category = category;
    if (shop) filter.shop = shop;
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
        .populate('shop', 'name logo')
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        data: products,
    });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({ isFeatured: true })
        .populate('shop', 'name logo')
        .limit(8);
    res.json({ success: true, data: products });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('shop', 'name logo description');
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }
    res.json({ success: true, data: product });
});

// @desc    Get recommended products for a product
// @route   GET /api/products/:id/recommendations
// @access  Public
const getRecommendedProducts = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    const sameCategory = await Product.find({
        _id: { $ne: product._id },
        category: product.category,
        stock: { $gt: 0 },
    })
        .populate('shop', 'name logo')
        .sort({ isFeatured: -1, rating: -1, numReviews: -1, createdAt: -1 })
        .limit(8);

    if (sameCategory.length >= 8) {
        return res.json({ success: true, data: sameCategory });
    }

    const fallback = await Product.find({
        _id: { $nin: [product._id, ...sameCategory.map((p) => p._id)] },
        stock: { $gt: 0 },
    })
        .populate('shop', 'name logo')
        .sort({ isFeatured: -1, rating: -1, numReviews: -1, createdAt: -1 })
        .limit(8 - sameCategory.length);

    res.json({ success: true, data: [...sameCategory, ...fallback] });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private (shopAdmin, generalAdmin)
const createProduct = asyncHandler(async (req, res) => {
    const product = await Product.create({ ...req.body, shop: req.body.shop || req.user.shop });
    res.status(201).json({ success: true, data: product });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (shop owner or generalAdmin)
const updateProduct = asyncHandler(async (req, res) => {
    let product = await Product.findById(req.params.id).populate('shop');
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }
    const isOwner =
        product.shop.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'generalAdmin') {
        res.status(403);
        throw new Error('Not authorized');
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    res.json({ success: true, data: product });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (shop owner or generalAdmin)
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('shop');
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }
    const isOwner =
        product.shop.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'generalAdmin') {
        res.status(403);
        throw new Error('Not authorized');
    }
    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
});

// @desc    Add review to product
// @route   POST /api/products/:id/reviews
// @access  Private
const addReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
        res.status(400);
        throw new Error('Product already reviewed');
    }

    const purchasedOrder = await Order.findOne({
        user: req.user._id,
        status: { $in: ['delivered', 'shipped', 'processing', 'pending'] },
        'items.product': product._id,
    });

    if (!purchasedOrder) {
        res.status(403);
        throw new Error('Only customers who purchased this product can review it');
    }

    product.reviews.push({
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
        verifiedPurchase: true,
    });
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.numReviews;
    await product.save();

    res.status(201).json({ success: true, message: 'Review added', verifiedPurchase: true });
});

module.exports = {
    getProducts,
    getFeaturedProducts,
    getProduct,
    getRecommendedProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    addReview,
};
