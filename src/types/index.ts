
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
