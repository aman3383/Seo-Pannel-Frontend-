// API Configuration
const API_CONFIG = {
  // Base API URL - defaults to localhost:5000 if not set in environment
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  
  // Backend URL for direct file access (images, uploads, etc.)
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000',
  
  // Environment
  NODE_ENV: process.env.REACT_APP_NODE_ENV || 'development',
  
  // Timeout — long enough for Render free tier to wake up (up to 60 s)
  TIMEOUT: 65000,

  // Retry settings
  MAX_RETRIES: 2,
  RETRY_DELAY: 3000,
};

// Helper function to get full API URL
export const getApiUrl = (endpoint = '') => {
  return `${API_CONFIG.API_URL}${endpoint}`;
};

// Helper function to get full backend URL for file access
export const getBackendUrl = (path = '') => {
  return `${API_CONFIG.BACKEND_URL}${path}`;
};

// Helper function to check if we're in development
export const isDevelopment = () => {
  return API_CONFIG.NODE_ENV === 'development';
};

export default API_CONFIG; 