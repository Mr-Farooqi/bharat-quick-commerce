import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('blinkit_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('blinkit_admin_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.user && res.data.user.role === 'admin') {
            setUser(res.data.user);
            localStorage.setItem('blinkit_admin_user', JSON.stringify(res.data.user));
          } else {
            logout();
          }
        } catch (err) {
          console.error('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', {
      email,
      password,
      requestedRole: 'admin',
    });

    if (res.data.success) {
      if (res.data.user.role !== 'admin') {
        throw new Error('Access denied. Only Super Admins can login to this panel.');
      }
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('blinkit_admin_token', res.data.token);
      localStorage.setItem('blinkit_admin_user', JSON.stringify(res.data.user));
      return res.data;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('blinkit_admin_token');
    localStorage.removeItem('blinkit_admin_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
