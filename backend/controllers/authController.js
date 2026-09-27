const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const { sendWelcomeEmail } = require('../services/emailService');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Only allow client or shopAdmin self-registration; generalAdmin must be seeded
    const allowedRoles = ['client', 'shopAdmin'];
    const assignedRole = allowedRoles.includes(role) ? role : 'client';

    const user = await User.create({ name, email, password, role: assignedRole });

    await NewsletterSubscriber.findOneAndUpdate(
        { email: email.toLowerCase().trim() },
        {
            $set: { name, isActive: true, source: 'register' },
            $addToSet: { tags: assignedRole === 'shopAdmin' ? 'merchant' : 'customer' },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    sendWelcomeEmail({ name: user.name, email: user.email }).catch((err) => {
        console.error('Welcome email failed:', err.message);
    });

    res.status(201).json({
        success: true,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        },
    });
});

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    res.json({
        success: true,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            shop: user.shop,
            token: generateToken(user._id),
        },
    });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('shop');
    res.json({ success: true, data: user });
});

module.exports = { register, login, getMe };
