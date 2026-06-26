import React, { createContext, useContext, useEffect, useState } from 'react';
import api from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('psit_user')) || null; } catch { return null; }
  });
  const [bootstrapped, setBootstrapped] = useState(false);
  
  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem('psit_token');
    if (!token) { setBootstrapped(true); return; }
    api.get('/auth/me')
      .then((r) => { if (!cancelled) setUser(r.data.user); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setBootstrapped(true); });
    return () => { cancelled = true; };
  }, []);

  const login = async (username, password, college) => {
    console.log("in")
    const { data } = await api.post('/auth/login', { username, password, college });
    console.log("auth data:" ,data)
    if (data?.success) {
      localStorage.setItem('psit_token', data.token);
      localStorage.setItem('psit_user', JSON.stringify(data.user));
      setUser(data.user);
      return { ok: true };
    }
    return { ok: false, message: data?.message || 'Login failed' };
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('psit_token');
    localStorage.removeItem('psit_user');
    setUser(null);
  };
 
  return (
    <AuthContext.Provider value={{ user, login, logout, bootstrapped }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
