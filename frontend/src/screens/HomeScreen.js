import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedProducts, getShops } from '../api';
import ProductCard from '../components/ProductCard';
import ShopCard from '../components/ShopCard';
import { FiArrowRight, FiShoppingBag, FiStar, FiTruck } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import './HomeScreen.css';

const HomeScreen = () => {
    const { t } = useLanguage();
    const [products, setProducts] = useState([]);
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [pRes, sRes] = await Promise.all([
                    getFeaturedProducts(),
                    getShops({ limit: 6 }),
                ]);
                setProducts(pRes.data.data);
                setShops(sRes.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className="home">
            {/* Hero */}
            <section className="hero">
                <div className="hero-bg" />
                <div className="container hero-content fade-in-up">
                    <span className="hero-badge">{t('🛍️ Nouvelles arrivées de la saison', '🛍️ وصولات الموسم الجديدة')}</span>
                    <h1 className="hero-title">
                        {t('Achetez le ', 'تسوّق ')}<span className="gradient-text">{t('futur', 'المستقبل')}</span>{t(' du', ' لـ')}<br />
                        {t('e-commerce', 'التجارة الإلكترونية')}
                    </h1>
                    <p className="hero-sub">
                        {t('Découvrez des milliers de produits de boutiques sélectionnées.', 'اكتشف آلاف المنتجات من متاجر مختارة.')}<br />
                        {t('Livraison rapide, meilleurs prix, variété inégalée.', 'توصيل سريع، أفضل الأسعار، وتنوع لا مثيل له.')}
                    </p>
                    <div className="hero-btns">
                        <Link to="/products" className="btn btn-primary">
                            {t('Explorer les produits', 'استكشاف المنتجات')} <FiArrowRight />
                        </Link>
                        <Link to="/shops" className="btn btn-secondary">
                            {t('Voir les boutiques', 'تصفح المتاجر')}
                        </Link>
                    </div>
                </div>

                {/* Floating stats */}
                <div className="hero-stats container">
                    <div className="stat-card">
                        <FiShoppingBag size={24} className="stat-icon" />
                        <div>
                            <div className="stat-num">10K+</div>
                            <div className="stat-label">{t('Produits', 'منتجات')}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <FiStar size={24} className="stat-icon" />
                        <div>
                            <div className="stat-num">4.8★</div>
                            <div className="stat-label">{t('Note moyenne', 'متوسط التقييم')}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <FiTruck size={24} className="stat-icon" />
                        <div>
                            <div className="stat-num">Free</div>
                            <div className="stat-label">{t('Livraison', 'التوصيل')}</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title">{t('Produits vedettes', 'المنتجات المميزة')}</h2>
                    <p className="section-subtitle">{t('Sélectionnés par notre équipe', 'مختارة من فريقنا')}</p>
                    {loading ? (
                        <div className="spinner-overlay"><div className="spinner" /></div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-4">
                            {products.map((p) => <ProductCard key={p._id} product={p} />)}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>{t('Aucun produit vedette pour le moment. Ajoutez-en depuis le panneau admin !', 'لا توجد منتجات مميزة حاليًا. أضف بعضها من لوحة الإدارة!')}</p>
                        </div>
                    )}
                    <div className="section-cta">
                        <Link to="/products" className="btn btn-secondary">
                            {t('Voir tous les produits', 'عرض كل المنتجات')} <FiArrowRight />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Shops */}
            <section className="section shops-section">
                <div className="container">
                    <h2 className="section-title">{t('Meilleures boutiques', 'أفضل المتاجر')}</h2>
                    <p className="section-subtitle">{t('Vendeurs de confiance sur notre plateforme', 'بائعون موثوقون على منصتنا')}</p>
                    {!loading && (
                        shops.length > 0 ? (
                            <div className="grid grid-3">
                                {shops.slice(0, 6).map((s) => <ShopCard key={s._id} shop={s} />)}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>{t('Aucune boutique pour le moment. Créez-en une depuis le tableau de bord boutique !', 'لا توجد متاجر حاليًا. أنشئ متجرًا من لوحة تحكم المتجر!')}</p>
                            </div>
                        )
                    )}
                    <div className="section-cta">
                        <Link to="/shops" className="btn btn-secondary">
                            {t('Voir toutes les boutiques', 'عرض كل المتاجر')} <FiArrowRight />
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="cta-banner">
                <div className="container cta-inner">
                    <h2>{t('Prêt à vendre ?', 'جاهز للبيع؟')}</h2>
                    <p>{t('Rejoignez des centaines de vendeurs et atteignez des milliers de clients.', 'انضم إلى مئات أصحاب المتاجر ووصل إلى آلاف العملاء.')}</p>
                    <Link to="/register" className="btn btn-primary">
                        {t('Commencer à vendre', 'ابدأ البيع الآن')} <FiArrowRight />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default HomeScreen;
