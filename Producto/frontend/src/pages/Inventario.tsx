import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  getProductos,
} from '../services/api';
import type { Producto } from '../types';

type CategoriaFiltro = 'Todos' | 'Carta' | 'Sobre' | 'Caja';

const STOCK_MINIMO = 5;

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

const Inventario: React.FC = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaFiltro>('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [codigoEscaneado, setCodigoEscaneado] = useState('');
  const [productoResaltado, setProductoResaltado] = useState<number | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEliminar, setModalEliminar] = useState<Producto | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [form, setForm] = useState<Omit<Producto, 'id_producto'>>(productoVacio);
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [mensajeEscaner, setMensajeEscaner] = useState('');
  const [cargando, setCargando] = useState(true);
  const [errorGuardado, setErrorGuardado] = useState('');
  const [tipoEliminacion, setTipoEliminacion] = useState<'stock' | 'completo'>('stock');
  const [cantidadEliminar, setCantidadEliminar] = useState(1);
  const [errorEliminar, setErrorEliminar] = useState('');
  const [procesandoEliminar, setProcesandoEliminar] = useState(false);

  const inputEscanerRef = useRef<HTMLInputElement>(null);
  const filaResaltadaRef = useRef<HTMLTableRowElement>(null);

  const cargarProductos = useCallback(async () => {
    setCargando(true);
    try {
      const data = await getProductos();
      setProductos(data);
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

  // Mantener el foco en el input del escáner cuando no hay modal abierto
  useEffect(() => {
    if (!modalAbierto && !modalEliminar) {
      inputEscanerRef.current?.focus();
    }
  }, [modalAbierto, modalEliminar]);

  // Scroll automático al producto resaltado
  useEffect(() => {
    if (productoResaltado !== null && filaResaltadaRef.current) {
      filaResaltadaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [productoResaltado]);

  const productosFiltrados = productos.filter((p) => {
    const coincideCategoria = filtroCategoria === 'Todos' || p.categoria === filtroCategoria;
    const texto = busqueda.toLowerCase();
    const coincideBusqueda =
      p.nombre.toLowerCase().includes(texto) ||
      p.codigo_barras.includes(texto) ||
      p.descripcion.toLowerCase().includes(texto);
    return coincideCategoria && coincideBusqueda;
  });

  const handleEscaneo = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const codigo = codigoEscaneado.trim();
        if (!codigo) return;
        const encontrado = productos.find((p) => p.codigo_barras === codigo);
        if (encontrado) {
          setFiltroCategoria('Todos');
          setBusqueda('');
          setProductoResaltado(encontrado.id_producto);
          setMensajeEscaner(`✓ Producto encontrado: ${encontrado.nombre}`);
          setTimeout(() => {
            setProductoResaltado(null);
            setMensajeEscaner('');
          }, 3000);
        } else {
          setMensajeEscaner(`⚠ Código ${codigo} no encontrado. ¿Desea agregarlo?`);
          setForm({ ...productoVacio, codigo_barras: codigo });
          setModoEdicion(false);
          setModalAbierto(true);
        }
        setCodigoEscaneado('');
      }
    },
    [codigoEscaneado, productos]
  );

  const abrirAgregar = () => {
    setForm(productoVacio);
    setModoEdicion(false);
    setIdEditando(null);
    setErrorGuardado('');
    setModalAbierto(true);
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

  const confirmarEliminar = (producto: Producto) => {
    setTipoEliminacion(producto.stock > 0 ? 'stock' : 'completo');
    setCantidadEliminar(1);
    setErrorEliminar('');
    setModalEliminar(producto);
  };

  const eliminarProductoConfirmado = async () => {
    if (!modalEliminar) return;

    try {
      setProcesandoEliminar(true);
      setErrorEliminar('');

      if (tipoEliminacion === 'completo') {
        await eliminarProducto(modalEliminar.id_producto);
      } else {
        const cantidad = Number(cantidadEliminar);
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
          setErrorEliminar('Ingresa una cantidad válida mayor a 0.');
          return;
        }

        if (cantidad > modalEliminar.stock) {
          setErrorEliminar(`La cantidad no puede ser mayor al stock actual (${modalEliminar.stock}).`);
          return;
        }

        const nuevoStock = modalEliminar.stock - cantidad;
        const { id_producto, ...resto } = modalEliminar;
        void id_producto;

        await actualizarProducto(modalEliminar.id_producto, {
          ...resto,
          stock: nuevoStock,
        });
      }

      await cargarProductos();
      setModalEliminar(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo completar la eliminación.';
      setErrorEliminar(message);
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
          <p className="text-sm text-gray-500">{productos.length} productos en total</p>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            abrirAgregarEnVentana();
          }}
          type="button"
          className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-lg"
        >
          + Agregar producto
        </button>
      </div>

      {/* Barra de escáner + búsqueda + filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Input escáner (siempre enfocado cuando no hay modal) */}
        <div className="flex-1 relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 text-lg">⬛</span>
          <input
            ref={inputEscanerRef}
            type="text"
            value={codigoEscaneado}
            onChange={(e) => setCodigoEscaneado(e.target.value)}
            onKeyDown={handleEscaneo}
            placeholder="Escanear código de barras (Enter para buscar)..."
            className="w-full pl-9 pr-4 py-2 border border-primary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight bg-green-50"
          />
        </div>
        {/* Búsqueda manual */}
        <div className="flex-1 relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">🔍</span>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, código..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight"
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
        </div>
      </div>

      {/* Mensaje del escáner */}
      {mensajeEscaner && (
        <div
          className={`text-sm px-4 py-2 rounded-lg font-medium ${
            mensajeEscaner.startsWith('✓')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
          }`}
        >
          {mensajeEscaner}
        </div>
      )}

      {/* Tabla estilo Excel */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="px-3 py-3 font-semibold text-gray-600 whitespace-nowrap">Código Barras</th>
              <th className="px-3 py-3 font-semibold text-gray-600">Nombre</th>
              <th className="px-3 py-3 font-semibold text-gray-600">Categoría</th>
              <th className="px-3 py-3 font-semibold text-gray-600 whitespace-nowrap">Precio Base</th>
              <th className="px-3 py-3 font-semibold text-gray-600 text-center">Stock</th>
              <th className="px-3 py-3 font-semibold text-gray-600 text-center">Estado</th>
              {/* Columnas condicionales */}
              {(filtroCategoria === 'Todos' || filtroCategoria === 'Carta') && (
                <>
                  <th className="px-3 py-3 font-semibold text-gray-600">Rareza</th>
                  <th className="px-3 py-3 font-semibold text-gray-600">Edición</th>
                  <th className="px-3 py-3 font-semibold text-gray-600">Estado Carta</th>
                  <th className="px-3 py-3 font-semibold text-gray-600 whitespace-nowrap">Precio Mercado</th>
                </>
              )}
              {(filtroCategoria === 'Todos' || filtroCategoria === 'Sobre') && (
                <>
                  <th className="px-3 py-3 font-semibold text-gray-600 whitespace-nowrap">Cant. Cartas</th>
                  <th className="px-3 py-3 font-semibold text-gray-600">Serie</th>
                </>
              )}
              {(filtroCategoria === 'Todos' || filtroCategoria === 'Caja') && (
                <th className="px-3 py-3 font-semibold text-gray-600 whitespace-nowrap">Cant. Sobres</th>
              )}
              <th className="px-3 py-3 font-semibold text-gray-600 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={20} className="text-center py-10 text-gray-400">
                  Cargando productos...
                </td>
              </tr>
            ) : productosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={20} className="text-center py-10 text-gray-400">
                  No se encontraron productos.
                </td>
              </tr>
            ) : (
              productosFiltrados.map((p) => {
                const esResaltado = productoResaltado === p.id_producto;
                return (
                  <tr
                    key={p.id_producto}
                    ref={esResaltado ? filaResaltadaRef : null}
                    className={`border-b border-gray-100 transition-colors ${
                      esResaltado
                        ? 'bg-green-50 ring-2 ring-inset ring-primaryLight'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-3 py-2 font-mono text-xs text-gray-600 whitespace-nowrap">{p.codigo_barras}</td>
                    <td className="px-3 py-2 font-medium text-gray-800">{p.nombre}</td>
                    <td className="px-3 py-2">{badgeCategoria(p.categoria)}</td>
                    <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                      ${p.precio_base.toLocaleString('es-CL')}
                    </td>
                    <td className="px-3 py-2 text-center font-semibold text-gray-800">{p.stock}</td>
                    <td className="px-3 py-2 text-center">{badgeStock(p.stock)}</td>
                    {/* Columnas Carta */}
                    {(filtroCategoria === 'Todos' || filtroCategoria === 'Carta') && (
                      <>
                        <td className="px-3 py-2 text-gray-600">{p.rareza ?? '—'}</td>
                        <td className="px-3 py-2 text-gray-600">{p.edicion ?? '—'}</td>
                        <td className="px-3 py-2 text-gray-600">{p.estado ?? '—'}</td>
                        <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                          {p.precio_mercado != null ? `$${p.precio_mercado.toLocaleString('es-CL')}` : '—'}
                        </td>
                      </>
                    )}
                    {/* Columnas Sobre */}
                    {(filtroCategoria === 'Todos' || filtroCategoria === 'Sobre') && (
                      <>
                        <td className="px-3 py-2 text-gray-600 text-center">{p.cant_cartas ?? '—'}</td>
                        <td className="px-3 py-2 text-gray-600">{p.serie ?? '—'}</td>
                      </>
                    )}
                    {/* Columnas Caja */}
                    {(filtroCategoria === 'Todos' || filtroCategoria === 'Caja') && (
                      <td className="px-3 py-2 text-gray-600 text-center">{p.cant_sobres ?? '—'}</td>
                    )}
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      <button
                        onClick={() => abrirEditar(p)}
                        style={{ color: 'var(--primary)' }}
                        className="font-medium mr-3 text-xs hover:opacity-70"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => confirmarEliminar(p)}
                        className="text-red-500 hover:text-red-700 font-medium text-xs"
                      >
                        Eliminar
                      </button>
                    </td>
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
        <span className="text-red-500">
          Sin stock: {productos.filter((p) => p.stock === 0).length}
        </span>
        <span className="text-yellow-600">
          Stock bajo: {productos.filter((p) => p.stock > 0 && p.stock <= STOCK_MINIMO).length}
        </span>
      </div>

      {/* Modal Agregar / Editar */}
      {modalAbierto && renderInBody(
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
                <div className="text-sm px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700">
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
                  <label className="text-xs font-medium text-gray-600">Precio Base ($)</label>
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
                      <label className="text-xs font-medium text-gray-600">Precio Mercado ($)</label>
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
                className="btn-primary px-5 py-2 text-sm font-semibold rounded-lg"
              >
                {modoEdicion ? 'Guardar cambios' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminar */}
      {modalEliminar && renderInBody(
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-800">Eliminar producto</h2>
              <p className="text-sm text-gray-600">
                Producto: <strong>{modalEliminar.nombre}</strong> (stock actual: {modalEliminar.stock})
              </p>

              <div className="space-y-3">
                <label
                  className={`block border rounded-xl p-3 cursor-pointer transition ${
                    tipoEliminacion === 'stock'
                      ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="radio"
                      name="tipo-eliminacion"
                      checked={tipoEliminacion === 'stock'}
                      onChange={() => setTipoEliminacion('stock')}
                      disabled={procesandoEliminar}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Descontar por cantidad de stock</p>
                      <p className="text-xs text-gray-600">Reduce unidades y mantiene el producto en inventario.</p>
                    </div>
                  </div>

                  {tipoEliminacion === 'stock' && (
                    <div className="mt-3">
                      <label className="text-xs font-medium text-gray-600">Cantidad a descontar</label>
                      <input
                        type="number"
                        min={1}
                        max={Math.max(1, modalEliminar.stock)}
                        value={cantidadEliminar}
                        onChange={(e) => setCantidadEliminar(Number(e.target.value))}
                        disabled={procesandoEliminar}
                        className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Stock después de aceptar: {Math.max(0, modalEliminar.stock - Number(cantidadEliminar || 0))}
                      </p>
                    </div>
                  )}
                </label>

                <label
                  className={`block border rounded-xl p-3 cursor-pointer transition ${
                    tipoEliminacion === 'completo'
                      ? 'border-red-600 bg-red-50 ring-2 ring-red-200'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="radio"
                      name="tipo-eliminacion"
                      checked={tipoEliminacion === 'completo'}
                      onChange={() => setTipoEliminacion('completo')}
                      disabled={procesandoEliminar}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Eliminar producto completo</p>
                      <p className="text-xs text-red-700">Borra el producto de forma permanente.</p>
                    </div>
                  </div>
                </label>
              </div>

              {errorEliminar && (
                <div className="text-sm px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700">
                  {errorEliminar}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t rounded-b-2xl px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setModalEliminar(null)}
                disabled={procesandoEliminar}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => void eliminarProductoConfirmado()}
                disabled={procesandoEliminar}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-60"
              >
                {procesandoEliminar
                  ? 'Procesando...'
                  : tipoEliminacion === 'stock'
                    ? 'Descontar stock'
                    : 'Eliminar producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventario;
