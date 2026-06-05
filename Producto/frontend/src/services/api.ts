import type { Producto } from '../types';

const API_BASE = '/api';
const ACCESS_TOKEN_KEY = 'gecko_access_token';
const REFRESH_TOKEN_KEY = 'gecko_refresh_token';
const AUTH_USER_KEY = 'gecko_auth_user';
const SALE_PAYMENT_METHODS_KEY = 'gecko_sale_payment_methods';

export type UserRole = 'admin' | 'vendedor';

type ProductoBasePayload = {
  codigo_barras: string;
  nombre: string;
  descripcion: string;
  stock: number;
  precio_base: number;
  categoria: Producto['categoria'];
};

function toProductoBasePayload(data: Partial<Omit<Producto, 'id_producto'>>): ProductoBasePayload {
  return {
    codigo_barras: String(data.codigo_barras ?? '').trim(),
    nombre: String(data.nombre ?? '').trim(),
    descripcion: String(data.descripcion ?? '').trim(),
    stock: Number(data.stock ?? 0),
    precio_base: Number(data.precio_base ?? 0),
    categoria: (data.categoria ?? 'Carta') as Producto['categoria'],
  };
}

type ApiTopProducto = {
  id_producto__nombre: string;
  cantidad_vendida: number;
  veces_vendido: number;
};

type ApiBajoStockProducto = {
  id_producto: number;
  nombre: string;
  stock: number;
  precio_base: number;
};

type ApiIngresoCategoria = {
  id_producto__categoria: string;
  total_ingresos: number | string;
  cantidad_productos: number;
};

export type VentaDiaria = {
  fecha: string;
  ventas: number;
  transacciones: number;
  ticket_promedio: number;
};

export type VentaResumen = {
  id_venta: number;
  fecha_venta: string;
  total_pagado: number | string;
  metodo_pago?: string;
  usuario?: {
    username?: string;
  };
  detalles?: Array<{
    cantidad: number;
    precio_unitario: number | string;
    producto?: {
      nombre?: string;
    };
  }>;
};

export type TcgPlayerCard = {
  name: string;
  price: string;
  currency: string;
  set: string;
  source: string;
  url: string;
  image?: string;
};

export type CrearVentaPayload = {
  usuario_id: number;
  detalles: Array<{
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
  }>;
};

export type VentaCreada = {
  id_venta: number;
  fecha_venta: string;
  total_pagado: number | string;
};

export type UsuarioVenta = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  is_staff: boolean;
  rol_tipo?: string | null;
};

export type UsuarioGestion = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  is_staff: boolean;
  rol_tipo?: 'admin' | 'vendedor' | null;
  telefono?: string;
  estado?: 'activo' | 'inactivo';
};

export type UsuarioGestionPayload = {
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  password?: string;
  telefono?: string;
  estado?: 'activo' | 'inactivo';
  rol_tipo?: 'admin' | 'vendedor';
};

type AuthUser = {
  id: number;
  username: string;
  is_staff: boolean;
  rol?: UserRole | null;
};

type LoginResponse = {
  access: string;
  refresh: string;
  user: AuthUser;
};

function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getStoredAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function saveAuthUser(user: AuthUser) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

