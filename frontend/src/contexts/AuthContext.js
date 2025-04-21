import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Try to load user from localStorage on startup
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const storedUser = authService.getStoredUser();
        
        if (storedUser && authService.isLoggedIn()) {
          // Verify with backend that token is still valid
          try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
          } catch (e) {
            // If the token is invalid, log the user out
            authService.logout();
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      await authService.register(userData);
      // After registration, log the user in
      return await login({
        email: userData.email,
        password: userData.password
      });
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      await authService.updateProfile(userData);
      // Refresh user data
      const updatedUser = await authService.getCurrentUser();
      setUser(updatedUser);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Profile update failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;