import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { MdStorefront } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { itemCount } = useCart();
    const { lang, setLang, t } = useLanguage();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setDropdownOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="container navbar-inner">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <MdStorefront size={28} />
                    <span>DZshop</span>
                </Link>

                {/* Desktop Links */}
                <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                    <li><Link to="/" onClick={() => setMenuOpen(false)}>{t('Accueil', 'الرئيسية')}</Link></li>
                    <li><Link to="/products" onClick={() => setMenuOpen(false)}>{t('Produits', 'المنتجات')}</Link></li>
                    <li><Link to="/shops" onClick={() => setMenuOpen(false)}>{t('Boutiques', 'المتاجر')}</Link></li>
                    {user && <li><Link to="/orders" onClick={() => setMenuOpen(false)}>{t('Mes commandes', 'طلباتي')}</Link></li>}
                    {user?.role === 'shopAdmin' && (
                        <li><Link to="/shop-admin" onClick={() => setMenuOpen(false)}>{t('Tableau de bord', 'لوحة التحكم')}</Link></li>
                    )}
                    {user?.role === 'generalAdmin' && (
                        <li><Link to="/admin" onClick={() => setMenuOpen(false)}>{t('Admin', 'الإدارة')}</Link></li>
                    )}
                </ul>

                {/* Right Actions */}
                <div className="navbar-actions">
                    <select
                        className="lang-select"
                        value={lang}
                        onChange={(e) => setLang(e.target.value)}
                        aria-label={t('Choisir la langue', 'اختر اللغة')}
                    >
                        <option value="fr">FR</option>
                        <option value="ar">AR</option>
                    </select>

                    <Link to="/cart" className="navbar-cart">
                        <FiShoppingCart size={22} />
                        {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                    </Link>

                    {user ? (
                        <div className="user-menu" onClick={() => setDropdownOpen(!dropdownOpen)}>
                            <div className="user-avatar">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            {dropdownOpen && (
                                <div className="dropdown">
                                    <div className="dropdown-label">{user.name}</div>
                                    <div className="dropdown-role">{user.role}</div>
                                    <hr className="dropdown-divider" />
                                    <button onClick={handleLogout} className="dropdown-item">
                                        <FiLogOut size={14} /> {t('Se déconnecter', 'تسجيل الخروج')}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                            <FiUser size={16} /> {t('Connexion', 'تسجيل الدخول')}
                        </Link>
                    )}

                    <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
