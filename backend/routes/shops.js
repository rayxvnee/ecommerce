const express = require('express');
const router = express.Router();
const {
    getShops, getShop, createShop, updateShop, deleteShop,
} = require('../controllers/shopController');
const { protect, authorize } = require('../middleware/auth');

router.route('/').get(getShops).post(protect, authorize('shopAdmin', 'generalAdmin'), createShop);
router.route('/:id').get(getShop).put(protect, updateShop).delete(protect, deleteShop);

module.exports = router;
