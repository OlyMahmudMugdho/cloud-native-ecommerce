import axios from 'axios';

const BASE_URL = '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  register: (email: string, password: string) =>
    api.post('/users/register', { email, password }),
  login: (email: string, password: string) =>
    api.post('/users/login', { email, password }),
  verifyEmail: (token: string) => api.get(`/users/verify/${token}`),
  requestPasswordReset: (email: string) =>
    api.post('/users/password/reset', { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post(`/users/password/reset/${token}`, { new_password: newPassword }),
};

export const products = {
  getAll: () => api.get('/products'),
  getOne: (id: string) => api.get(`/products/${id}`),
  create: (data: FormData) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

export const categories = {
  getAll: () => api.get('/categories'),
  getOne: (id: string) => api.get(`/categories/${id}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

export default api;
