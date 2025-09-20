
export interface Product {
  id: number;
  name: string;
  base_price_per_kg: number;
  old_price_per_kg?: number;
  unit: 'kg' | 'piece';
  img: string;
  description?: string;
  category?: string;
  inStock?: boolean;
}

export interface CartItem {
  productId: number;
  quantity: number; // in kg or pieces
  unit: 'kg' | 'piece';
  unitPriceAtTime: number;
  totalPriceAtTime: number;
}

export interface OrderItem {
  name: string;
  quantity: number;
  unit: 'kg' | 'piece';
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  date: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  transactionId?: string;
  address?: string;
  phone?: string;
  status?: 'pending' | 'confirmed' | 'delivered';
}

export interface PaymentData {
  paymentMethod: string;
  transactionId?: string;
  address?: string;
  phone?: string;
}

// Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}