function readSalePaymentMethods(): Record<string, string> {
  try {
    const raw = localStorage.getItem(SALE_PAYMENT_METHODS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeSalePaymentMethods(value: Record<string, string>) {
  localStorage.setItem(SALE_PAYMENT_METHODS_KEY, JSON.stringify(value));
}

export function setVentaMetodoPago(ventaId: number, metodoPago: string) {
  const current = readSalePaymentMethods();
  current[String(ventaId)] = metodoPago;
  writeSalePaymentMethods(current);
}

export function getVentaMetodoPago(ventaId: number): string | undefined {
  const current = readSalePaymentMethods();
  return current[String(ventaId)];
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> | undefined),
  };

  const token = getAccessToken();
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (init?.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    headers,
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Error HTTP ${response.status}`);
  }

  // Some endpoints (for example DELETE) return 204 No Content.
  if (response.status === 204) {
    return undefined as T;
  }

  const raw = await response.text();
  if (!raw) {
    return undefined as T;
  }

  return JSON.parse(raw) as T;
}

function toList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === 'object' && Array.isArray((payload as { results?: unknown[] }).results)) {
    return (payload as { results: T[] }).results;
  }

  return [];
}

async function getPaginatedListAll<T>(initialUrl: string): Promise<T[]> {
  const aggregated: T[] = [];
  let nextUrl: string | null = initialUrl;

  while (nextUrl) {
    const pageData = await request<unknown>(nextUrl);

    if (Array.isArray(pageData)) {
      aggregated.push(...(pageData as T[]));
      break;
    }

    if (pageData && typeof pageData === 'object') {
      const asPaginated = pageData as { results?: unknown[]; next?: string | null };
      if (Array.isArray(asPaginated.results)) {
        aggregated.push(...(asPaginated.results as T[]));
        nextUrl = asPaginated.next ?? null;
        continue;
      }
    }

    break;
  }

  return aggregated;
}

export async function getProductos(): Promise<Producto[]> {
  const data = await request<unknown>(`${API_BASE}/productos/`);
  return toList<Producto>(data);
}

export async function getProductoPorCodigo(codigo: string): Promise<Producto | null> {
  try {
    return await request<Producto>(`${API_BASE}/productos/por_codigo/?codigo=${encodeURIComponent(codigo)}`);
  } catch {
    return null;
  }
}

export async function getProductoPorId(id: number): Promise<Producto> {
  return request<Producto>(`${API_BASE}/productos/${id}/`);
}

export async function crearProducto(data: Omit<Producto, 'id_producto'>): Promise<Producto> {
  const payload = toProductoBasePayload(data);
  return request<Producto>(`${API_BASE}/productos/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function actualizarProducto(id: number, data: Partial<Omit<Producto, 'id_producto'>>): Promise<Producto> {
  const payload = toProductoBasePayload(data);
  return request<Producto>(`${API_BASE}/productos/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function eliminarProducto(id: number): Promise<void> {
  await request(`${API_BASE}/productos/${id}/`, {
    method: 'DELETE',
  });
}

export async function getTopProductosVendidos(): Promise<ApiTopProducto[]> {
  const data = await request<{ datos: ApiTopProducto[] }>(`${API_BASE}/reportes/top_productos_vendidos/`);
  return data.datos ?? [];
}

export async function getTopProductosVendidosPorRango(fromDate?: string, toDate?: string): Promise<ApiTopProducto[]> {
  const query = new URLSearchParams();
  if (fromDate) query.set('from', fromDate);
  if (toDate) query.set('to', toDate);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const data = await request<{ datos: ApiTopProducto[] }>(`${API_BASE}/reportes/top_productos_vendidos/${suffix}`);
  return data.datos ?? [];
}

export async function getProductosBajoStock(): Promise<ApiBajoStockProducto[]> {
  const data = await request<{ datos: ApiBajoStockProducto[] }>(`${API_BASE}/reportes/productos_bajo_stock/`);
  return data.datos ?? [];
}

export async function getIngresosPorCategoria(): Promise<ApiIngresoCategoria[]> {
  const data = await request<{ datos: ApiIngresoCategoria[] }>(`${API_BASE}/reportes/ingresos_por_categoria/`);
  return data.datos ?? [];
}

export async function getIngresosPorCategoriaPorRango(fromDate?: string, toDate?: string): Promise<ApiIngresoCategoria[]> {
  const query = new URLSearchParams();
  if (fromDate) query.set('from', fromDate);
  if (toDate) query.set('to', toDate);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const data = await request<{ datos: ApiIngresoCategoria[] }>(`${API_BASE}/reportes/ingresos_por_categoria/${suffix}`);
  return data.datos ?? [];
}

export async function getVentasDiarias(fromDate?: string, toDate?: string): Promise<VentaDiaria[]> {
  const query = new URLSearchParams();
  if (fromDate) query.set('from', fromDate);
  if (toDate) query.set('to', toDate);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const data = await request<{ datos: VentaDiaria[] }>(`${API_BASE}/reportes/ventas_diarias/${suffix}`);
  return data.datos ?? [];
}

export async function getVentas(): Promise<VentaResumen[]> {
  const data = await request<unknown>(`${API_BASE}/ventas/`);
  return toList<VentaResumen>(data);
}

export async function getVentasHistoricas(): Promise<VentaResumen[]> {
  return getPaginatedListAll<VentaResumen>(`${API_BASE}/ventas/`);
}

export async function getUsuariosVenta(): Promise<UsuarioVenta[]> {
  const data = await request<unknown>(`${API_BASE}/usuarios/`);
  return toList<UsuarioVenta>(data);
}

export async function getUsuariosGestion(): Promise<UsuarioGestion[]> {
  const data = await request<unknown>(`${API_BASE}/usuarios/`);
  return toList<UsuarioGestion>(data);
}

export async function crearUsuarioGestion(payload: UsuarioGestionPayload): Promise<UsuarioGestion> {
  return request<UsuarioGestion>(`${API_BASE}/usuarios/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function actualizarUsuarioGestion(id: number, payload: UsuarioGestionPayload): Promise<UsuarioGestion> {
  return request<UsuarioGestion>(`${API_BASE}/usuarios/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function eliminarUsuarioGestion(id: number): Promise<{ detail?: string } | void> {
  return request<{ detail?: string }>(`${API_BASE}/usuarios/${id}/`, {
    method: 'DELETE',
  });
}

export async function crearVenta(payload: CrearVentaPayload): Promise<VentaCreada> {
  return request<VentaCreada>(`${API_BASE}/ventas/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function anularVenta(id: number): Promise<void> {
  await request(`${API_BASE}/ventas/${id}/anular/`, {
    method: 'POST',
  });

  const current = readSalePaymentMethods();
  if (String(id) in current) {
    delete current[String(id)];
    writeSalePaymentMethods(current);
  }
}

export async function buscarPrecioTcgPlayer(nombreCarta: string, numeroSerie?: string): Promise<TcgPlayerCard[]> {
  const numeroParam = numeroSerie?.trim() ? `&numero=${encodeURIComponent(numeroSerie.trim())}` : '';
  const data = await request<{ cards?: TcgPlayerCard[] }>(
    `${API_BASE}/tcgplayer/search-card-price/?nombre=${encodeURIComponent(nombreCarta)}${numeroParam}`
  );
  return data.cards ?? [];
}

export async function loginAdmin(username: string, password: string): Promise<AuthUser> {
  const data = await request<LoginResponse>(`${API_BASE}/auth/token/`, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh);
  const normalizedUser: AuthUser = {
    ...data.user,
    rol: data.user.is_staff ? 'admin' : (data.user.rol ?? 'vendedor'),
  };
  saveAuthUser(normalizedUser);
  return normalizedUser;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const data = await request<UsuarioVenta & { rol_tipo?: string | null }>(`${API_BASE}/usuarios/me/`);

  const rol = data.is_staff ? 'admin' : (data.rol_tipo === 'vendedor' ? 'vendedor' : 'vendedor');
  const user: AuthUser = {
    id: data.id,
    username: data.username,
    is_staff: data.is_staff,
    rol,
  };

  saveAuthUser(user);
  return user;
}

export async function getCurrentAdmin(): Promise<AuthUser> {
  // Compatibilidad con código existente.
  return getCurrentUser();
}

// --- PERFIL DEL USUARIO AUTENTICADO ---

export type UserProfileApi = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_staff: boolean;
  rol_tipo?: string | null;
  telefono?: string;
  estado?: string;
  puesto?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  bio?: string;
  avatar?: string;
};

export type ActualizarPerfilPayload = {
  first_name?: string;
  last_name?: string;
  email?: string;
  puesto?: string;
  fecha_nacimiento?: string | null;
  telefono?: string;
  direccion?: string;
  bio?: string;
  avatar?: string;
};

export async function getPerfilUsuarioApi(): Promise<UserProfileApi> {
  return request<UserProfileApi>(`${API_BASE}/usuarios/me/`);
}

export async function actualizarPerfilUsuarioApi(data: ActualizarPerfilPayload): Promise<UserProfileApi> {
  return request<UserProfileApi>(`${API_BASE}/usuarios/me/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
