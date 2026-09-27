import React, { useEffect, useState } from 'react';
import { getShops } from '../api';
import ShopCard from '../components/ShopCard';
import { FiFilter } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import './ShopScreen.css';

const CATEGORIES = ['all', 'electronics', 'fashion', 'food', 'beauty', 'sports', 'other'];

const ShopScreen = () => {
    const { t } = useLanguage();
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('all');
    const [total, setTotal] = useState(0);

    const categoryLabel = (c) => {
        const labels = {
            all: t('Tous', 'الكل'),
            electronics: t('Électronique', 'إلكترونيات'),
            fashion: t('Mode', 'موضة'),
            food: t('Alimentation', 'غذاء'),
            beauty: t('Beauté', 'جمال'),
            sports: t('Sport', 'رياضة'),
            other: t('Autre', 'أخرى'),
        };
        return labels[c] || c;
    };

    useEffect(() => {
        setLoading(true);
        const params = category !== 'all' ? { category } : {};
        getShops(params)
            .then(({ data }) => {
                setShops(data.data);
                setTotal(data.total);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [category]);

    return (
        <div className="page-wrapper">
            <div className="container">
                <h1 className="section-title">{t('Boutiques', 'المتاجر')}</h1>
                <p className="section-subtitle">{total} {t('boutiques disponibles', 'متجر متاح')}</p>

                <div className="category-filter">
                    <FiFilter size={16} />
                    {CATEGORIES.map((c) => (
                        <button
                            key={c}
                            className={`cat-btn ${category === c ? 'active' : ''}`}
                            onClick={() => setCategory(c)}
                        >
                            {categoryLabel(c)}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="spinner-overlay"><div className="spinner" /></div>
                ) : shops.length > 0 ? (
                    <div className="grid grid-3">
                        {shops.map((s) => <ShopCard key={s._id} shop={s} />)}
                    </div>
                ) : (
                    <div className="empty-state">{t('Aucune boutique trouvée dans cette catégorie.', 'لا توجد متاجر في هذا التصنيف.')}</div>
                )}
            </div>
        </div>
    );
};

export default ShopScreen;
