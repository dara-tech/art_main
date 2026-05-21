import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { clearAuthStorage, setUnauthorizedHandler } from '../services/authSession';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const logout = () => {
    clearAuthStorage();
    setUser(null);
  };

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const token = localStorage.getItem('token');
      if (!token) {
        logout();
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const response = await api.get('/apiv1/auth/verify');
        const verifiedUser = response.data?.user;
        if (!verifiedUser) throw new Error('Invalid session');
        localStorage.setItem('user', JSON.stringify(verifiedUser));
        if (!cancelled) setUser(verifiedUser);
      } catch {
        logout();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async ({ username, password }) => {
    const normalizedUsername = String(username || '').trim();
    const response = await api.post('/apiv1/auth/login', { username: normalizedUsername, password });
    const payload = response.data;
    if (!payload?.token) throw new Error(payload?.message || 'Login failed');
    localStorage.setItem('token', payload.token);
    localStorage.setItem('user', JSON.stringify(payload.user));
    setUser(payload.user);
    return payload.user;
  };

  const value = useMemo(() => ({ loading, user, login, logout }), [loading, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
