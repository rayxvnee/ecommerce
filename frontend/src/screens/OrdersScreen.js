import React, { useEffect, useState } from 'react';
import { getMyOrders } from '../api';
import { FiPackage } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import './OrdersScreen.css';

const STATUS_COLORS = {
    pending: '#fbbf24',
    processing: '#a5a0ff',
    shipped: '#43e97b',
    delivered: '#10b981',
    cancelled: '#ff6584',
};

const OrdersScreen = () => {
    const { t, lang } = useLanguage();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const statusLabel = (status) => {
        const map = {
            pending: t('En attente', 'قيد الانتظار'),
            processing: t('En traitement', 'قيد المعالجة'),
            shipped: t('Expédiée', 'تم الشحن'),
            delivered: t('Livrée', 'تم التسليم'),
            cancelled: t('Annulée', 'ملغاة'),
        };
        return map[status] || status;
    };

    useEffect(() => {
        getMyOrders()
            .then(({ data }) => setOrders(data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="spinner-overlay"><div className="spinner" /></div>;

    return (
        <div className="page-wrapper">
            <div className="container">
                <h1 className="section-title">{t('Mes commandes', 'طلباتي')}</h1>
                <p className="section-subtitle">{orders.length} {t('commande(s)', 'طلب')}</p>

                {orders.length === 0 ? (
                    <div className="empty-state">
                        <FiPackage size={48} style={{ color: 'var(--primary)', opacity: 0.4, marginBottom: 16 }} />
                        <p>{t("Vous n'avez pas encore passé de commande.", 'لم تقم بأي طلب بعد.')}</p>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <div key={order._id} className="order-card card">
                                <div className="order-header">
                                    <div>
                                        <span className="order-id">#{order._id.slice(-10).toUpperCase()}</span>
                                        <span className="order-date">
                                            {new Date(order.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <span
                                        className="order-status"
                                        style={{ background: STATUS_COLORS[order.status] + '22', color: STATUS_COLORS[order.status], borderColor: STATUS_COLORS[order.status] + '44' }}
                                    >
                                        {statusLabel(order.status)}
                                    </span>
                                </div>

                                {/* Items */}
                                <div className="order-items">
                                    {order.items.map((item, i) => (
                                        <div key={i} className="order-item">
                                            <img
                                                src={item.image || 'https://placehold.co/56x56/1a1a2e/6c63ff?text=P'}
                                                alt={item.name}
                                                className="order-item-img"
                                                onError={(e) => { e.target.src = 'https://placehold.co/56x56/1a1a2e/6c63ff?text=P'; }}
                                            />
                                            <div className="order-item-info">
                                                <span>{item.name}</span>
                                                <span className="order-item-qty">× {item.quantity}</span>
                                            </div>
                                            <span className="order-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="order-footer">
                                    <div className="order-shipping">
                                        📦 {order.shippingAddress?.city}, {order.shippingAddress?.country}
                                    </div>
                                    <div className="order-total">
                                        {t('Total :', 'الإجمالي:')} <strong>${order.totalPrice?.toFixed(2)}</strong>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersScreen;
