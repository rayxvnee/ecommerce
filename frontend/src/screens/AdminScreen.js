import React, { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus, getShops, getProducts } from '../api';
import { FiPackage, FiShoppingBag, FiUsers, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import './AdminScreen.css';

const STATUS_COLORS = {
    pending: '#fbbf24',
    processing: '#a5a0ff',
    shipped: '#43e97b',
    delivered: '#10b981',
    cancelled: '#ff6584',
};

const AdminScreen = () => {
    const { t } = useLanguage();
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ orders: 0, shops: 0, products: 0, revenue: 0, stockUnits: 0, lowStock: 0, outOfStock: 0 });
    const [stockAlerts, setStockAlerts] = useState({ outOfStock: [], lowStock: [] });
    const [loading, setLoading] = useState(true);
    const LOW_STOCK_THRESHOLD = 5;

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

    const loadData = async () => {
        try {
            const [oRes, sRes, pRes] = await Promise.all([
                getAllOrders({ limit: 50 }),
                getShops({ limit: 1 }),
                getProducts({ limit: 500, page: 1 }),
            ]);
            const allOrders = oRes.data.data;
            const products = pRes.data.data || [];
            const outOfStock = products.filter((p) => p.stock === 0);
            const lowStock = products.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD);
            const stockUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);

            setOrders(allOrders);
            setStockAlerts({ outOfStock, lowStock });

            const revenue = allOrders
                .filter((o) => o.status !== 'cancelled')
                .reduce((sum, o) => sum + o.totalPrice, 0);

            setStats({
                orders: oRes.data.total,
                shops: sRes.data.total,
                products: pRes.data.total,
                revenue,
                stockUnits,
                lowStock: lowStock.length,
                outOfStock: outOfStock.length,
            });
        } catch (e) {
            toast.error(t('Impossible de charger les données admin', 'فشل تحميل بيانات الإدارة'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleStatusChange = async (id, status) => {
        try {
            await updateOrderStatus(id, status);
            toast.success(t('Statut de commande mis à jour', 'تم تحديث حالة الطلب'));
            loadData();
        } catch {
            toast.error(t('Échec de la mise à jour du statut', 'فشل تحديث الحالة'));
        }
    };

    return (
        <div className="page-wrapper">
            <div className="container">
                <h1 className="section-title">{t('Tableau de bord admin', 'لوحة تحكم الإدارة')}</h1>
                <p className="section-subtitle">{t('Vue globale de la plateforme, commandes et gestion automatique du stock', 'نظرة عامة على المنصة والطلبات وإدارة المخزون التلقائية')}</p>

                {/* Stats */}
                <div className="admin-stats">
                    <div className="stat-tile card">
                        <div className="stat-icon-wrap" style={{ background: 'rgba(108,99,255,0.15)' }}>
                            <FiPackage size={22} color="var(--primary)" />
                        </div>
                        <div>
                            <div className="stat-value">{stats.orders}</div>
                            <div className="stat-lbl">{t('Total commandes', 'إجمالي الطلبات')}</div>
                        </div>
                    </div>
                    <div className="stat-tile card">
                        <div className="stat-icon-wrap" style={{ background: 'rgba(67,233,123,0.15)' }}>
                            <FiTrendingUp size={22} color="#43e97b" />
                        </div>
                        <div>
                            <div className="stat-value">${stats.revenue.toFixed(2)}</div>
                            <div className="stat-lbl">{t('Revenus', 'الإيرادات')}</div>
                        </div>
                    </div>
                    <div className="stat-tile card">
                        <div className="stat-icon-wrap" style={{ background: 'rgba(255,101,132,0.15)' }}>
                            <FiShoppingBag size={22} color="var(--secondary)" />
                        </div>
                        <div>
                            <div className="stat-value">{stats.products}</div>
                            <div className="stat-lbl">{t('Produits', 'المنتجات')}</div>
                        </div>
                    </div>
                    <div className="stat-tile card">
                        <div className="stat-icon-wrap" style={{ background: 'rgba(251,191,36,0.15)' }}>
                            <FiUsers size={22} color="#fbbf24" />
                        </div>
                        <div>
                            <div className="stat-value">{stats.shops}</div>
                            <div className="stat-lbl">{t('Boutiques', 'المتاجر')}</div>
                        </div>
                    </div>
                    <div className="stat-tile card">
                        <div className="stat-icon-wrap" style={{ background: 'rgba(16,185,129,0.15)' }}>
                            <FiPackage size={22} color="#10b981" />
                        </div>
                        <div>
                            <div className="stat-value">{stats.stockUnits}</div>
                            <div className="stat-lbl">{t('Unités en stock', 'إجمالي وحدات المخزون')}</div>
                        </div>
                    </div>
                    <div className="stat-tile card">
                        <div className="stat-icon-wrap" style={{ background: 'rgba(255,101,132,0.15)' }}>
                            <FiPackage size={22} color="#ff6584" />
                        </div>
                        <div>
                            <div className="stat-value">{stats.outOfStock}</div>
                            <div className="stat-lbl">{t('Ruptures de stock', 'منتجات نفدت من المخزون')}</div>
                        </div>
                    </div>
                    <div className="stat-tile card">
                        <div className="stat-icon-wrap" style={{ background: 'rgba(251,191,36,0.15)' }}>
                            <FiPackage size={22} color="#fbbf24" />
                        </div>
                        <div>
                            <div className="stat-value">{stats.lowStock}</div>
                            <div className="stat-lbl">{t(`Stock faible (≤ ${LOW_STOCK_THRESHOLD})`, `مخزون منخفض (≤ ${LOW_STOCK_THRESHOLD})`)}</div>
                        </div>
                    </div>
                </div>

                <div className="admin-section card">
                    <h2 className="admin-section-title">{t('Alertes stock', 'تنبيهات المخزون')}</h2>
                    <div className="stock-alerts-grid">
                        <div className="stock-alert-box out">
                            <h3>{t('Rupture de stock', 'نفاد المخزون')}</h3>
                            {stockAlerts.outOfStock.length === 0 ? (
                                <p className="stock-empty">{t('Aucune rupture détectée.', 'لا يوجد نفاد بالمخزون.')}</p>
                            ) : (
                                <ul className="stock-alert-list">
                                    {stockAlerts.outOfStock.slice(0, 8).map((product) => (
                                        <li key={product._id}>
                                            <span>{product.name}</span>
                                            <strong>0</strong>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="stock-alert-box low">
                            <h3>{t('Stock faible', 'مخزون منخفض')}</h3>
                            {stockAlerts.lowStock.length === 0 ? (
                                <p className="stock-empty">{t('Aucun produit en stock faible.', 'لا توجد منتجات بمخزون منخفض.')}</p>
                            ) : (
                                <ul className="stock-alert-list">
                                    {stockAlerts.lowStock.slice(0, 8).map((product) => (
                                        <li key={product._id}>
                                            <span>{product.name}</span>
                                            <strong>{product.stock}</strong>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="admin-section card">
                    <h2 className="admin-section-title">{t('Commandes récentes', 'أحدث الطلبات')}</h2>
                    {loading ? (
                        <div className="spinner-overlay"><div className="spinner" /></div>
                    ) : orders.length === 0 ? (
                        <div className="empty-state">{t('Aucune commande pour le moment.', 'لا توجد طلبات حتى الآن.')}</div>
                    ) : (
                        <div className="table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>{t('ID commande', 'معرّف الطلب')}</th>
                                        <th>{t('Client', 'العميل')}</th>
                                        <th>{t('Total', 'الإجمالي')}</th>
                                        <th>{t('Statut', 'الحالة')}</th>
                                        <th>{t('Action', 'إجراء')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((o) => (
                                        <tr key={o._id}>
                                            <td><code>#{o._id.slice(-8).toUpperCase()}</code></td>
                                            <td>{o.user?.name || '—'}</td>
                                            <td><strong>${o.totalPrice?.toFixed(2)}</strong></td>
                                            <td>
                                                <span className="status-dot" style={{ background: STATUS_COLORS[o.status] || '#999' }}>
                                                    {statusLabel(o.status)}
                                                </span>
                                            </td>
                                            <td>
                                                <select
                                                    value={o.status}
                                                    onChange={(e) => handleStatusChange(o._id, e.target.value)}
                                                    className="status-select"
                                                >
                                                    {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                                                        <option key={s} value={s}>{statusLabel(s)}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminScreen;
