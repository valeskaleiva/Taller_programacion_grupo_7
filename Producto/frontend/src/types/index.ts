export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'vendedor' | 'gerente';
  avatar?: string;
  creado_en: string;
}

export interface UserProfile extends User {
  nombre_usuario: string;
  puesto: string;
  fecha_nacimiento: string;
  telefono?: string;
  direccion?: string;
  bio?: string;
}

export interface Vendedor {
  id: number;
  nombre: string;
  nombre_usuario: string;
  email: string;
  telefono?: string;
  estado: 'activo' | 'inactivo';
  creado_en: string;
}

// Mapeado de la tabla PRODUCTO
export interface Producto {
  id_producto: number;
  codigo_barras: string;
  nombre: string;
  descripcion: string;
  stock: number;
  precio_base: number;
  categoria: 'Carta' | 'Sobre' | 'Caja';
  // Subtipo Carta (PRODUCTO_CARTA)
  rareza?: string;
  edicion?: string;
  estado?: string;
  precio_mercado?: number;
  // Subtipo Sobre (PRODUCTO_SOBRE)
  cant_cartas?: number;
  serie?: string;
  // Subtipo Caja (PRODUCTO_CAJA)
  cant_sobres?: number;
}

// Alias para compatibilidad con el resto del sistema
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