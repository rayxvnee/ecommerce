import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import './ShopCard.css';

const PLACEHOLDER = 'https://placehold.co/400x200/16213e/6c63ff?text=Shop';

const ShopCard = ({ shop }) => {
  const { t } = useLanguage();

  return (
    <Link to={`/products?shop=${shop._id}`} className="shop-card card">
      <div className="shop-img-wrap">
        <img
          src={shop.logo || PLACEHOLDER}
          alt={shop.name}
          className="shop-img"
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />
        <span className="tag shop-category">{shop.category}</span>
      </div>
      <div className="shop-info">
        <h3 className="shop-name">{shop.name}</h3>
        <p className="shop-desc">{shop.description || t('Aucune description disponible.', 'لا يوجد وصف متاح.')}</p>
        <div className="shop-meta">
          <div className="shop-rating">
            <FiStar size={14} className="star filled" />
            <span>{shop.rating?.toFixed(1) || '0.0'}</span>
          </div>
          <span className="shop-owner">{t('par', 'بواسطة')} {shop.owner?.name}</span>
        </div>
      </div>
    </Link>
  );
};

export default ShopCard;
