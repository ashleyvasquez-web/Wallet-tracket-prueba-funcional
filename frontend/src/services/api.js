import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) => 
    api.post('/auth/token/', { username, password }),
  register: (userData) => 
    api.post('/users/', userData),
  me: () => 
    api.get('/users/me/'),
  updateSettings: (settings) => 
    api.put('/users/update_settings/', settings),
};

// Transactions API
export const transactionsAPI = {
  list: (params = {}) => 
    api.get('/transactions/transactions/', { params }),
  create: (data) => 
    api.post('/transactions/transactions/', data),
  update: (id, data) => 
    api.put(`/transactions/transactions/${id}/`, data),
  delete: (id) => 
    api.delete(`/transactions/transactions/${id}/`),
  summary: () => 
    api.get('/transactions/transactions/summary/'),
};

// Categories API
export const categoriesAPI = {
  list: () => 
    api.get('/transactions/categories/'),
  create: (data) => 
    api.post('/transactions/categories/', data),
  delete: (id) => 
    api.delete(`/transactions/categories/${id}/`),
};

// Budgets API
export const budgetsAPI = {
  list: () => 
    api.get('/transactions/budgets/'),
  create: (data) => 
    api.post('/transactions/budgets/', data),
  update: (id, data) => 
    api.put(`/transactions/budgets/${id}/`, data),
  delete: (id) => 
    api.delete(`/transactions/budgets/${id}/`),
};

// Rules API
export const rulesAPI = {
  list: () => 
    api.get('/rules/'),
  create: (data) => 
    api.post('/rules/', data),
  delete: (id) => 
    api.delete(`/rules/${id}/`),
};

export default api;