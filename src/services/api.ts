import { Product, CartItem, Order, User, LoginCredentials, RegisterData, AuthResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Token management
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

// API request helper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiRequest<{
      user: User;
      token: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      setAuthToken(response.token);
    }
    
    return {
      user: response.user,
      token: response.token,
      message: 'Login successful'
    };
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiRequest<{
      user: User;
      token: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.token) {
      setAuthToken(response.token);
    }
    
    return {
      user: response.user,
      token: response.token,
      message: 'Registration successful'
    };
  },

  async getProfile(): Promise<User> {
    const response = await apiRequest<{ user: User }>('/auth/me');
    return response.user;
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const response = await apiRequest<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.user;
  },

  async logout(): Promise<void> {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      removeAuthToken();
    }
  },

  async verifyToken(): Promise<User> {
    const response = await apiRequest<{ user: User }>('/auth/me');
    return response.user;
  },
};

// Product API
export const productAPI = {
  async getAll(): Promise<Product[]> {
    const response = await apiRequest<{
      products: Product[];
    }>('/products');
    return response.products;
  },

  async getById(id: string): Promise<Product> {
    const response = await apiRequest<{ product: Product }>(`/products/${id}`);
    return response.product;
  },

  async create(product: Omit<Product, 'id'>): Promise<Product> {
    const response = await apiRequest<{ product: Product }>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
    return response.product;
  },

  async update(id: string, product: Partial<Product>): Promise<Product> {
    const response = await apiRequest<{ product: Product }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
    return response.product;
  },

  async delete(id: string): Promise<void> {
    await apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// Cart API
export const cartAPI = {
  async addItem(productId: string, quantity: number): Promise<CartItem> {
    const response = await apiRequest<{ cart: any }>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
    
    // Find the added item in the cart
    const addedItem = response.cart.items.find((item: any) => 
      item.product._id === productId || item.product.id === productId
    );
    
    return {
      productId: addedItem.product._id || addedItem.product.id,
      quantity: addedItem.quantity,
      unit: addedItem.product.unit || 'piece',
      weight: addedItem.product.unit === 'kg' ? `${addedItem.quantity}kg` : undefined,
      unitPriceAtTime: addedItem.price,
      totalPriceAtTime: addedItem.price * addedItem.quantity
    };
  },

  async getItems(): Promise<CartItem[]> {
    const response = await apiRequest<{ cart: any }>('/cart');
    
    if (!response.cart || !response.cart.items) {
      return [];
    }
    
    return response.cart.items.map((item: any) => ({
      productId: item.product._id || item.product.id,
      quantity: item.quantity,
      unit: item.product.unit || 'piece',
      weight: item.product.unit === 'kg' ? `${item.quantity}kg` : undefined,
      unitPriceAtTime: item.price,
      totalPriceAtTime: item.price * item.quantity
    }));
  },

  async updateQuantity(cartItemId: string, quantity: number): Promise<CartItem> {
    // Extract productId from cartItemId if it's in format "productId_customizations"
    const productId = cartItemId.split('_')[0];
    
    const response = await apiRequest<{ cart: any }>(`/cart/items/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
    
    const updatedItem = response.cart.items.find((item: any) => 
      item.product._id === productId || item.product.id === productId
    );
    
    return {
      productId: updatedItem.product._id || updatedItem.product.id,
      quantity: updatedItem.quantity,
      unit: updatedItem.product.unit || 'piece',
      weight: updatedItem.product.unit === 'kg' ? `${updatedItem.quantity}kg` : undefined,
      unitPriceAtTime: updatedItem.price,
      totalPriceAtTime: updatedItem.price * updatedItem.quantity
    };
  },

  async removeItem(cartItemId: string): Promise<void> {
    // Extract productId from cartItemId if it's in format "productId_customizations"
    const productId = cartItemId.split('_')[0];
    
    await apiRequest(`/cart/items/${productId}`, {
      method: 'DELETE',
    });
  },
};

// Order API
export const orderAPI = {
  async create(orderData: {
    items: Array<{
      productId: string;
      quantity: number;
    }>;
    paymentMethod: string;
    address: string;
    phone: string;
    transactionId?: string;
  }): Promise<Order> {
    // Transform the order data to match the backend API
    const backendOrderData = {
      orderType: 'takeaway' as const,
      paymentMethod: orderData.paymentMethod as any,
      customerInfo: {
        name: 'Customer', // This should come from user profile
        phone: orderData.phone,
        address: {
          street: orderData.address
        }
      },
      specialInstructions: orderData.transactionId ? `Transaction ID: ${orderData.transactionId}` : undefined
    };

    const response = await apiRequest<{ order: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(backendOrderData),
    });
    
    return response.order;
  },

  async getAll(): Promise<Order[]> {
    const response = await apiRequest<{
      orders: Order[];
    }>('/orders/all');
    return response.orders;
  },
};

// Health check
export const healthAPI = {
  async check(): Promise<{ status: string; timestamp: string }> {
    const response = await apiRequest<{
      status: string;
      timestamp: string;
      message: string;
    }>('/health');
    
    return {
      status: response.status,
      timestamp: response.timestamp
    };
  },
};

// Utility function to generate session ID (kept for compatibility)
export const generateSessionId = (): string => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('sessionId', sessionId);
  return sessionId;
};

// Initialize session ID if not exists (kept for compatibility)
if (!localStorage.getItem('sessionId')) {
  generateSessionId();
}

// Token management utilities
export const tokenUtils = {
  getToken: getAuthToken,
  setToken: setAuthToken,
  removeToken: removeAuthToken,
  isAuthenticated: () => !!getAuthToken(),
};

// Create a default export for compatibility
const api = {
  auth: authAPI,
  products: productAPI,
  cart: cartAPI,
  orders: orderAPI,
  health: healthAPI,
};

export default api;