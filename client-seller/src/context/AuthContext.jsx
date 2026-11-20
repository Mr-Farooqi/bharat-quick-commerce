import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('blinkit_seller_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [shop, setShop] = useState(() => {
    const saved = localStorage.getItem('blinkit_seller_shop');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('blinkit_seller_token') || null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (token) {
      try {
        const res = await api.get('/auth/me');
        if (res.data.user && res.data.user.role === 'seller') {
          setUser(res.data.user);
          setShop(res.data.shop);
          localStorage.setItem('blinkit_seller_user', JSON.stringify(res.data.user));
          if (res.data.shop) {
            localStorage.setItem('blinkit_seller_shop', JSON.stringify(res.data.shop));
          }
        } else {
          logout();
        }
      } catch (err) {
        console.error('Session error:', err);
        logout();
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', {
      email,
      password,
      requestedRole: 'seller',
    });

    if (res.data.success) {
      if (res.data.user.role !== 'seller') {
        throw new Error('Access denied. This login is strictly for Partner Merchant Stores.');
      }
      setToken(res.data.token);
      setUser(res.data.user);
      setShop(res.data.shop);
      localStorage.setItem('blinkit_seller_token', res.data.token);
      localStorage.setItem('blinkit_seller_user', JSON.stringify(res.data.user));
      if (res.data.shop) {
        localStorage.setItem('blinkit_seller_shop', JSON.stringify(res.data.shop));
      }
      return res.data;
    }
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', {
      ...formData,
      role: 'seller',
    });

    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      setShop(res.data.shop);
      localStorage.setItem('blinkit_seller_token', res.data.token);
      localStorage.setItem('blinkit_seller_user', JSON.stringify(res.data.user));
      if (res.data.shop) {
        localStorage.setItem('blinkit_seller_shop', JSON.stringify(res.data.shop));
      }
      return res.data;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setShop(null);
    localStorage.removeItem('blinkit_seller_token');
    localStorage.removeItem('blinkit_seller_user');
    localStorage.removeItem('blinkit_seller_shop');
  };

  return (
    <AuthContext.Provider value={{ user, shop, setShop, token, login, register, logout, loading, refreshShop: fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
