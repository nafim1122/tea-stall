import axios from 'axios';
import { Product, CartItem, Order, User, LoginCredentials, RegisterData, AuthResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding session ID and auth token
api.interceptors.request.use((config) => {
  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add session ID for cart operations
  const sessionId = localStorage.getItem('sessionId') || 'guest';
  if (config.url?.includes('/cart/')) {
    config.headers['X-Session-ID'] = sessionId;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Product API
export const productAPI = {
  // Get all products
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  },

  // Get single product
  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Admin: Create product
  create: async (product: Omit<Product, 'id'>): Promise<Product> => {
    const response = await api.post('/admin/products', product);
    return response.data;
  },

  // Admin: Update product
  update: async (id: string, product: Partial<Product>): Promise<Product> => {
    const response = await api.put(`/admin/products/${id}`, product);
    return response.data;
  },

  // Admin: Delete product
  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/products/${id}`);
  },
};

// Cart API
export const cartAPI = {
  // Add item to cart
  addItem: async (productId: string, quantity: number): Promise<CartItem> => {
    const sessionId = localStorage.getItem('sessionId') || 'guest';
    const response = await api.post('/cart/add', {
      productId,
      quantity,
      sessionId,
    });
    return response.data;
  },

  // Get cart items
  getItems: async (): Promise<CartItem[]> => {
    const sessionId = localStorage.getItem('sessionId') || 'guest';
    const response = await api.get(`/cart/${sessionId}`);
    return response.data;
  },

  // Update cart item quantity
  updateQuantity: async (cartItemId: string, quantity: number): Promise<CartItem> => {
    const response = await api.put(`/cart/${cartItemId}`, { quantity });
    return response.data;
  },

  // Remove cart item
  removeItem: async (cartItemId: string): Promise<void> => {
    await api.delete(`/cart/${cartItemId}`);
  },
};

// Order API
export const orderAPI = {
  // Create order
  create: async (orderData: {
    items: Array<{
      productId: string;
      quantity: number;
    }>;
    paymentMethod: string;
    address: string;
    phone: string;
    transactionId?: string;
  }): Promise<Order> => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Admin: Get all orders
  getAll: async (): Promise<Order[]> => {
    const response = await api.get('/admin/orders');
    return response.data;
  },
};

// Authentication API
export const authAPI = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Register
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userId: string, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/auth/profile/${userId}`, data);
    return response.data;
  },

  // Logout (server-side cleanup if needed)
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  // Verify token
  verifyToken: async (): Promise<User> => {
    const response = await api.get('/auth/verify');
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};

// Utility function to generate session ID
export const generateSessionId = (): string => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('sessionId', sessionId);
  return sessionId;
};

// Initialize session ID if not exists
if (!localStorage.getItem('sessionId')) {
  generateSessionId();
}

export default api;