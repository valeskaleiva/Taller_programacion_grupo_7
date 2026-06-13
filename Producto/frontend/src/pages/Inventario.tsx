import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  getStoredAuthUser,
  getProductos,
} from '../services/api';
import type { Producto } from '../types';

type CategoriaFiltro = 'Todos' | 'Carta' | 'Sobre' | 'Caja';
type OrdenInventario = 'default' | 'precio_asc' | 'precio_desc' | 'stock_asc' | 'stock_desc' | 'nombre_asc' | 'nombre_desc';
const HIDDEN_PRODUCTS_STORAGE_KEY = 'gecko_hidden_product_ids';
const SHOW_HIDDEN_STORAGE_KEY = 'gecko_show_hidden_products';
const ONLY_HIDDEN_STORAGE_KEY = 'gecko_only_hidden_products';
const NOTICE_TIMEOUT_MS = 4000;
const NOTICE_BANNER_CLASS = 'text-sm px-3 py-2 rounded-2xl border border-[#0B3D2E] bg-[#0B3D2E] text-white shadow-sm';

const STOCK_MINIMO = 5;
const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

const formatCLP = (amount: number) => clpFormatter.format(amount);

const quickOrderButtons: Array<{ value: OrdenInventario; label: string }> = [
  { value: 'precio_asc', label: 'Precio ↑' },
  { value: 'precio_desc', label: 'Precio ↓' },
  { value: 'stock_asc', label: 'Stock ↑' },
  { value: 'stock_desc', label: 'Stock ↓' },
];


const productoVacio: Omit<Producto, 'id_producto'> = {
  codigo_barras: '',
  nombre: '',
  descripcion: '',
  stock: 0,
  precio_base: 0,
  categoria: 'Carta',
  rareza: '',
  edicion: '',
  estado: 'Mint',
  precio_mercado: 0,
  cant_cartas: 0,
  serie: '',
  cant_sobres: 0,
};

const artificialProduct: Producto = {
  id_producto: -1,
  codigo_barras: '0000000000000',
  nombre: 'Producto Artificial',
  descripcion: 'Producto artificial de demostración',
  stock: 1,
  precio_base: 1000,
  categoria: 'Carta',
  rareza: 'Rara',
  edicion: 'Demo',
  estado: 'Nuevo',
  precio_mercado: 1000,
  cant_cartas: 1,
  serie: 'Demo',
  cant_sobres: 0,
};

