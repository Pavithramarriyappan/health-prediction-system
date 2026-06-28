import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => {
    return sessionStorage.getItem('authToken');
  });

  const storeToken = (tokenValue) => {
    sessionStorage.setItem('authToken', tokenValue);
  };

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/verify', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.data.success) {
            setAdmin(response.data.admin);
          } else {
            sessionStorage.removeItem('authToken');
            setToken(null);
          }
        } catch (error) {
          sessionStorage.removeItem('authToken');
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      if (response.data.success) {
        const { token, admin } = response.data;
        storeToken(token);
        setToken(token);
        setAdmin(admin);
        api.defaults.headers['Authorization'] = `Bearer ${token}`;
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async () => {
    return {
      success: false,
      message: 'Registration is not available in this application'
    };
  };

  const logout = () => {
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('authToken');
    setToken(null);
    setAdmin(null);
    delete api.defaults.headers['Authorization'];
  };

  const forgotPassword = async (username) => {
    try {
      const response = await api.post('/auth/forgot-password', { username });
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Password reset request sent successfully'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send password reset request'
      };
    }
  };

  const resetPassword = async (resetToken, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token: resetToken,
        newPassword
      });
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Password reset successfully'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password'
      };
    }
  };

  const value = {
    admin,
    loading,
    token,
    login,
    logout,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!admin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
