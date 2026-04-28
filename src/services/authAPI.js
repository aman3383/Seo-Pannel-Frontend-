import axios from 'axios';
import API_CONFIG from '../config/api';

const API_BASE_URL = API_CONFIG.API_URL;

// Create axios instance with base configuration
const authAPI = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
authAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration and Render cold-start retries
authAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const isNetworkOrTimeout =
      !error.response &&
      (error.code === 'ECONNABORTED' ||
        error.code === 'ERR_NETWORK' ||
        error.code === 'ETIMEDOUT' ||
        error.message === 'Network Error');

    if (isNetworkOrTimeout && config && (config.__retryCount || 0) < API_CONFIG.MAX_RETRIES) {
      config.__retryCount = (config.__retryCount || 0) + 1;
      await new Promise((resolve) => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
      return authAPI(config);
    }

    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      // Login/register returning 401 means wrong credentials — just show the error, don't redirect
      if (!url.includes('/login') && !url.includes('/register')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API methods
export const authService = {
  // Login user
  login: (email, password) => {
    return authAPI.post('/login', { email, password });
  },

  // Register user
  register: (userData) => {
    return authAPI.post('/register', userData);
  },

  // Get user profile
  getProfile: () => {
    return authAPI.get('/profile');
  },

  // Update user profile
  updateProfile: (profileData) => {
    return authAPI.put('/profile', profileData);
  },

  // Change password
  changePassword: (passwordData) => {
    return authAPI.put('/change-password', passwordData);
  },
};

export { authAPI }; 