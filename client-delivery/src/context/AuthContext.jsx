import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bharat_delivery_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('bharat_delivery_token') || null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/me');
      if (res.data.success && res.data.user) {
        if (res.data.user.role !== 'delivery_partner') {
          logout();
          alert('Access denied: You must be a registered Delivery Partner to use this app.');
          return;
        }
        setUser(res.data.user);
        localStorage.setItem('bharat_delivery_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to restore rider profile:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', {
      email,
      password,
      requestedRole: 'delivery_partner',
    });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('bharat_delivery_token', res.data.token);
      localStorage.setItem('bharat_delivery_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', {
      ...formData,
      role: 'delivery_partner',
    });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('bharat_delivery_token', res.data.token);
      localStorage.setItem('bharat_delivery_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('bharat_delivery_token');
    localStorage.removeItem('bharat_delivery_user');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, login, register, logout, loading, refreshUser: fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
