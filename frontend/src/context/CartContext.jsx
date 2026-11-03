import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [cart, setCart] = useState({ items: [], totalPrice: 0, totalQuantity: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [], totalPrice: 0, totalQuantity: 0 });
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/cart');
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      error('Please sign in to add products to your cart');
      return false;
    }
    setLoading(true);
    try {
      const res = await api.post('/cart', { productId, quantity });
      if (res.data.success) {
        setCart(res.data.cart);
        success('Added item to cart!');
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not add product to cart';
      error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await api.put(`/cart/${productId}`, { quantity });
      if (res.data.success) {
        setCart(res.data.cart);
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not update quantity';
      error(msg);
      return false;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await api.delete(`/cart/${productId}`);
      if (res.data.success) {
        setCart(res.data.cart);
        success('Item removed from cart');
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not remove item';
      error(msg);
      return false;
    }
  };

  const clearCart = async () => {
    try {
      const res = await api.delete('/cart');
      if (res.data.success) {
        setCart({ items: [], totalPrice: 0, totalQuantity: 0 });
        return true;
      }
    } catch (err) {
      console.error('Could not clear cart:', err);
      return false;
    }
  };

  const totalItems = cart.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const totalPrice = cart.items
    ? cart.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
    : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        totalItems,
        totalPrice,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
