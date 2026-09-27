import React, { useEffect, useState } from 'react';
import { createShop, getShops, createProduct, getProducts, deleteProduct, deleteShop } from '../api';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiTrash2, FiPackage, FiShoppingBag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import './ShopAdminScreen.css';

const SHOP_CATS = ['electronics', 'fashion', 'food', 'beauty', 'sports', 'other'];

const ShopAdminScreen = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [tab, setTab] = useState('shop');
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [loadingShop, setLoadingShop] = useState(true);

    const [shopForm, setShopForm] = useState({ name: '', description: '', category: 'other', logo: '' });
    const [prodForm, setProdForm] = useState({
        name: '', description: '', price: '', stock: '', category: '', images: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // Load existing shop owned by this user
    useEffect(() => {
        if (!user) return;
        getShops({ limit: 100 })
            .then(({ data }) => {
                const myShop = data.data.find((s) => s.owner?._id === user._id || s.owner === user._id);
                if (myShop) {
                    setShop(myShop);
                    return getProducts({ shop: myShop._id, limit: 50 });
                }
            })
            .then((res) => { if (res) setProducts(res.data.data); })
            .catch(console.error)
            .finally(() => setLoadingShop(false));
    }, [user]);

    const handleCreateShop = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { data } = await createShop(shopForm);
            setShop(data.data);
            toast.success(t('Boutique créée !', 'تم إنشاء المتجر!'));
        } catch (err) {
            toast.error(err.response?.data?.message || t('Échec de la création de la boutique', 'فشل إنشاء المتجر'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        if (!shop) return toast.error(t('Créez une boutique d’abord', 'أنشئ متجرًا أولاً'));
        setSubmitting(true);
        try {
            const payload = {
                ...prodForm,
                price: Number(prodForm.price),
                stock: Number(prodForm.stock),
                shop: shop._id,
                images: prodForm.images ? prodForm.images.split(',').map((s) => s.trim()) : [],
            };
            const { data } = await createProduct(payload);
            setProducts((prev) => [data.data, ...prev]);
            setProdForm({ name: '', description: '', price: '', stock: '', category: '', images: '' });
            toast.success(t('Produit ajouté !', 'تمت إضافة المنتج!'));
        } catch (err) {
            toast.error(err.response?.data?.message || t("Échec de l'ajout du produit", 'فشل إضافة المنتج'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm(t('Supprimer ce produit ?', 'هل تريد حذف هذا المنتج؟'))) return;
        try {
            await deleteProduct(id);
            setProducts((prev) => prev.filter((p) => p._id !== id));
            toast.success(t('Produit supprimé', 'تم حذف المنتج'));
        } catch {
            toast.error(t('Échec de la suppression du produit', 'فشل حذف المنتج'));
        }
    };

    if (loadingShop) return <div className="spinner-overlay"><div className="spinner" /></div>;

    return (
        <div className="page-wrapper">
            <div className="container">
                <h1 className="section-title">{t('Tableau de bord boutique', 'لوحة تحكم المتجر')}</h1>
                <p className="section-subtitle">{t('Gérez votre boutique et vos produits', 'إدارة المتجر والمنتجات')}</p>

                {/* Tabs */}
                <div className="dash-tabs">
                    <button className={`dash-tab ${tab === 'shop' ? 'active' : ''}`} onClick={() => setTab('shop')}>
                        <FiShoppingBag /> {shop ? t('Ma boutique', 'متجري') : t('Créer une boutique', 'إنشاء متجر')}
                    </button>
                    <button className={`dash-tab ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>
                        <FiPackage /> {t('Produits', 'المنتجات')} {products.length > 0 && <span className="badge">{products.length}</span>}
                    </button>
                </div>

                {/* Shop Tab */}
                {tab === 'shop' && (
                    <div className="dash-panel">
                        {shop ? (
                            <div className="shop-info-panel card">
                                <div className="shop-info-img">
                                    {shop.logo
                                        ? <img src={shop.logo} alt={shop.name} />
                                        : <div className="shop-logo-placeholder">{shop.name.charAt(0)}</div>
                                    }
                                </div>
                                <div>
                                    <h2>{shop.name}</h2>
                                    <span className="tag">{shop.category}</span>
                                    <p className="shop-info-desc">{shop.description || t('Aucune description', 'لا يوجد وصف')}</p>
                                </div>
                            </div>
                        ) : (
                            <form className="dash-form card" onSubmit={handleCreateShop}>
                                <h3 className="dash-form-title">{t('Créer votre boutique', 'أنشئ متجرك')}</h3>
                                <div className="form-group">
                                    <label>{t('Nom de la boutique', 'اسم المتجر')}</label>
                                    <input value={shopForm.name} onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })} required placeholder={t('Ma superbe boutique', 'متجري الرائع')} />
                                </div>
                                <div className="form-group">
                                    <label>{t('Description', 'الوصف')}</label>
                                    <textarea rows={3} value={shopForm.description} onChange={(e) => setShopForm({ ...shopForm, description: e.target.value })} placeholder={t('Parlez de votre boutique aux clients…', 'عرّف العملاء بمتجرك…')} />
                                </div>
                                <div className="form-group">
                                    <label>{t('Catégorie', 'الفئة')}</label>
                                    <select value={shopForm.category} onChange={(e) => setShopForm({ ...shopForm, category: e.target.value })}>
                                        {SHOP_CATS.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>{t('URL du logo (optionnel)', 'رابط الشعار (اختياري)')}</label>
                                    <input value={shopForm.logo} onChange={(e) => setShopForm({ ...shopForm, logo: e.target.value })} placeholder="https://..." />
                                </div>
                                <button className="btn btn-primary" type="submit" disabled={submitting}>
                                    <FiPlus /> {submitting ? t('Création…', 'جارٍ الإنشاء...') : t('Créer la boutique', 'إنشاء المتجر')}
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* Products Tab */}
                {tab === 'products' && (
                    <div className="dash-panel">
                        {/* Add product form */}
                        <form className="dash-form card" onSubmit={handleCreateProduct}>
                            <h3 className="dash-form-title">{t('Ajouter un nouveau produit', 'إضافة منتج جديد')}</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>{t('Nom du produit', 'اسم المنتج')}</label>
                                    <input value={prodForm.name} onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })} required placeholder={t('ex: Casque sans fil', 'مثال: سماعات لاسلكية')} />
                                </div>
                                <div className="form-group">
                                    <label>{t('Catégorie', 'الفئة')}</label>
                                    <input value={prodForm.category} onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })} required placeholder={t('ex: electronics', 'مثال: إلكترونيات')} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>{t('Description', 'الوصف')}</label>
                                <textarea rows={2} value={prodForm.description} onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })} required />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>{t('Prix ($)', 'السعر ($)')}</label>
                                    <input type="number" min="0" step="0.01" value={prodForm.price} onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>{t('Stock', 'المخزون')}</label>
                                    <input type="number" min="0" value={prodForm.stock} onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>{t('URLs des images (séparées par virgules)', 'روابط الصور (مفصولة بفواصل)')}</label>
                                <input value={prodForm.images} onChange={(e) => setProdForm({ ...prodForm, images: e.target.value })} placeholder="https://img1.jpg, https://img2.jpg" />
                            </div>
                            <button className="btn btn-primary" type="submit" disabled={submitting}>
                                <FiPlus /> {submitting ? t('Ajout…', 'جارٍ الإضافة...') : t('Ajouter le produit', 'إضافة المنتج')}
                            </button>
                        </form>

                        {/* Products list */}
                        {products.length > 0 && (
                            <div className="prod-list">
                                {products.map((p) => (
                                    <div key={p._id} className="prod-row card">
                                        <img
                                            src={p.images?.[0] || 'https://placehold.co/80x80/1a1a2e/6c63ff?text=P'}
                                            alt={p.name}
                                            className="prod-row-img"
                                            onError={(e) => { e.target.src = 'https://placehold.co/80x80/1a1a2e/6c63ff?text=P'; }}
                                        />
                                        <div className="prod-row-info">
                                            <strong>{p.name}</strong>
                                            <span className="tag">{p.category}</span>
                                        </div>
                                        <div className="prod-row-meta">
                                            <span className="prod-price">${p.price?.toFixed(2)}</span>
                                            <span className="prod-stock">{p.stock} {t('en stock', 'متوفر')}</span>
                                        </div>
                                        <button className="remove-btn" onClick={() => handleDeleteProduct(p._id)}>
                                            <FiTrash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {products.length === 0 && (
                            <div className="empty-state" style={{ marginTop: 24 }}>{t('Aucun produit pour le moment. Ajoutez le premier ci-dessus !', 'لا توجد منتجات بعد. أضف أول منتج بالأعلى!')}</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShopAdminScreen;
