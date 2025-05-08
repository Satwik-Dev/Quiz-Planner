import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // Add these options to handle CORS properly
  withCredentials: false
});

// Update request interceptor with better debugging
api.interceptors.request.use(
  config => {
    // Log each request for debugging
    console.log(`Request: ${config.method.toUpperCase()} ${config.url}`);
    
    const token = localStorage.getItem('token');
    
    if (token) {
      // Make sure the format is exactly 'Bearer ' + token
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Authorization header set successfully');
    } else {
      console.warn('No token available - request will proceed without authentication');
    }
    
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to debug CORS issues
api.interceptors.response.use(
  response => {
    console.log(`Response from ${response.config.url}: Status ${response.status}`);
    return response;
  },
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error data:', error.response.data);
      console.error('Response error status:', error.response.status);
      console.error('Response error headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // This is a typical CORS or network error
      console.error('Request error (no response received):', error.request);
      console.error('This may be a CORS issue - check your browser console for more details');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;