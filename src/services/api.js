import axios from 'axios';
import API_CONFIG from '../config/api';

const API_URL = API_CONFIG.API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication and logging
api.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No auth token found in localStorage');
    }
    
    // If FormData, remove Content-Type header to let axios set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, config.data || '');
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging, auth handling, and Render wake-up retry
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  async (error) => {
    console.error('API Response Error:', error.response || error);

    const config = error.config;
    const isNetworkOrTimeout =
      !error.response &&
      (error.code === 'ECONNABORTED' ||
        error.code === 'ERR_NETWORK' ||
        error.code === 'ETIMEDOUT' ||
        error.message === 'Network Error');

    // Retry on network/timeout errors (Render cold-start)
    if (isNetworkOrTimeout && config && (config.__retryCount || 0) < API_CONFIG.MAX_RETRIES) {
      config.__retryCount = (config.__retryCount || 0) + 1;
      await new Promise((resolve) => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
      return api(config);
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Page API endpoints
export const getPages = async () => {
  try {
    const response = await api.get('/pages');
    return response.data;
  } catch (error) {
    console.error('Error in getPages:', error);
    throw error;
  }
};

export const getPageBySlug = async (slug) => {
  try {
    console.log('Calling getPageBySlug with slug:', slug);
    const response = await api.get(`/pages/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`Error in getPageBySlug for slug ${slug}:`, error);
    throw error;
  }
};

export const updatePageSEO = async (slug, pageData) => {
  try {
    console.log('Calling updatePageSEO with slug:', slug);
    const response = await api.put(`/pages/${slug}`, pageData);
    return response.data;
  } catch (error) {
    console.error(`Error in updatePageSEO for slug ${slug}:`, error);
    throw error;
  }
};

export const createPage = async (pageData) => {
  try {
    console.log('Calling createPage');
    const response = await api.post('/pages', pageData);
    return response.data;
  } catch (error) {
    console.error('Error in createPage:', error);
    throw error;
  }
};

// Blog API endpoints
export const getBlogs = async () => {
  const response = await api.get('/blogs');
  return response.data;
};

export const getBlogBySlug = async (slug) => {
  const response = await api.get(`/blogs/${slug}`);
  return response.data;
};

export const createBlog = async (blogData) => {
  const formData = new FormData();
  
  // Add text fields
  formData.append('title', blogData.title);
  formData.append('slug', blogData.slug);
  formData.append('content', blogData.content);
  if (blogData.country) formData.append('country', blogData.country);
  if (blogData.continent) formData.append('continent', blogData.continent);
  
  // Add SEO data
  formData.append('seo', JSON.stringify(blogData.seo));
  
  // Add image if exists
  if (blogData.image) {
    formData.append('image', blogData.image);
  }
  
  // Check for auth token (interceptor will add it to headers)
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Authentication token not found. Please log in again.');
  }
  
  // Use api instance - interceptor handles auth token and FormData Content-Type
  const response = await api.post('/blogs', formData);
  
  return response.data;
};

export const updateBlog = async (slug, blogData) => {
  const formData = new FormData();
  
  // Add text fields
  if (blogData.title) formData.append('title', blogData.title);
  if (blogData.content) formData.append('content', blogData.content);
  if (blogData.country) formData.append('country', blogData.country);
  if (blogData.continent) formData.append('continent', blogData.continent);
  
  // Add SEO data
  if (blogData.seo) formData.append('seo', JSON.stringify(blogData.seo));
  
  // Add image if exists
  if (blogData.image) {
    formData.append('image', blogData.image);
  }
  
  // Check for auth token (interceptor will add it to headers)
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Authentication token not found. Please log in again.');
  }
  
  // Use api instance - interceptor handles auth token and FormData Content-Type
  const response = await api.put(`/blogs/${slug}`, formData);
  
  return response.data;
};

export const deleteBlog = async (slug) => {
  const response = await api.delete(`/blogs/${slug}`);
  return response.data;
}; 