import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../api';
import ProductCard from '../components/ProductCard';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import './ProductScreen.css';

const CATEGORIES = ['all', 'electronics', 'fashion', 'food', 'beauty', 'sports', 'other'];

const ProductScreen = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('all');

  const categoryLabel = (c) => {
    const labels = {
      all: t('Tous', 'الكل'),
      electronics: t('Électronique', 'إلكترونيات'),
      fashion: t('Mode', 'موضة'),
      food: t('Alimentation', 'غذاء'),
      beauty: t('Beauté', 'جمال'),
      sports: t('Sport', 'رياضة'),
      other: t('Autre', 'أخرى'),
    };
    return labels[c] || c;
  };

  const shopFilter = searchParams.get('shop') || '';

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 12 };
        if (keyword) params.keyword = keyword;
        if (category !== 'all') params.category = category;
        if (shopFilter) params.shop = shopFilter;
        const { data } = await getProducts(params);
        setProducts(data.data);
        setTotal(data.total);
        setPages(data.pages);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page, category, shopFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setLoading(true);
    getProducts({ keyword, category: category !== 'all' ? category : undefined, page: 1 })
      .then(({ data }) => {
        setProducts(data.data);
        setTotal(data.total);
        setPages(data.pages);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="ps-header">
          <div>
            <h1 className="section-title">{t('Produits', 'المنتجات')}</h1>
            <p className="section-subtitle">{total} {t('produits trouvés', 'منتجًا تم العثور عليه')}</p>
          </div>

          {/* Search */}
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-input-wrap">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder={t('Rechercher des produits...', 'ابحث عن المنتجات...')}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="search-input"
              />
            </div>
            <button type="submit" className="btn btn-primary">{t('Rechercher', 'بحث')}</button>
          </form>
        </div>

        {/* Category Filter */}
        <div className="category-filter">
          <FiFilter size={16} />
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`cat-btn ${category === c ? 'active' : ''}`}
              onClick={() => { setCategory(c); setPage(1); }}
            >
              {categoryLabel(c)}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="spinner-overlay"><div className="spinner" /></div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-4">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
            {/* Pagination */}
            {pages > 1 && (
              <div className="pagination">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`page-btn ${page === p ? 'active' : ''}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">{t('Aucun produit trouvé. Essayez de modifier votre recherche.', 'لم يتم العثور على منتجات. حاول تعديل البحث.')}</div>
        )}
      </div>
    </div>
  );
};

export default ProductScreen;
