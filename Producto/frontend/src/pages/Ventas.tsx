import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  anularVenta,
  crearVenta,
  getVentas,
  getStoredAuthUser,
  getProductoPorCodigo,
  getUsuariosVenta,
  setVentaMetodoPago,
  type CrearVentaPayload,
  type VentaResumen,
  type UsuarioVenta,
} from '../services/api';
import type { Producto } from '../types';

type MetodoPago = 'Efectivo' | 'Tarjeta' | 'Transferencia';

type CartItem = {
  producto: Producto;
  cantidad: number;
  precio_unitario: number;
};

const USUARIO_VENTA_DEFAULT = 1;
const NOTICE_TIMEOUT_MS = 1000;
const NOTICE_BANNER_CLASS = 'text-sm px-3 py-2 rounded-2xl border border-[#0B3D2E] bg-[#0B3D2E] text-white shadow-sm';
const IVA_RATE = 0.19;
const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

const formatCLP = (amount: number) => clpFormatter.format(amount);

function Ventas() {
  const authUser = getStoredAuthUser();
  const isVendedor = authUser?.rol === 'vendedor';
  const [codigo, setCodigo] = useState('');
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Efectivo');
  const [items, setItems] = useState<CartItem[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [usuarios, setUsuarios] = useState<UsuarioVenta[]>([]);
  const [usuarioVentaId, setUsuarioVentaId] = useState<number>(USUARIO_VENTA_DEFAULT);
  const [ultimaVenta, setUltimaVenta] = useState<VentaResumen | null>(null);

  const inputScannerRef = useRef<HTMLInputElement>(null);

  const enfocarScanner = useCallback(() => {
    inputScannerRef.current?.focus();
  }, []);

  const agregarPorCodigo = useCallback(async (codigoRaw: string) => {
    const codigoNormalizado = codigoRaw.trim();
    if (!codigoNormalizado) return;

    setError('');
    setMensaje('');

    const producto = await getProductoPorCodigo(codigoNormalizado);
    if (!producto) {
      setError(`No se encontró producto para el código ${codigoNormalizado}.`);
      return;
    }

    if (producto.stock <= 0) {
      setError(`Sin stock para ${producto.nombre}.`);
      return;
    }

    setItems((prev) => {
      const existente = prev.find((x) => x.producto.id_producto === producto.id_producto);
      if (!existente) {
        return [
          ...prev,
          {
            producto,
            cantidad: 1,
            precio_unitario: Number(producto.precio_base),
          },
        ];
      }

      const nuevaCantidad = existente.cantidad + 1;
      if (nuevaCantidad > producto.stock) {
        setError(`Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}.`);
        return prev;
      }

      return prev.map((item) =>
        item.producto.id_producto === producto.id_producto
          ? { ...item, cantidad: nuevaCantidad }
          : item
      );
    });

    setMensaje(`Código ${codigoNormalizado} verificado en stock: ${producto.nombre} agregado.`);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const data = await getUsuariosVenta();
        const activos = data.filter((u) => u.is_active);
        setUsuarios(activos);

        if (isVendedor && authUser?.id) {
          setUsuarioVentaId(authUser.id);
          return;
        }

        if (activos.length > 0) {
          const existeDefault = activos.some((u) => u.id === USUARIO_VENTA_DEFAULT);
          setUsuarioVentaId(existeDefault ? USUARIO_VENTA_DEFAULT : activos[0].id);
        }
      } catch {
        setUsuarios([]);
        if (isVendedor && authUser?.id) {
          setUsuarioVentaId(authUser.id);
        }
      }
    })();

    enfocarScanner();
  }, [authUser?.id, enfocarScanner, isVendedor]);

  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + item.cantidad, 0),
    [items]
  );

  const totalVenta = useMemo(
    () => items.reduce((acc, item) => acc + item.cantidad * Number(item.precio_unitario), 0),
    [items]
  );

  const ivaVenta = useMemo(
    () => Math.round(totalVenta * IVA_RATE),
    [totalVenta]
  );

  const totalConIva = useMemo(
    () => totalVenta + ivaVenta,
    [totalVenta, ivaVenta]
  );

  const handleScannerEnter = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;

    const scanned = codigo;
    setCodigo('');
    await agregarPorCodigo(scanned);
    enfocarScanner();
  };

  const actualizarCantidad = (idProducto: number, cantidadNueva: number) => {
    if (cantidadNueva <= 0) {
      setItems((prev) => prev.filter((item) => item.producto.id_producto !== idProducto));
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.producto.id_producto !== idProducto) return item;
        if (cantidadNueva > item.producto.stock) {
          setError(`Stock insuficiente para ${item.producto.nombre}. Disponible: ${item.producto.stock}.`);
          return item;
        }
        return { ...item, cantidad: cantidadNueva };
      })
    );
  };

  const quitarItem = (idProducto: number) => {
    setItems((prev) => prev.filter((item) => item.producto.id_producto !== idProducto));
  };

  const cargarUltimaVentaActiva = useCallback(async () => {
    try {
      const ventas = await getVentas();
      const ultima = ventas.find((venta: VentaResumen) => Number(venta.total_pagado) > 0) ?? null;
      setUltimaVenta(ultima);
    } catch {
      setUltimaVenta(null);
    }
  }, []);

  useEffect(() => {
    void cargarUltimaVentaActiva();
  }, [cargarUltimaVentaActiva]);

  useEffect(() => {
    if (!mensaje) return;
    const timer = window.setTimeout(() => setMensaje(''), NOTICE_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [mensaje]);

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => setError(''), NOTICE_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [error]);

  const confirmarVenta = async () => {
    if (items.length === 0) {
      setError('Debes escanear al menos un producto para vender.');
      return;
    }

    setGuardando(true);
    setError('');
    setMensaje('');

    const payload: CrearVentaPayload = {
      usuario_id: usuarioVentaId,
      detalles: items.map((item) => ({
        producto_id: item.producto.id_producto,
        cantidad: item.cantidad,
        precio_unitario: Number(item.precio_unitario),
      })),
    };

    try {
      const venta = await crearVenta(payload);
      setVentaMetodoPago(venta.id_venta, metodoPago);
      setItems([]);
      setMensaje(`Venta #${venta.id_venta} registrada correctamente (${metodoPago}).`);
      await cargarUltimaVentaActiva();
      enfocarScanner();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo registrar la venta.';
      setError(message);
    } finally {
      setGuardando(false);
    }
  };

  const anularUltimaVenta = async () => {
    setError('');
    setMensaje('');

    try {
      setGuardando(true);
      const ventas = await getVentas();
      const ultimaVentaActiva = ventas.find((venta: VentaResumen) => Number(venta.total_pagado) > 0);

      if (!ultimaVentaActiva) {
        setError('No hay ventas activas para anular.');
        return;
      }

      const confirmar = typeof window === 'undefined'
        ? true
        : window.confirm(`¿Anular la venta #${ultimaVentaActiva.id_venta}?`);

      if (!confirmar) {
        return;
      }

      await anularVenta(ultimaVentaActiva.id_venta);
      setMensaje(`Venta #${ultimaVentaActiva.id_venta} anulada correctamente.`);
      await cargarUltimaVentaActiva();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo anular la última venta.';
      setError(message);
    } finally {
      setGuardando(false);
      enfocarScanner();
    }
  };

  return (
    <div className="space-y-6 text-left">
      <section className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Caja / Ventas</h1>
          <p className="text-sm text-gray-500">
            Escanea con lector tipo teclado (USB o celular como pistola) para verificar stock y agregar al carrito.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            ref={inputScannerRef}
            className="border rounded-lg px-3 py-2 md:col-span-2"
            placeholder="Escanear código de barras y presionar Enter"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            onKeyDown={(e) => void handleScannerEnter(e)}
          />

          <button
            type="button"
            onClick={() => void (async () => {
              const scanned = codigo;
              setCodigo('');
              await agregarPorCodigo(scanned);
              enfocarScanner();
            })()}
            className="px-4 py-2 rounded-lg text-white bg-[#0B3D2E] hover:bg-[#0a4e3a] disabled:bg-[#0B3D2E] disabled:text-white disabled:opacity-100 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#0B3D2E', color: '#ffffff', opacity: 1 }}
            disabled={!codigo.trim()}
          >
            Agregar
          </button>

          <select
            className="border rounded-lg px-3 py-2"
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
          >
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Transferencia">Transferencia</option>
          </select>
        </div>

        <div className="text-xs text-gray-600 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          Modo sin cámara activo: usa el celular como lector tipo teclado con sufijo Enter.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Cajero/Vendedor</label>
            <select
              className="w-full mt-1 border rounded-lg px-3 py-2"
              value={usuarioVentaId}
              onChange={(e) => setUsuarioVentaId(Number(e.target.value))}
              disabled={usuarios.length === 0 || isVendedor}
            >
              {usuarios.length === 0 ? (
                <option value={USUARIO_VENTA_DEFAULT}>Usuario #1 (por defecto)</option>
              ) : (
                usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.first_name || u.last_name
                      ? `${u.first_name} ${u.last_name}`.trim()
                      : u.username}{' '}
                    (ID {u.id})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <span className="text-gray-600">Items: <strong>{totalItems}</strong></span>
          <span className="text-gray-600">Subtotal neto: <strong>{formatCLP(totalVenta)}</strong></span>
          <span className="text-gray-600">IVA (19%): <strong>{formatCLP(ivaVenta)}</strong></span>
          <span className="text-gray-600">Total con IVA: <strong>{formatCLP(totalConIva)}</strong></span>
          <button
            type="button"
            onClick={enfocarScanner}
            className="px-4 py-2 rounded-lg text-white bg-[#0B3D2E] hover:bg-[#0a4e3a] disabled:bg-[#0B3D2E] disabled:text-white disabled:opacity-100 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#0B3D2E', color: '#ffffff', opacity: 1 }}
          >
            Enfocar escáner
          </button>
        </div>

        <div className="rounded-lg border border-[#0B3D2E]/20 bg-[#edf8f1] px-4 py-3">
          <p className="text-xs uppercase tracking-wide font-semibold text-[#0B3D2E]">Ultima venta activa</p>
          {ultimaVenta ? (
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-700">
                {(() => {
                  const subtotal = Number(ultimaVenta.subtotal_neto ?? 0);
                  const iva = Number(ultimaVenta.iva ?? 0);
                  const total = Number(ultimaVenta.total_con_iva ?? ultimaVenta.total_pagado ?? 0);

                  return (
                    <>
                      <span className="mr-3"><strong>ID:</strong> #{ultimaVenta.id_venta}</span>
                      <span className="mr-3"><strong>Subtotal:</strong> {formatCLP(subtotal)}</span>
                      <span className="mr-3"><strong>IVA:</strong> {formatCLP(iva)}</span>
                      <span className="mr-3"><strong>Total:</strong> {formatCLP(total)}</span>
                      <span><strong>Fecha:</strong> {String(ultimaVenta.fecha_venta ?? '').replace('T', ' ').slice(0, 16)}</span>
                    </>
                  );
                })()}
              </div>
              <button
                type="button"
                onClick={() => void anularUltimaVenta()}
                className="px-3 py-1.5 rounded-lg text-white bg-[#0B3D2E] border border-[#0B3D2E] hover:bg-[#0a4e3a] disabled:opacity-60"
                disabled={guardando}
              >
                Anular esta venta
              </button>
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-600">No hay ventas activas para anular.</p>
          )}
        </div>

        {mensaje && (
          <div className={NOTICE_BANNER_CLASS}>
            {mensaje}
          </div>
        )}

        {error && (
          <div className={NOTICE_BANNER_CLASS}>
            {error}
          </div>
        )}
      </section>

      <section className="bg-white border rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Carrito</h2>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm border border-[#0B3D2E]/20 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-[#0a4e3a] border-b border-[#0B3D2E]/25 text-white">
                <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2 border-r border-[#0B3D2E]/30">Código</th>
                <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2 border-r border-[#0B3D2E]/30">Producto</th>
                <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2 border-r border-[#0B3D2E]/30">Precio (CLP)</th>
                <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2 border-r border-[#0B3D2E]/30">Cantidad</th>
                <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2 border-r border-[#0B3D2E]/30">Subtotal (CLP)</th>
                <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                    Carrito vacío. Escanea productos para comenzar.
                  </td>
                </tr>
              ) : (
                items.map((item, i) => {
                  const subtotal = item.cantidad * Number(item.precio_unitario);
                  return (
                    <tr key={item.producto.id_producto} className={`border-b border-[#0B3D2E]/10 transition-colors ${i % 2 ? 'bg-white hover:bg-[#edf8f1]' : 'bg-[#edf8f1] hover:bg-[#e3f3e9]'}`}>
                      <td className="px-3 py-2 font-mono text-xs text-center border-r border-gray-100">{item.producto.codigo_barras}</td>
                      <td className="px-3 py-2 text-center border-r border-gray-100">{item.producto.nombre}</td>
                      <td className="px-3 py-2 text-center border-r border-gray-100">{formatCLP(Number(item.precio_unitario))}</td>
                      <td className="px-3 py-2 text-center border-r border-gray-100">
                        <input
                          type="number"
                          min={1}
                          max={item.producto.stock}
                          value={item.cantidad}
                          onChange={(e) => actualizarCantidad(item.producto.id_producto, Number(e.target.value))}
                          className="w-20 border rounded px-2 py-1 text-center"
                        />
                      </td>
                      <td className="px-3 py-2 text-center font-semibold border-r border-gray-100">{formatCLP(subtotal)}</td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => quitarItem(item.producto.id_producto)}
                          className="px-3 py-1 rounded-lg text-white font-semibold !bg-red-600 border border-red-700 hover:!bg-red-700 shadow"
                          style={{ backgroundColor: '#dc2626', color: '#ffffff', opacity: 1 }}
                        >
                          Quitar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setItems([])}
            className="px-4 py-2 rounded-lg text-white bg-green-700 hover:bg-green-800 disabled:bg-green-700 disabled:text-white disabled:opacity-100 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#15803d', color: '#ffffff', opacity: 1 }}
            disabled={guardando || items.length === 0}
          >
            Vaciar carrito
          </button>
          <button
            type="button"
            onClick={() => void confirmarVenta()}
            disabled={guardando || items.length === 0}
            className="px-5 py-2 rounded-lg text-white bg-[#0B3D2E] hover:bg-[#0a4e3a] disabled:bg-[#0B3D2E] disabled:text-white disabled:opacity-100 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#0B3D2E', color: '#ffffff', opacity: 1 }}
          >
            {guardando ? 'Registrando...' : 'Confirmar venta'}
          </button>
        </div>
      </section>
    </div>
  );
}

export default Ventas;
