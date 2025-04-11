import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, register as apiRegister, login as apiLogin, logout as apiLogout, getCurrentUser, isAuthenticated } from '../services/api/authService';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  register: (username: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Initialize state directly from localStorage to avoid useEffect
  const initialAuthCheck = () => {
    if (isAuthenticated()) {
      return {
        user: getCurrentUser(),
        isLoggedIn: true,
        loading: false
      };
    }
    return {
      user: null,
      isLoggedIn: false,
      loading: false
    };
  };

  const initialState = initialAuthCheck();
  const [user, setUser] = useState<User | null>(initialState.user);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(initialState.isLoggedIn);
  const [loading, setLoading] = useState<boolean>(initialState.loading);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = () => {
    try {
      if (isAuthenticated()) {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error('Auth check error:', err);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRegister(username, email, password);
      setUser(response.user);
      setIsLoggedIn(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiLogin(email, password);
      setUser(response.user);
      setIsLoggedIn(true);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    setIsLoggedIn(false);
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    isLoggedIn,
    loading,
    error,
    register,
    login,
    logout,
    clearError,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
