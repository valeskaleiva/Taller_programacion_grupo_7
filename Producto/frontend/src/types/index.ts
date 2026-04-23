export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'vendedor' | 'gerente';
  avatar?: string;
  creado_en: string;
}

export interface Product {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
  imagen?: string;
  creado_en: string;
}

export interface Sale {
  id: number;
  usuario_id: number;
  producto_id: number;
  cantidad: number;
  total: number;
  fecha: string;
  usuario?: User;
  producto?: Product;
}

export interface InventoryMovement {
  id: number;
  producto_id: number;
  tipo: 'entrada' | 'salida';
  cantidad: number;
  fecha: string;
  producto?: Product;
}

export interface AuthResponse {
  token: string;
  usuario: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}