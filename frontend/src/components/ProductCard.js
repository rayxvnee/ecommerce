import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import './ProductCard.css';

const PLACEHOLDER = 'https://placehold.co/400x300/1a1a2e/6c63ff?text=Product';

const StarRating = ({ rating }) => (
  <div className="stars">
    {[1, 2, 3, 4, 5].map((s) => (
      <FiStar
        key={s}
        size={12}
        className={s <= Math.round(rating) ? 'star filled' : 'star'}
      />
    ))}
    <span className="rating-text">{rating?.toFixed(1)}</span>
  </div>
);

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { t } = useLanguage();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
    toast.success(t('Ajouté au panier !', 'تمت الإضافة إلى السلة!'));
  };

  return (
    <Link to={`/products/${product._id}`} className="product-card card">
      <div className="product-img-wrap">
        <img
          src={product.images?.[0] || PLACEHOLDER}
          alt={product.name}
          className="product-img"
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />
        <span className="tag product-category">{product.category}</span>
        {product.isFeatured && <span className="featured-badge">{t('Vedette', 'مميز')}</span>}
      </div>
      <div className="product-info">
        <div className="product-shop">{product.shop?.name}</div>
        <h3 className="product-name">{product.name}</h3>
        <div className="shipping-chip">
          {product.price >= 50
            ? t('🚚 Livraison gratuite', '🚚 توصيل مجاني')
            : t('🚚 Livraison gratuite dès 50$', '🚚 توصيل مجاني ابتداءً من 50$')}
        </div>
        <div className="product-footer">
          <StarRating rating={product.rating} />
          <span className="product-price">${product.price?.toFixed(2)}</span>
        </div>
        <button className="btn btn-primary add-to-cart" onClick={handleAddToCart}>
          <FiShoppingCart size={16} /> {t('Ajouter au panier', 'أضف إلى السلة')}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
