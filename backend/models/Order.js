const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    name: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [orderItemSchema],
        shippingAddress: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true },
        },
        paymentMethod: {
            type: String,
            enum: ['credit_card', 'paypal', 'cash_on_delivery'],
            default: 'cash_on_delivery',
        },
        isPaid: {
            type: Boolean,
            default: false,
        },
        paidAt: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending',
        },
        loyaltyPointsAwarded: {
            type: Boolean,
            default: false,
        },
        loyaltyPointsValue: {
            type: Number,
            default: 0,
        },
        itemsPrice: { type: Number, required: true },
        shippingPrice: { type: Number, default: 0 },
        totalPrice: { type: Number, required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
