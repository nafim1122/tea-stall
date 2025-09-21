
export interface Product {
  id: number;
  name: string;
  base_price_per_kg: number;
  price_per_half_kg?: number; // Independent pricing for half kg
  old_price_per_kg?: number;
  old_price_per_half_kg?: number; // Old price for half kg
  unit: 'kg' | 'piece';
  img: string;
  description?: string;
  category?: string;
  inStock?: boolean;
  hasWeightOptions?: boolean; // Whether product supports weight options
}

export interface CartItem {
  productId: number;
  quantity: number; // in kg or pieces
  unit: 'kg' | 'piece';
  weight?: string; // '1kg' or '0.5kg' for weight-based products
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
