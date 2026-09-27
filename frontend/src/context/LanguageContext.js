import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(() => {
        const saved = localStorage.getItem('site_lang');
        return saved === 'ar' ? 'ar' : 'fr';
    });

    useEffect(() => {
        localStorage.setItem('site_lang', lang);
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }, [lang]);

    const value = useMemo(() => ({
        lang,
        setLang: (nextLang) => setLang(nextLang === 'ar' ? 'ar' : 'fr'),
        t: (frText, arText) => (lang === 'ar' ? arText : frText),
        isArabic: lang === 'ar',
    }), [lang]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};
