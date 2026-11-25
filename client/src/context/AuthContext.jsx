import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const saved = localStorage.getItem('abes_user');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('abes_token');
    if (!token) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    api
      .get('/auth/me')
      .then(({ data }) => {
        if (!active) return;
        setUser(data);
        localStorage.setItem('abes_user', JSON.stringify(data));
      })
      .catch(() => {
        if (!active) return;
        localStorage.removeItem('abes_token');
        localStorage.removeItem('abes_user');
        setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function login(userData, token) {
    localStorage.setItem('abes_token', token);
    localStorage.setItem('abes_user', JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('abes_token');
    localStorage.removeItem('abes_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
