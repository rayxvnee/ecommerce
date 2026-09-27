const asyncHandler = require('express-async-handler');
const Shop = require('../models/Shop');

// @desc    Get all shops
// @route   GET /api/shops
// @access  Public
const getShops = asyncHandler(async (req, res) => {
    const { category, page = 1, limit = 12 } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;

    const total = await Shop.countDocuments(filter);
    const shops = await Shop.find(filter)
        .populate('owner', 'name email')
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        data: shops,
    });
});

// @desc    Get single shop
// @route   GET /api/shops/:id
// @access  Public
const getShop = asyncHandler(async (req, res) => {
    const shop = await Shop.findById(req.params.id).populate('owner', 'name email');
    if (!shop) {
        res.status(404);
        throw new Error('Shop not found');
    }
    res.json({ success: true, data: shop });
});

// @desc    Create shop
// @route   POST /api/shops
// @access  Private (shopAdmin, generalAdmin)
const createShop = asyncHandler(async (req, res) => {
    const { name, description, category, logo } = req.body;
    const shop = await Shop.create({
        name,
        description,
        category,
        logo,
        owner: req.user._id,
    });
    res.status(201).json({ success: true, data: shop });
});

// @desc    Update shop
// @route   PUT /api/shops/:id
// @access  Private (owner or generalAdmin)
const updateShop = asyncHandler(async (req, res) => {
    let shop = await Shop.findById(req.params.id);
    if (!shop) {
        res.status(404);
        throw new Error('Shop not found');
    }
    if (
        shop.owner.toString() !== req.user._id.toString() &&
        req.user.role !== 'generalAdmin'
    ) {
        res.status(403);
        throw new Error('Not authorized to update this shop');
    }
    shop = await Shop.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    res.json({ success: true, data: shop });
});

// @desc    Delete shop
// @route   DELETE /api/shops/:id
// @access  Private (owner or generalAdmin)
const deleteShop = asyncHandler(async (req, res) => {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
        res.status(404);
        throw new Error('Shop not found');
    }
    if (
        shop.owner.toString() !== req.user._id.toString() &&
        req.user.role !== 'generalAdmin'
    ) {
        res.status(403);
        throw new Error('Not authorized to delete this shop');
    }
    await shop.deleteOne();
    res.json({ success: true, message: 'Shop deleted' });
});

module.exports = { getShops, getShop, createShop, updateShop, deleteShop };
