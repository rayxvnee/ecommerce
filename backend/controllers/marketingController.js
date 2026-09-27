const asyncHandler = require('express-async-handler');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');

const subscribeNewsletter = asyncHandler(async (req, res) => {
    const { email, name } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Email is required');
    }

    const subscriber = await NewsletterSubscriber.findOneAndUpdate(
        { email: email.toLowerCase().trim() },
        {
            $set: {
                name: name || '',
                isActive: true,
                source: 'website',
            },
            $addToSet: { tags: 'general' },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, data: subscriber });
});

module.exports = { subscribeNewsletter };
