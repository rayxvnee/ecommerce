import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { MdStorefront } from 'react-icons/md';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import './AuthScreen.css';

const ROLES = [
    { value: 'client', labelFr: '🛍️ Client', labelAr: '🛍️ عميل' },
    { value: 'shopAdmin', labelFr: '🏪 Propriétaire de boutique', labelAr: '🏪 صاحب متجر' },
];

const RegisterScreen = () => {
    const { register, loading } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
    const [showPass, setShowPass] = useState(false);

    const isStrongPassword = (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(value);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) return toast.error(t('Le mot de passe doit contenir au moins 6 caractères', 'يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل'));
        if (form.role === 'shopAdmin' && !isStrongPassword(form.password)) {
            return toast.error(
                t(
                    'Pour un propriétaire de boutique, le mot de passe doit contenir minuscule, majuscule, chiffre et caractère spécial.',
                    'لصاحب المتجر، يجب أن تحتوي كلمة المرور على حرف صغير وكبير ورقم ورمز خاص.'
                )
            );
        }
        try {
            await register(form.name, form.email, form.password, form.role);
            toast.success(t('Compte créé ! Bienvenue 🎉', 'تم إنشاء الحساب! مرحبًا 🎉'));
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || t("Échec de l'inscription", 'فشل التسجيل'));
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card card fade-in-up">
                <div className="auth-logo">
                    <MdStorefront size={32} />
                    <span>DZShop</span>
                </div>
                <h1 className="auth-title">{t('Créer un compte', 'إنشاء حساب')}</h1>
                <p className="auth-sub">{t('Rejoignez des milliers de clients et vendeurs', 'انضم إلى آلاف المشترين والبائعين')}</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>{t('Nom complet', 'الاسم الكامل')}</label>
                        <div className="input-icon-wrap">
                            <FiUser className="input-icon" />
                            <input
                                type="text"
                                placeholder="mohammed amine"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>{t('E-mail', 'البريد الإلكتروني')}</label>
                        <div className="input-icon-wrap">
                            <FiMail className="input-icon" />
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>{t('Mot de passe', 'كلمة المرور')}</label>
                        <div className="input-icon-wrap">
                            <FiLock className="input-icon" />
                            <input
                                type={showPass ? 'text' : 'password'}
                                placeholder={t('Min. 6 caractères', 'الحد الأدنى 6 أحرف')}
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                            <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                                {showPass ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                        {form.role === 'shopAdmin' && (
                            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                {t('Boutique: 6+ caractères avec majuscule, minuscule, chiffre et symbole.', 'لصاحب متجر: 6+ أحرف مع حرف كبير وصغير ورقم ورمز.')}
                            </small>
                        )}
                    </div>

                    <div className="form-group">
                        <label>{t('Je suis…', 'أنا…')}</label>
                        <div className="role-selector">
                            {ROLES.map((r) => (
                                <button
                                    key={r.value}
                                    type="button"
                                    className={`role-btn ${form.role === r.value ? 'active' : ''}`}
                                    onClick={() => setForm({ ...form, role: r.value })}
                                >
                                    {t(r.labelFr, r.labelAr)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button className="btn btn-primary auth-btn" type="submit" disabled={loading}>
                        {loading ? t('Création du compte...', 'جارٍ إنشاء الحساب...') : t('Créer un compte', 'إنشاء الحساب')}
                    </button>
                </form>

                <p className="auth-switch">
                    {t('Vous avez déjà un compte ?', 'لديك حساب بالفعل؟')} <Link to="/login">{t('Se connecter', 'تسجيل الدخول')}</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterScreen;
