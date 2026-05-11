import type { Producto } from '../types';

const API_BASE = '/api';

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

export type VentaResumen = {
  id_venta: number;
  fecha_venta: string;
  total_pagado: number | string;
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
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> | undefined),
  };

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

  return (await response.json()) as T;
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

export async function getProductosBajoStock(): Promise<ApiBajoStockProducto[]> {
  const data = await request<{ datos: ApiBajoStockProducto[] }>(`${API_BASE}/reportes/productos_bajo_stock/`);
  return data.datos ?? [];
}

export async function getIngresosPorCategoria(): Promise<ApiIngresoCategoria[]> {
  const data = await request<{ datos: ApiIngresoCategoria[] }>(`${API_BASE}/reportes/ingresos_por_categoria/`);
  return data.datos ?? [];
}

export async function getVentas(): Promise<VentaResumen[]> {
  const data = await request<unknown>(`${API_BASE}/ventas/`);
  return toList<VentaResumen>(data);
}

export async function getUsuariosVenta(): Promise<UsuarioVenta[]> {
  const data = await request<unknown>(`${API_BASE}/usuarios/`);
  return toList<UsuarioVenta>(data);
}

export async function crearVenta(payload: CrearVentaPayload): Promise<VentaCreada> {
  return request<VentaCreada>(`${API_BASE}/ventas/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function buscarPrecioTcgPlayer(nombreCarta: string, numeroSerie?: string): Promise<TcgPlayerCard[]> {
  const numeroParam = numeroSerie?.trim() ? `&numero=${encodeURIComponent(numeroSerie.trim())}` : '';
  const data = await request<{ cards?: TcgPlayerCard[] }>(
    `${API_BASE}/tcgplayer/search-card-price/?nombre=${encodeURIComponent(nombreCarta)}${numeroParam}`
  );
  return data.cards ?? [];
}
