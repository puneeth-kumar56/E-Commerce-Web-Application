import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getStoredToken, setStoredToken } from '../services/api.js';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const existingToken = getStoredToken();
      if (existingToken) {
        try {
          const res = await api.auth.getProfile();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    }

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    if (res.success) {
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
    }
  };

  const register = async (name, email, password, role) => {
    const res = await api.auth.register({ name, email, password, role });
    if (res.success) {
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
    }
  };

  const logout = () => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  };

  const demoLogin = async (role) => {
    const email = role === 'admin' ? 'admin@novamart.com' : 'jane@novamart.com';
    const password = 'password123';
    await login(email, password);
  };

  const refreshProfile = async () => {
    try {
      const res = await api.auth.getProfile();
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch {
      // profile refresh fallback
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        demoLogin,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
