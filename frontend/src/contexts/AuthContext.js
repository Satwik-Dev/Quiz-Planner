import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (user && token) {
      console.log('User found in localStorage:', user.email);
      console.log('Token exists:', !!token);
      setCurrentUser(user);
    } else {
      console.log('No user or token found in localStorage');
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      const response = await api.post('/auth/login', { email, password });
      
      console.log('Login response received:', response.data);
      
      const { user, access_token } = response.data;
      
      if (!access_token) {
        console.error('No access token in response');
        throw new Error('Invalid login response - no access token');
      }
      
      // Store token
      localStorage.setItem('token', access_token);
      
      // Verify token was stored correctly
      const storedToken = localStorage.getItem('token');
      console.log('Token stored successfully:', !!storedToken);
      
      // Store user
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};