// src/types/index.ts

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock?: number;
  description?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role?: 'admin' | 'user';
}

export interface Sale {
  id: number;
  productId: number;
  userId: number;
  date: string;
  amount: number;
  total?: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type AuthAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface AppState {
  notifications: Notification[];
  sidebarOpen: boolean;
}

export type AppAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'TOGGLE_SIDEBAR' };
