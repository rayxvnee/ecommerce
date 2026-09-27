import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import ShopScreen from './screens/ShopScreen';
import CartScreen from './screens/CartScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import AdminScreen from './screens/AdminScreen';
import ShopAdminScreen from './screens/ShopAdminScreen';
import OrdersScreen from './screens/OrdersScreen';

import './index.css';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/products" element={<ProductScreen />} />
              <Route path="/products/:id" element={<ProductDetailScreen />} />
              <Route path="/shops" element={<ShopScreen />} />
              <Route path="/cart" element={<CartScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/register" element={<RegisterScreen />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={['generalAdmin']}>
                    <AdminScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shop-admin"
                element={
                  <ProtectedRoute roles={['shopAdmin', 'generalAdmin']}>
                    <ShopAdminScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <OrdersScreen />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1a1a2e',
                  color: '#fffffe',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                },
                success: { iconTheme: { primary: '#43e97b', secondary: '#1a1a2e' } },
                error: { iconTheme: { primary: '#ff6584', secondary: '#1a1a2e' } },
              }}
            />
          </Router>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