const Inventario: React.FC = () => {
  const authUser = getStoredAuthUser();
  const canManageInventory = (authUser?.rol ?? 'admin') === 'admin';
  const navigate = useNavigate();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaFiltro>('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [ordenInventario, setOrdenInventario] = useState<OrdenInventario>('default');
  const [productoResaltado, setProductoResaltado] = useState<number | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [form, setForm] = useState<Omit<Producto, 'id_producto'>>(productoVacio);
  const [idEditando] = useState<number | null>(null);
  const [mensajeEscaner, setMensajeEscaner] = useState('');
  const [cargando, setCargando] = useState(true);
  const [errorGuardado, setErrorGuardado] = useState('');
  const [procesandoEliminar, setProcesandoEliminar] = useState(false);
  const [mostrarOcultos, setMostrarOcultos] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem(SHOW_HIDDEN_STORAGE_KEY) === 'true';
  });
  const [soloOcultos, setSoloOcultos] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem(ONLY_HIDDEN_STORAGE_KEY) === 'true';
  });
  const [productosOcultos, setProductosOcultos] = useState<number[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const raw = window.localStorage.getItem(HIDDEN_PRODUCTS_STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0);
    } catch {
      return [];
    }
  });

  const filaResaltadaRef = useRef<HTMLTableRowElement>(null);

  const cargarProductos = useCallback(async () => {
    setCargando(true);
    try {
      const data = await getProductos();
      setProductos(data.length > 0 ? data : [artificialProduct]);
    } catch (error) {
      setProductos([artificialProduct]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarProductos();
  }, [cargarProductos]);

  useEffect(() => {
    const onFocus = () => {
      void cargarProductos();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', onFocus);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', onFocus);
      }
    };
  }, [cargarProductos]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(HIDDEN_PRODUCTS_STORAGE_KEY, JSON.stringify(productosOcultos));
  }, [productosOcultos]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(SHOW_HIDDEN_STORAGE_KEY, String(mostrarOcultos));
  }, [mostrarOcultos]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(ONLY_HIDDEN_STORAGE_KEY, String(soloOcultos));
  }, [soloOcultos]);

  useEffect(() => {
    if (!mensajeEscaner) return;
    const timer = window.setTimeout(() => setMensajeEscaner(''), NOTICE_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [mensajeEscaner]);

  useEffect(() => {
    if (!errorGuardado) return;
    const timer = window.setTimeout(() => setErrorGuardado(''), NOTICE_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [errorGuardado]);

  useEffect(() => {
    if (soloOcultos && !mostrarOcultos) {
      setMostrarOcultos(true);
    }
  }, [soloOcultos, mostrarOcultos]);

  // Scroll automático al producto resaltado
  useEffect(() => {
    if (productoResaltado !== null && filaResaltadaRef.current) {
      filaResaltadaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [productoResaltado]);

  const productosFiltrados = productos.filter((p) => {
    const estaOculto = productosOcultos.includes(p.id_producto);

    if (soloOcultos && !estaOculto) {
      return false;
    }

    if (estaOculto && !mostrarOcultos) {
      return false;
    }

    const coincideCategoria = filtroCategoria === 'Todos' || p.categoria === filtroCategoria;
    const texto = busqueda.toLowerCase();
    const coincideBusqueda =
      p.nombre.toLowerCase().includes(texto) ||
      p.codigo_barras.includes(texto) ||
      p.descripcion.toLowerCase().includes(texto);
    return coincideCategoria && coincideBusqueda;
  });

  const productosFiltradosOrdenados = [...productosFiltrados].sort((a, b) => {
    switch (ordenInventario) {
      case 'precio_asc':
        return a.precio_base - b.precio_base;
      case 'precio_desc':
        return b.precio_base - a.precio_base;
      case 'stock_asc':
        return a.stock - b.stock;
      case 'stock_desc':
        return b.stock - a.stock;
      case 'nombre_asc':
        return a.nombre.localeCompare(b.nombre, 'es');
      case 'nombre_desc':
        return b.nombre.localeCompare(a.nombre, 'es');
      default:
        return 0;
    }
  });

  const alternarOculto = (productoId: number) => {
    const producto = productos.find((p) => p.id_producto === productoId);
    setProductosOcultos((prev) => {
      if (prev.includes(productoId)) {
        if (producto) {
          setMensajeEscaner(`Producto ${producto.nombre} visible nuevamente.`);
        }
        return prev.filter((id) => id !== productoId);
      }
      if (producto) {
        setMensajeEscaner(`Producto ${producto.nombre} ocultado.`);
      }
      return [...prev, productoId];
    });
  };

  const toggleMostrarOcultos = () => {
    setMostrarOcultos((prev) => {
      const next = !prev;
      if (!next) {
        setSoloOcultos(false);
      }
      return next;
    });
  };

  const toggleSoloOcultos = () => {
    setSoloOcultos((prev) => {
      const next = !prev;
      if (next) {
        setMostrarOcultos(true);
      }
      return next;
    });
  };


  const abrirAgregarEnVentana = () => {
    const destino = '/inventario/agregar';
    if (typeof window === 'undefined') {
      navigate(destino);
      return;
    }

    const popup = window.open(destino, '_blank', 'noopener,noreferrer');
    if (!popup) {
      navigate(destino);
    }
  };

  const abrirEditar = (producto: Producto) => {
    setMensajeEscaner(`Abriendo edición de ${producto.nombre}...`);
    const destino = `/inventario/editar/${producto.id_producto}`;
    if (typeof window === 'undefined') {
      navigate(destino);
      return;
    }

    const popup = window.open(
      destino,
      `editar_producto_${producto.id_producto}`,
      'popup=yes,width=980,height=760,resizable=yes,scrollbars=yes'
    );

    if (!popup) {
      navigate(destino);
    }
  };

  const confirmarEliminar = async (producto: Producto) => {
    const confirmar = typeof window === 'undefined'
      ? true
      : window.confirm(`¿Eliminar definitivamente el producto "${producto.nombre}"?`);

    if (!confirmar) return;

    try {
      setProcesandoEliminar(true);
      await eliminarProducto(producto.id_producto);
      await cargarProductos();
      setMensajeEscaner(`Producto ${producto.nombre} eliminado correctamente.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo eliminar el producto.';
      setMensajeEscaner(message);
    } finally {
      setProcesandoEliminar(false);
    }
  };

  const guardarProducto = async () => {
    if (!form.codigo_barras || !form.nombre) return;

    try {
      setErrorGuardado('');
      if (modoEdicion && idEditando !== null) {
        await actualizarProducto(idEditando, form);
      } else {
        await crearProducto(form);
      }

      await cargarProductos();
      setModalAbierto(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo guardar el producto.';
      setErrorGuardado(message);
    }
  };

  const badgeStock = (stock: number) => {
    if (stock === 0)
      return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Sin stock</span>;
    if (stock <= STOCK_MINIMO)
      return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Stock bajo</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Normal</span>;
  };

  const badgeCategoria = (cat: string) => {
    const colores: Record<string, string> = {
      Carta: 'bg-purple-100 text-purple-700',
      Sobre: 'bg-blue-100 text-blue-700',
      Caja: 'bg-orange-100 text-orange-700',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colores[cat] ?? 'bg-gray-100 text-gray-700'}`}>
        {cat}
      </span>
    );
  };

  const renderInBody = (node: React.ReactNode) => {
    if (typeof document === 'undefined') {
      return node;
    }
    return createPortal(node, document.body);
  };

  return (
    <div className="p-3 sm:p-6 space-y-4">
      {/* Encabezado */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventario</h1>
          <p className="text-sm text-gray-500">
            {productos.length} productos en total
            {!canManageInventory ? ' · Modo vendedor (solo lectura)' : ''}
          </p>
        </div>
        {canManageInventory && (
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                abrirAgregarEnVentana();
              }}
              type="button"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#0B3D2E] border border-[#0B3D2E] hover:bg-[#0a4e3a]"
            >
              + Agregar producto
            </button>
          </div>
        )}
      </div>

      {/* Búsqueda y filtros */}
      {mensajeEscaner && (
        <div className={NOTICE_BANNER_CLASS}>
          {mensajeEscaner}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Búsqueda manual */}
        <div className="flex-1 relative">
          <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">🔍</span>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, código..."
            className="w-full pl-4 pr-9 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight"
          />
        </div>
        {/* Filtro categoría */}
        <div className="flex flex-wrap gap-1">
          {(['Todos', 'Carta', 'Sobre', 'Caja'] as CategoriaFiltro[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setFiltroCategoria(cat)}
              style={filtroCategoria === cat ? { backgroundColor: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' } : {}}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                filtroCategoria === cat ? '' : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
          {canManageInventory && (
            <button
              onClick={toggleMostrarOcultos}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                mostrarOcultos
                  ? 'bg-[#0B3D2E] text-white border-[#0B3D2E]'
                  : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {mostrarOcultos ? 'Ocultos visibles' : 'Ver ocultos'}
            </button>
          )}
          {canManageInventory && (
            <button
              onClick={toggleSoloOcultos}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                soloOcultos
                  ? 'bg-[#0B3D2E] text-white border-[#0B3D2E]'
                  : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {soloOcultos ? 'Viendo ocultos' : `Ocultos (${productosOcultos.length})`}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-gray-500">Orden rápido:</span>
        {quickOrderButtons.map((item) => {
          const isActive = ordenInventario === item.value;
          return (
            <button
              key={item.value}
              onClick={() => setOrdenInventario(item.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                isActive
                  ? 'bg-[#0B3D2E] text-white border-[#0B3D2E]'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </button>
          );
        })}
        <button
          onClick={() => setOrdenInventario('default')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
            ordenInventario === 'default'
              ? 'bg-[#0B3D2E] text-white border-[#0B3D2E]'
              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Limpiar orden
        </button>
      </div>

      {/* Tabla estilo Excel */}
      <div className="overflow-x-auto max-h-72 overflow-y-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#0a4e3a] border-b border-[#0B3D2E]/25 text-center text-white">
              <th className="px-3 py-3 text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide whitespace-nowrap border-r border-[#0B3D2E]/30">Código Barras</th>
              <th className="px-3 py-3 text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide border-r border-[#0B3D2E]/30">Nombre</th>
              <th className="px-3 py-3 text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide border-r border-[#0B3D2E]/30">Categoría</th>
              <th className="px-3 py-3 text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide whitespace-nowrap border-r border-[#0B3D2E]/30">Precio Base (CLP)</th>
              <th className="px-3 py-3 text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide border-r-2 border-black">Stock</th>
              <th className="px-3 py-3 text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide border-l-2 border-black border-r-2 border-black">Estado</th>
               <th className="px-3 py-3 text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide text-center border-l-2 border-black">Acción</th>
              {/* Columnas condicionales */}
             
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={20} className="text-center py-10 text-gray-400">
                  Cargando productos...
                </td>
              </tr>
            ) : productosFiltradosOrdenados.length === 0 ? (
              <tr>
                <td colSpan={20} className="text-center py-10 text-gray-400">
                  No se encontraron productos.
                </td>
              </tr>
            ) : (
              productosFiltradosOrdenados.map((p, i) => {
                const esResaltado = productoResaltado === p.id_producto;
                const estaOculto = productosOcultos.includes(p.id_producto);
                return (
                  <tr
                    key={p.id_producto}
                    ref={esResaltado ? filaResaltadaRef : null}
                    className={`border-b border-gray-100 transition-colors ${
                      esResaltado
                        ? 'bg-green-50 ring-2 ring-inset ring-primaryLight'
                        : i % 2
                          ? 'bg-white hover:bg-[#edf8f1]'
                          : 'bg-[#edf8f1] hover:bg-[#e3f3e9]'
                    } ${estaOculto ? 'opacity-55' : ''}`}
                  >
                    <td className="px-3 py-2 font-mono text-xs text-gray-600 whitespace-nowrap border-r border-gray-100 text-center">{p.codigo_barras}</td>
                    <td className="px-3 py-2 font-medium text-gray-800 border-r border-gray-100 text-center">{p.nombre}</td>
                    <td className="px-3 py-2 border-r border-gray-100 text-center">{badgeCategoria(p.categoria)}</td>
                    <td className="px-3 py-2 text-gray-700 whitespace-nowrap border-r border-gray-100 text-center">{formatCLP(p.precio_base)}</td>
                    <td className="px-3 py-2 text-center font-semibold text-gray-800 border-r-2 border-black">{p.stock}</td>
                    <td className="px-3 py-2 text-center border-l-2 border-black border-r-2 border-black">{badgeStock(p.stock)}</td>
                   
                    {canManageInventory && (
                      <td className="px-3 py-2 text-center whitespace-nowrap border-l-2 border-black">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => abrirEditar(p)}
                            disabled={procesandoEliminar}
                            title={`Editar ${p.nombre}`}
                            className="inline-flex min-w-[74px] items-center justify-center px-4 py-2 text-xs font-semibold rounded-full border-2 border-[#0B3D2E] bg-[#0B3D2E] text-white shadow-sm hover:bg-[#0a4e3a] hover:border-[#0a4e3a] transition-colors disabled:bg-[#0B3D2E] disabled:text-white disabled:opacity-100 disabled:cursor-not-allowed"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => confirmarEliminar(p)}
                            disabled={procesandoEliminar}
                            title={`Eliminar ${p.nombre}`}
                            className="inline-flex min-w-[74px] items-center justify-center px-4 py-2 text-xs font-semibold rounded-full border-2 border-[#0B3D2E] bg-[#0B3D2E] text-white shadow-sm hover:bg-[#0a4e3a] hover:border-[#0a4e3a] transition-colors disabled:bg-[#0B3D2E] disabled:text-white disabled:opacity-100 disabled:cursor-not-allowed"
                          >
                            {procesandoEliminar ? 'Eliminando...' : 'Eliminar'}
                          </button>
                          <button
                            onClick={() => alternarOculto(p.id_producto)}
                            disabled={procesandoEliminar}
                            title={estaOculto ? `Mostrar ${p.nombre}` : `Ocultar ${p.nombre}`}
                            className="inline-flex min-w-[74px] items-center justify-center px-4 py-2 text-xs font-semibold rounded-full border-2 border-gray-400 bg-white text-gray-700 shadow-sm hover:bg-gray-100 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                          >
                            {estaOculto ? 'Mostrar' : 'Ocultar'}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Resumen pie de tabla */}
      <div className="flex flex-wrap gap-3 sm:gap-4 text-xs text-gray-500">
        <span>Mostrando {productosFiltrados.length} de {productos.length} productos</span>
        <span className="text-gray-600">Ocultos: {productosOcultos.length}</span>
        <span className="text-red-500">
          Sin stock: {productos.filter((p) => p.stock === 0).length}
        </span>
        <span className="text-yellow-600">
          Stock bajo: {productos.filter((p) => p.stock > 0 && p.stock <= STOCK_MINIMO).length}
        </span>
      </div>

      {/* Modal Agregar / Editar */}
      {modalAbierto && canManageInventory && renderInBody(
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">
                {modoEdicion ? 'Editar producto' : 'Agregar producto'}
              </h2>
              <button onClick={() => setModalAbierto(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="px-6 py-4 space-y-3">
              {errorGuardado && (
                <div className={NOTICE_BANNER_CLASS}>
                  {errorGuardado}
                </div>
              )}
              {/* Campos base */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Código de Barras *</label>
                  <input
                    type="text"
                    value={form.codigo_barras}
                    onChange={(e) => setForm({ ...form, codigo_barras: e.target.value })}
                    className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Categoría *</label>
                  <select
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value as Producto['categoria'] })}
                    className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight"
                  >
                    <option value="Carta">Carta</option>
                    <option value="Sobre">Sobre</option>
                    <option value="Caja">Caja</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Nombre *</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Descripción</label>
                <input
                  type="text"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Stock</label>
                  <input
                    type="number"
                    min={0}
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Precio Base (CLP)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.precio_base}
                    onChange={(e) => setForm({ ...form, precio_base: Number(e.target.value) })}
                    className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight"
                  />
                </div>
              </div>

              {/* Campos específicos por categoría */}
              {form.categoria === 'Carta' && (
                <>
                  <hr className="border-gray-100" />
                  <p className="text-xs font-semibold text-purple-600 uppercase">Datos de Carta</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Rareza</label>
                      <input type="text" value={form.rareza ?? ''} onChange={(e) => setForm({ ...form, rareza: e.target.value })} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Edición</label>
                      <input type="text" value={form.edicion ?? ''} onChange={(e) => setForm({ ...form, edicion: e.target.value })} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Estado</label>
                      <select value={form.estado ?? 'Mint'} onChange={(e) => setForm({ ...form, estado: e.target.value })} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight">
                        <option>Mint</option>
                        <option>Near Mint</option>
                        <option>Excellent</option>
                        <option>Good</option>
                        <option>Played</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Precio Mercado (CLP)</label>
                      <input type="number" min={0} value={form.precio_mercado ?? 0} onChange={(e) => setForm({ ...form, precio_mercado: Number(e.target.value) })} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight" />
                    </div>
                  </div>
                </>
              )}
              {form.categoria === 'Sobre' && (
                <>
                  <hr className="border-gray-100" />
                  <p className="text-xs font-semibold text-blue-600 uppercase">Datos de Sobre</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Cant. Cartas</label>
                      <input type="number" min={0} value={form.cant_cartas ?? 0} onChange={(e) => setForm({ ...form, cant_cartas: Number(e.target.value) })} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Serie</label>
                      <input type="text" value={form.serie ?? ''} onChange={(e) => setForm({ ...form, serie: e.target.value })} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight" />
                    </div>
                  </div>
                </>
              )}
              {form.categoria === 'Caja' && (
                <>
                  <hr className="border-gray-100" />
                  <p className="text-xs font-semibold text-orange-600 uppercase">Datos de Caja</p>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Cant. Sobres</label>
                    <input type="number" min={0} value={form.cant_sobres ?? 0} onChange={(e) => setForm({ ...form, cant_sobres: Number(e.target.value) })} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight" />
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
              <button onClick={() => setModalAbierto(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg">
                Cancelar
              </button>
              <button
                onClick={guardarProducto}
                disabled={!form.codigo_barras || !form.nombre}
                className="px-5 py-2 text-sm font-semibold rounded-lg text-white bg-[#0B3D2E] border border-[#0B3D2E] hover:bg-[#0a4e3a] disabled:bg-[#0B3D2E] disabled:text-white disabled:opacity-100 disabled:cursor-not-allowed"
              >
                {modoEdicion ? 'Guardar cambios' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Inventario;
