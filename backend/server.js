const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');

dotenv.config();

const app = express();

// ── Security Middleware ────────────────────────────────────────
app.disable('x-powered-by');

app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader(
        'Referrer-Policy',
        'strict-origin-when-cross-origin'
    );
    next();
});

// ── CORS ───────────────────────────────────────────────────────
const allowedOrigins = [
    'https://ecommerce-zexort4.vercel.app',
    'https://ecommerce-qzyqr7xkw-zexort4.vercel.app',

    // Local development
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
];

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests without Origin
            // (Postman, curl, server-to-server, etc.)
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            console.log(`❌ CORS blocked: ${origin}`);

            return callback(
                new Error(`CORS blocked for origin: ${origin}`)
            );
        },

        credentials: true,

        methods: [
            'GET',
            'POST',
            'PUT',
            'PATCH',
            'DELETE',
            'OPTIONS',
        ],

        allowedHeaders: [
            'Content-Type',
            'Authorization',
        ],
    })
);

// ── Body Parser ────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Logger ─────────────────────────────────────────────────────
// Development only
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ── Database Connection ────────────────────────────────────────
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected');
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/shops', require('./routes/shops'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/marketing', require('./routes/marketing'));

// ── API Health Check ───────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        message: '🛒 E-Commerce API is running',
        status: 'success',
    });
});

// ── Error Handling ─────────────────────────────────────────────
const {
    notFound,
    errorHandler,
} = require('./middleware/errorHandler');

app.use(notFound);
app.use(errorHandler);

// ── Start Server ───────────────────────────────────────────────
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(
        `🚀 Server running in ${process.env.NODE_ENV || 'development'
        } mode on port ${PORT}`
    );
});