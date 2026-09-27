const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Shop name is required'],
            trim: true,
            unique: true,
        },
        description: {
            type: String,
            default: '',
            maxlength: 500,
        },
        logo: {
            type: String,
            default: '',
        },
        category: {
            type: String,
            enum: ['electronics', 'fashion', 'food', 'beauty', 'sports', 'other'],
            default: 'other',
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        numReviews: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Shop', shopSchema);
