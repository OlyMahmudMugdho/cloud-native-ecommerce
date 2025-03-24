import axios from 'axios';

const BASE_URL = '/inventory/api';

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

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
}


interface PaginatedResponse<T> {
  products: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

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
  getAll: (params: {
    name?: string;
    category?: string;
    price_min?: number;
    price_max?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  } = {}) => api.get<PaginatedResponse<Product>>('/products', { params }),
  getOne: (id: string) => api.get<Product>(`/products/${id}`),
  create: (data: FormData) =>
    api.post('/products', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  update: (id: string, data: FormData) =>
    api.put(`/products/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  delete: (id: string) => api.delete(`/products/${id}`),
};

export const categories = {
  getAll: () => api.get('/categories'),
  getOne: (id: string) => api.get(`/categories/${id}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

export const users = {
  getAll: () => api.get('/users', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
  getOne: (id: string) => api.get(`/users/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
  update: (id: string, data: any) => api.put(`/users/${id}`, data, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
  delete: (id: string) => api.delete(`/users/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
};

export default api;