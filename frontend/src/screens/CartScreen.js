import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../api';
import { FiTrash2, FiShoppingBag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import './CartScreen.css';

const CartScreen = () => {
    const { cartItems, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleCheckout = async () => {
        if (!user) {
            toast.error(t('Veuillez vous connecter pour valider la commande', 'يرجى تسجيل الدخول لإتمام الطلب'));
            return navigate('/login');
        }
        if (cartItems.length === 0) return toast.error(t('Le panier est vide', 'السلة فارغة'));

        try {
            const orderPayload = {
                items: cartItems.map((i) => ({
                    product: i._id,
                    name: i.name,
                    image: i.images?.[0] || '',
                    price: i.price,
                    quantity: i.quantity,
                })),
                shippingAddress: { address: '123 Main St', city: 'Algiers', postalCode: '16000', country: 'Algeria' },
                paymentMethod: 'cash_on_delivery',
                itemsPrice: totalPrice,
                shippingPrice: totalPrice > 50 ? 0 : 5,
                totalPrice: totalPrice > 50 ? totalPrice : totalPrice + 5,
            };
            await createOrder(orderPayload);
            clearCart();
            toast.success(t('Commande passée avec succès ! 🎉', 'تم تأكيد الطلب بنجاح! 🎉'));
            navigate('/orders');
        } catch (err) {
            toast.error(err.response?.data?.message || t('Échec de la commande', 'فشل إنشاء الطلب'));
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="page-wrapper">
                <div className="container cart-empty">
                    <FiShoppingBag size={64} className="empty-icon" />
                    <h2>{t('Votre panier est vide', 'سلة التسوق فارغة')}</h2>
                    <p>{t('Découvrez nos produits et ajoutez-les à votre panier.', 'اكتشف منتجات رائعة وأضفها إلى سلتك.')}</p>
                    <Link to="/products" className="btn btn-primary">{t('Commencer les achats', 'ابدأ التسوق')}</Link>
                </div>
            </div>
        );
    }

    const shipping = totalPrice > 50 ? 0 : 5;

    return (
        <div className="page-wrapper">
            <div className="container">
                <h1 className="section-title">{t('Panier', 'سلة التسوق')}</h1>
                <p className="section-subtitle">{cartItems.length} {t('article(s) dans le panier', 'عنصر(عناصر) في السلة')}</p>

                <div className="cart-layout">
                    {/* Items */}
                    <div className="cart-items">
                        {cartItems.map((item) => (
                            <div key={item._id} className="cart-item card">
                                <img
                                    src={item.images?.[0] || 'https://placehold.co/100x100/1a1a2e/6c63ff?text=Item'}
                                    alt={item.name}
                                    className="cart-img"
                                    onError={(e) => { e.target.src = 'https://placehold.co/100x100/1a1a2e/6c63ff?text=Item'; }}
                                />
                                <div className="cart-item-info">
                                    <h3>{item.name}</h3>
                                    <span className="item-price">${item.price?.toFixed(2)}</span>
                                </div>
                                <div className="qty-control">
                                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>−</button>
                                    <span>{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                        disabled={Number.isFinite(item.stock) && item.quantity >= item.stock}
                                        title={Number.isFinite(item.stock) && item.quantity >= item.stock ? t('Stock maximum atteint', 'تم بلوغ الحد الأقصى للمخزون') : ''}
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="item-subtotal">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </div>
                                <button className="remove-btn" onClick={() => removeFromCart(item._id)}>
                                    <FiTrash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="cart-summary card">
                        <h3>{t('Récapitulatif', 'ملخص الطلب')}</h3>
                        {shipping === 0 && (
                            <div className="free-banner">{t('🚚 Livraison gratuite appliquée', '🚚 تم تطبيق التوصيل المجاني')}</div>
                        )}
                        <div className="summary-row">
                            <span>{t('Sous-total', 'المجموع الفرعي')}</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>{t('Livraison', 'التوصيل')}</span>
                            <span>{shipping === 0 ? <span className="free">{t('Gratuite', 'مجاني')}</span> : `$${shipping.toFixed(2)}`}</span>
                        </div>
                        <hr className="summary-divider" />
                        <div className="summary-row total">
                            <span>{t('Total', 'الإجمالي')}</span>
                            <span>${(totalPrice + shipping).toFixed(2)}</span>
                        </div>
                        {totalPrice < 50 && (
                            <p className="free-threshold">{t('Ajoutez', 'أضف')} ${(50 - totalPrice).toFixed(2)} {t('de plus pour la livraison gratuite !', 'أكثر للحصول على توصيل مجاني!')}</p>
                        )}
                        <button className="btn btn-primary checkout-btn" onClick={handleCheckout}>
                            <FiShoppingBag /> {t('Valider la commande', 'إتمام الطلب')}
                        </button>
                        <button className="btn btn-danger clear-btn" onClick={clearCart}>
                            {t('Vider le panier', 'تفريغ السلة')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartScreen;
