import React, { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const parsed = JSON.parse(localStorage.getItem('cart') || '[]');
            return parsed.map((item) => {
                const maxStock = Number.isFinite(item.stock) ? Math.max(1, item.stock) : null;
                if (!maxStock) return { ...item, quantity: Math.max(1, item.quantity || 1) };
                return { ...item, quantity: Math.min(Math.max(1, item.quantity || 1), maxStock) };
            });
        } catch {
            return [];
        }
    });

    const saveCart = (items) => {
        setCartItems(items);
        localStorage.setItem('cart', JSON.stringify(items));
    };

    const addToCart = useCallback((product, quantity = 1) => {
        setCartItems((prev) => {
            const existing = prev.find((i) => i._id === product._id);
            const maxStock = Number.isFinite(product.stock) ? Math.max(1, product.stock) : null;
            let updated;
            if (existing) {
                updated = prev.map((i) =>
                    i._id === product._id
                        ? {
                            ...i,
                            quantity: maxStock
                                ? Math.min(maxStock, i.quantity + quantity)
                                : i.quantity + quantity,
                        }
                        : i
                );
            } else {
                updated = [
                    ...prev,
                    {
                        ...product,
                        quantity: maxStock ? Math.min(maxStock, Math.max(1, quantity)) : Math.max(1, quantity),
                    },
                ];
            }
            localStorage.setItem('cart', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const removeFromCart = useCallback((id) => {
        setCartItems((prev) => {
            const updated = prev.filter((i) => i._id !== id);
            localStorage.setItem('cart', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const updateQuantity = useCallback((id, quantity) => {
        setCartItems((prev) => {
            const updated = prev.map((i) =>
                i._id === id
                    ? {
                        ...i,
                        quantity: Number.isFinite(i.stock)
                            ? Math.min(Math.max(1, quantity), Math.max(1, i.stock))
                            : Math.max(1, quantity),
                    }
                    : i
            );
            localStorage.setItem('cart', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const clearCart = useCallback(() => {
        setCartItems([]);
        localStorage.removeItem('cart');
    }, []);

    const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <CartContext.Provider
            value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, itemCount, totalPrice }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
export default CartContext;
