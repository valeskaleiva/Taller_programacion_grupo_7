export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  description?: string;
  imageUrl?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'employee';
  createdAt?: string;
}

export interface Sale {
  id: number;
  productId: number;
  userId: number;
  date: string;
  amount: number;
  totalPrice?: number;
}

export interface SaleDetail extends Sale {
  product?: Product;
  user?: User;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'employee';
  token: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  totalUsers: number;
  revenue: number;
}
