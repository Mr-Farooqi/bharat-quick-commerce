import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('blinkit_customer_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('blinkit_customer_token') || null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    if (token) {
      try {
        const res = await api.get('/auth/me');
        if (res.data.user) {
          setUser(res.data.user);
          localStorage.setItem('blinkit_customer_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        logout();
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', {
      email,
      password,
      requestedRole: 'customer',
    });

    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('blinkit_customer_token', res.data.token);
      localStorage.setItem('blinkit_customer_user', JSON.stringify(res.data.user));
      return res.data;
    }
  };

  const register = async (name, email, password, phone) => {
    const res = await api.post('/auth/register', {
      name,
      email,
      password,
      phone,
      role: 'customer',
    });

    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('blinkit_customer_token', res.data.token);
      localStorage.setItem('blinkit_customer_user', JSON.stringify(res.data.user));
      return res.data;
    }
  };

  const addAddress = async (addressData) => {
    const res = await api.post('/auth/addresses', addressData);
    if (res.data.success) {
      setUser((prev) => ({ ...prev, addresses: res.data.addresses }));
      localStorage.setItem('blinkit_customer_user', JSON.stringify({ ...user, addresses: res.data.addresses }));
    }
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('blinkit_customer_token');
    localStorage.removeItem('blinkit_customer_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, addAddress, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
