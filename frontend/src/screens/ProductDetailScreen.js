import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProduct, addReview, getRecommendedProducts } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FiStar, FiShoppingCart, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';
import './ProductDetailScreen.css';

const PLACEHOLDER = 'https://placehold.co/600x400/1a1a2e/6c63ff?text=Product';

const ProductDetailScreen = () => {
    const { id } = useParams();
    const { addToCart, cartItems } = useCart();
    const { user } = useAuth();
    const { t } = useLanguage();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [activeImg, setActiveImg] = useState(0);
    const [review, setReview] = useState({ rating: 5, comment: '' });
    const [submitting, setSubmitting] = useState(false);
    const [recommended, setRecommended] = useState([]);

    const load = async () => {
        try {
            const [{ data: productData }, { data: recData }] = await Promise.all([
                getProduct(id),
                getRecommendedProducts(id),
            ]);
            setProduct(productData.data);
            setRecommended(recData.data || []);
        } catch {
            toast.error(t('Produit introuvable', 'المنتج غير موجود'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [id]);

    const handleAddToCart = () => {
        const inCart = cartItems.find((item) => item._id === product._id);
        const currentQty = inCart?.quantity || 0;
        if (currentQty + qty > product.stock) {
            return toast.error(t('Quantité demandée supérieure au stock disponible', 'الكمية المطلوبة أكبر من المخزون المتاح'));
        }
        addToCart(product, qty);
        toast.success(`${qty} × ${product.name} ${t('ajouté au panier !', 'تمت إضافته إلى السلة!')}`);
    };

    const handleReview = async (e) => {
        e.preventDefault();
        if (!user) return toast.error(t('Vous devez être connecté pour laisser un avis', 'يجب تسجيل الدخول لإضافة تقييم'));
        setSubmitting(true);
        try {
            await addReview(id, review);
            toast.success(t('Avis envoyé !', 'تم إرسال التقييم!'));
            setReview({ rating: 5, comment: '' });
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || t("Erreur lors de l'envoi de l'avis", 'خطأ أثناء إرسال التقييم'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="spinner-overlay"><div className="spinner" /></div>;
    if (!product) return <div className="page-wrapper container">{t('Produit introuvable.', 'المنتج غير موجود.')}</div>;

    const imgs = product.images?.length > 0 ? product.images : [PLACEHOLDER];

    return (
        <div className="page-wrapper">
            <div className="container">
                <div className="pd-grid">
                    {/* Images */}
                    <div className="pd-images">
                        <div className="pd-main-img">
                            <img src={imgs[activeImg]} alt={product.name} onError={(e) => { e.target.src = PLACEHOLDER; }} />
                        </div>
                        {imgs.length > 1 && (
                            <div className="pd-thumbnails">
                                {imgs.map((img, i) => (
                                    <img
                                        key={i}
                                        src={img}
                                        alt={`thumb-${i}`}
                                        className={activeImg === i ? 'active' : ''}
                                        onClick={() => setActiveImg(i)}
                                        onError={(e) => { e.target.src = PLACEHOLDER; }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="pd-info">
                        <span className="tag">{product.category}</span>
                        <h1 className="pd-name">{product.name}</h1>
                        {product.shop && (
                            <p className="pd-shop">{t('Vendu par', 'يباع بواسطة')} <strong>{product.shop.name}</strong></p>
                        )}

                        {/* Rating */}
                        <div className="pd-rating">
                            {[1, 2, 3, 4, 5].map(s => (
                                <FiStar
                                    key={s}
                                    size={18}
                                    className={s <= Math.round(product.rating) ? 'star filled' : 'star'}
                                />
                            ))}
                            <span className="pd-review-count">({product.numReviews} {t('avis', 'تقييم')})</span>
                        </div>

                        <div className="pd-price">${product.price?.toFixed(2)}</div>
                        <p className="pd-desc">{product.description}</p>

                        {/* Stock */}
                        <div className="pd-stock">
                            <FiPackage size={16} />
                            {product.stock > 0 ? (
                                <span className="in-stock">{product.stock} {t('en stock', 'متوفر')}</span>
                            ) : (
                                <span className="out-stock">{t('Rupture de stock', 'نفدت الكمية')}</span>
                            )}
                        </div>

                        {/* Qty + Cart */}
                        {product.stock > 0 && (
                            <div className="pd-actions">
                                <div className="qty-control">
                                    <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                                    <span>{qty}</span>
                                    <button onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
                                </div>
                                <button className="btn btn-primary pd-cart-btn" onClick={handleAddToCart}>
                                    <FiShoppingCart /> {t('Ajouter au panier', 'أضف إلى السلة')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews */}
                <div className="pd-reviews">
                    <h2 className="section-title" style={{ fontSize: '1.5rem' }}>{t('Avis clients', 'آراء العملاء')}</h2>

                    {product.reviews.length === 0 ? (
                        <p className="no-reviews">{t('Aucun avis pour le moment. Soyez le premier !', 'لا توجد تقييمات بعد. كن أول من يقيّم!')}</p>
                    ) : (
                        <div className="reviews-list">
                            {product.reviews.map((r) => (
                                <div key={r._id} className="review-card card">
                                    <div className="review-header">
                                        <strong>{r.name}</strong>
                                        <div className="stars">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <FiStar key={s} size={12} className={s <= r.rating ? 'star filled' : 'star'} />
                                            ))}
                                        </div>
                                    </div>
                                    {r.verifiedPurchase && (
                                        <span className="verified-badge">{t('Achat vérifié', 'شراء موثّق')}</span>
                                    )}
                                    <p>{r.comment}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add review form */}
                    {user && (
                        <form className="review-form card" onSubmit={handleReview}>
                            <h3>{t('Écrire un avis', 'اكتب تقييمًا')}</h3>
                            <div className="form-group">
                                <label>{t('Note', 'التقييم')}</label>
                                <select
                                    value={review.rating}
                                    onChange={(e) => setReview({ ...review, rating: Number(e.target.value) })}
                                >
                                    {[5, 4, 3, 2, 1].map(v => <option key={v} value={v}>{v} {t('étoiles', 'نجوم')}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>{t('Commentaire', 'التعليق')}</label>
                                <textarea
                                    rows={3}
                                    value={review.comment}
                                    onChange={(e) => setReview({ ...review, comment: e.target.value })}
                                    required
                                />
                            </div>
                            <button className="btn btn-primary" type="submit" disabled={submitting}>
                                {submitting ? t('Envoi...', 'جارٍ الإرسال...') : t("Envoyer l'avis", 'إرسال التقييم')}
                            </button>
                        </form>
                    )}
                </div>

                {recommended.length > 0 && (
                    <section className="pd-recommended">
                        <h2 className="section-title" style={{ fontSize: '1.5rem' }}>
                            {t('Recommandés pour vous', 'مقترحات لك')}
                        </h2>
                        <div className="grid grid-4">
                            {recommended.map((item) => (
                                <ProductCard key={item._id} product={item} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default ProductDetailScreen;
