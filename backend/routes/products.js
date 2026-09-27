const express = require('express');
const router = express.Router();
const {
    getProducts, getFeaturedProducts, getProduct,
    getRecommendedProducts, createProduct, updateProduct, deleteProduct, addReview,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.get('/featured', getFeaturedProducts);
router.get('/:id/recommendations', getRecommendedProducts);
router.route('/').get(getProducts).post(protect, authorize('shopAdmin', 'generalAdmin'), createProduct);
router.route('/:id').get(getProduct).put(protect, updateProduct).delete(protect, deleteProduct);
router.route('/:id/reviews').post(protect, addReview);

module.exports = router;
