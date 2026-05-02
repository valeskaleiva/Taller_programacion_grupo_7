// Mock API — reemplazar cada función con fetch() real cuando el back esté listo
import { mockProductos } from '../utils/mockData';
import type { Producto, UserProfile, Vendedor } from '../types';

// Simula latencia de red
const delay = (ms = 200) => new Promise((res) => setTimeout(res, ms));

// Estado local mutable (simula la BD en memoria)
let _productos: Producto[] = [...mockProductos];

const STORAGE_PROFILE_KEY = 'perfilUsuario';

const DEFAULT_PROFILE: UserProfile = {
  id: 1,
  nombre: 'Valentina Herrera',
  nombre_usuario: 'valeh_admin',
  email: 'valentina@tienda.com',
  rol: 'admin',
  puesto: 'Administrador de tienda',
  fecha_nacimiento: '1998-05-14',
  telefono: '+56 9 1234 5678',
  direccion: 'Santiago, Chile',
  bio: 'Fan del TCG y responsable de inventario y ventas.',
  avatar: 'https://i.pravatar.cc/220?img=12',
  creado_en: '2026-01-10',
};

function loadProfileFromStorage(): UserProfile {
  if (typeof window === 'undefined') {
    return DEFAULT_PROFILE;
  }

  const raw = window.localStorage.getItem(STORAGE_PROFILE_KEY);
  if (!raw) {
    return DEFAULT_PROFILE;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch {
    return DEFAULT_PROFILE;
  }
}

let _perfilUsuario: UserProfile = loadProfileFromStorage();

function saveProfileToStorage(profile: UserProfile): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
}

// --- PRODUCTOS ---

export async function getProductos(): Promise<Producto[]> {
  await delay();
  return [..._productos];
}

export async function getProductoPorCodigo(codigo: string): Promise<Producto | null> {
  await delay();
  return _productos.find((p) => p.codigo_barras === codigo) ?? null;
}

export async function getProductoPorId(id: number): Promise<Producto | null> {
  await delay();
  return _productos.find((p) => p.id_producto === id) ?? null;
}

export async function crearProducto(data: Omit<Producto, 'id_producto'>): Promise<Producto> {
  await delay();
  const nuevoId = Math.max(..._productos.map((p) => p.id_producto), 0) + 1;
  const nuevo: Producto = { ...data, id_producto: nuevoId };
  _productos = [..._productos, nuevo];
  return nuevo;
}

export async function actualizarProducto(id: number, data: Partial<Omit<Producto, 'id_producto'>>): Promise<Producto> {
  await delay();
  _productos = _productos.map((p) => (p.id_producto === id ? { ...p, ...data } : p));
  const actualizado = _productos.find((p) => p.id_producto === id);
  if (!actualizado) throw new Error(`Producto con id ${id} no encontrado`);
  return actualizado;
}

export async function eliminarProducto(id: number): Promise<void> {
  await delay();
  _productos = _productos.filter((p) => p.id_producto !== id);
}

// --- PERFIL DE USUARIO ---

export async function getPerfilUsuario(): Promise<UserProfile> {
  await delay();
  return { ..._perfilUsuario };
}

export async function actualizarPerfilUsuario(data: Partial<UserProfile>): Promise<UserProfile> {
  await delay();
  _perfilUsuario = { ..._perfilUsuario, ...data };
  saveProfileToStorage(_perfilUsuario);
  return { ..._perfilUsuario };
}

// --- VENDEDORES ---

const STORAGE_VENDEDORES_KEY = 'vendedores';

const DEFAULT_VENDEDORES: Vendedor[] = [
  { id: 1, nombre: 'Carlos Muñoz', nombre_usuario: 'carlos_v', email: 'carlos@tienda.com', telefono: '+56 9 8765 4321', estado: 'activo', creado_en: '2026-02-01' },
  { id: 2, nombre: 'Gabriela Reyes', nombre_usuario: 'gaby_v', email: 'gabriela@tienda.com', telefono: '+56 9 9111 2233', estado: 'activo', creado_en: '2026-03-15' },
  { id: 3, nombre: 'Pedro Soto', nombre_usuario: 'pedro_v', email: 'pedro@tienda.com', estado: 'inactivo', creado_en: '2026-01-20' },
];

function loadVendedoresFromStorage(): Vendedor[] {
  const raw = window.localStorage.getItem(STORAGE_VENDEDORES_KEY);
  if (!raw) return DEFAULT_VENDEDORES;
  try { return JSON.parse(raw) as Vendedor[]; } catch { return DEFAULT_VENDEDORES; }
}

let _vendedores: Vendedor[] = loadVendedoresFromStorage();

function saveVendedoresToStorage(v: Vendedor[]): void {
  window.localStorage.setItem(STORAGE_VENDEDORES_KEY, JSON.stringify(v));
}

export async function getVendedores(): Promise<Vendedor[]> {
  await delay();
  return [..._vendedores];
}

export async function crearVendedor(data: Omit<Vendedor, 'id' | 'creado_en'>): Promise<Vendedor> {
  await delay();
  const nuevo: Vendedor = {
    ...data,
    id: Math.max(..._vendedores.map((v) => v.id), 0) + 1,
    creado_en: new Date().toISOString().slice(0, 10),
  };
  _vendedores = [..._vendedores, nuevo];
  saveVendedoresToStorage(_vendedores);
  return nuevo;
}

export async function actualizarVendedor(id: number, data: Partial<Omit<Vendedor, 'id' | 'creado_en'>>): Promise<Vendedor> {
  await delay();
  _vendedores = _vendedores.map((v) => (v.id === id ? { ...v, ...data } : v));
  saveVendedoresToStorage(_vendedores);
  const actualizado = _vendedores.find((v) => v.id === id);
  if (!actualizado) throw new Error(`Vendedor ${id} no encontrado`);
  return actualizado;
}

export async function eliminarVendedor(id: number): Promise<void> {
  await delay();
  _vendedores = _vendedores.filter((v) => v.id !== id);
  saveVendedoresToStorage(_vendedores);
}

