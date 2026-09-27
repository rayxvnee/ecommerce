import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { MdStorefront } from 'react-icons/md';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import './AuthScreen.css';

const LoginScreen = () => {
    const { login, loading } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(form.email, form.password);
            toast.success(t('Bon retour !', 'مرحبًا بعودتك!'));
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || t('Échec de la connexion', 'فشل تسجيل الدخول'));
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card card fade-in-up">
                <div className="auth-logo">
                    <MdStorefront size={32} />
                    <span>DzShop</span>
                </div>
                <h1 className="auth-title">{t('Bon retour', 'مرحبًا بعودتك')}</h1>
                <p className="auth-sub">{t('Connectez-vous pour continuer', 'سجّل الدخول للمتابعة')}</p>

                <form onSubmit={handleSubmit} className="auth-form">
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
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                            <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                                {showPass ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    <button className="btn btn-primary auth-btn" type="submit" disabled={loading}>
                        {loading ? t('Connexion...', 'جارٍ تسجيل الدخول...') : t('Se connecter', 'تسجيل الدخول')}
                    </button>
                </form>

                <p className="auth-switch">
                    {t("Vous n'avez pas de compte ?", 'ليس لديك حساب؟')} <Link to="/register">{t('Créer un compte', 'إنشاء حساب')}</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginScreen;
