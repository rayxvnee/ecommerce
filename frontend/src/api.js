import axios from 'axios';

const API_BASE_URL = 'https://ecommerce-rrgp.onrender.com/api'; const API = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// ── Auth ────────────────────────────────
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// ── Products ────────────────────────────
export const getProducts = (params) => API.get('/products', { params });
export const getFeaturedProducts = () => API.get('/products/featured');
export const getProduct = (id) => API.get(`/products/${id}`);
export const getRecommendedProducts = (id) => API.get(`/products/${id}/recommendations`);
export const createProduct = (data) => API.post('/products', data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const addReview = (id, data) => API.post(`/products/${id}/reviews`, data);

// ── Shops ───────────────────────────────
export const getShops = (params) => API.get('/shops', { params });
export const getShop = (id) => API.get(`/shops/${id}`);
export const createShop = (data) => API.post('/shops', data);
export const updateShop = (id, data) => API.put(`/shops/${id}`, data);
export const deleteShop = (id) => API.delete(`/shops/${id}`);

// ── Orders ──────────────────────────────
export const createOrder = (data) => API.post('/orders', data);
export const getMyOrders = () => API.get('/orders/mine');
export const getOrder = (id) => API.get(`/orders/${id}`);
export const getAllOrders = (params) => API.get('/orders', { params });
export const updateOrderStatus = (id, status) => API.put(`/orders/${id}/status`, { status });

// ── Marketing ──────────────────────────
export const subscribeNewsletter = (data) => API.post('/marketing/subscribe', data);

export default API;
