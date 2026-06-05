import { useEffect, useMemo, useState } from 'react';
import {
  anularVenta,
  getStoredAuthUser,
  getVentas,
  getTopProductosVendidosPorRango,
  getVentasDiarias,
  type VentaResumen,
  type VentaDiaria,
} from '../services/api';

const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

const formatCLP = (amount: number) => clpFormatter.format(amount);

const toSafeNumber = (value: unknown): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value !== 'string') {
    return 0;
  }

  const cleaned = value.trim().replace(/\s/g, '').replace(/[^0-9,.-]/g, '');
  if (!cleaned) return 0;

  // Soporta formatos "12345.67", "12,345.67" y "12345,67".
  const normalized = cleaned.includes('.') && cleaned.includes(',')
    ? cleaned.replace(/,/g, '')
    : cleaned.replace(',', '.');

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const todayIso = new Date().toISOString().slice(0, 10);
const firstDayOfMonthIso = `${todayIso.slice(0, 8)}01`;
const NOTICE_TIMEOUT_MS = 1000;
const NOTICE_BANNER_CLASS = 'mt-4 text-sm px-3 py-2 rounded-2xl border border-[#0B3D2E] bg-[#0B3D2E] text-white shadow-sm';

const escapeCsv = (value: string | number) => {
  const raw = String(value ?? '');
  const escaped = raw.replace(/"/g, '""');
  return /[",;\n]/.test(escaped) ? `"${escaped}"` : escaped;
};

const normalizeErrorMessage = (message: string) => {
  const clean = message
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) {
    return 'No se pudieron cargar los reportes. Intenta nuevamente.';
  }

  if (clean.length > 220) {
    return 'No se pudieron cargar los reportes. Revisa conexión o parámetros e intenta nuevamente.';
  }

  return clean;
};

function Reportes() {
  const authUser = getStoredAuthUser();
  const puedeAnularVentas = Boolean(authUser);
  const [fromDate, setFromDate] = useState(firstDayOfMonthIso);
  const [toDate, setToDate] = useState(todayIso);
  const [metrics, setMetrics] = useState<VentaDiaria[]>([]);
  const [topProductos, setTopProductos] = useState<Array<{ id_producto__nombre: string; cantidad_vendida: number }>>([]);
  const [ventasRecientes, setVentasRecientes] = useState<VentaResumen[]>([]);
  const [loading, setLoading] = useState(false);
  const [anulandoVentaId, setAnulandoVentaId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  const lanzarAviso = (texto: string) => {
    setAviso('');
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => setAviso(texto));
      return;
    }
    setAviso(texto);
  };

  const cargarReportes = async (mostrarAviso = true) => {
    try {
      setLoading(true);
      setError('');

      const [ventasDiarias, top, ventas] = await Promise.all([
        getVentasDiarias(fromDate, toDate),
        getTopProductosVendidosPorRango(fromDate, toDate),
        getVentas(),
      ]);

      setMetrics(ventasDiarias);
      setTopProductos(top);
      setVentasRecientes(ventas);
      if (mostrarAviso) {
        lanzarAviso('Reporte generado correctamente.');
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudieron cargar los reportes.';
      setError(normalizeErrorMessage(message));
      setMetrics([]);
      setTopProductos([]);
      setVentasRecientes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarReportes(false);
  }, []);

  useEffect(() => {
    if (!aviso) return;
    const timer = window.setTimeout(() => setAviso(''), NOTICE_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [aviso]);

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => setError(''), NOTICE_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [error]);

  const filtered = useMemo(() => metrics, [metrics]);

  const totalVentas = useMemo(
    () => filtered.reduce((acc, item) => acc + toSafeNumber(item.ventas), 0),
    [filtered]
  );

  const totalTransacciones = useMemo(
    () => filtered.reduce((acc, item) => acc + toSafeNumber(item.transacciones), 0),
    [filtered]
  );

  const ticketPromedio = totalTransacciones > 0 ? Math.round(totalVentas / totalTransacciones) : 0;
  const diasConVentas = filtered.filter((item) => item.ventas > 0).length;
  const topProducto = topProductos[0];

  const ventasOrdenadas = useMemo(
    () => [...filtered].sort((a, b) => String(b.fecha).localeCompare(String(a.fecha))),
    [filtered]
  );

  const topProductosOrdenados = useMemo(
    () => [...topProductos].sort((a, b) => toSafeNumber(b.cantidad_vendida) - toSafeNumber(a.cantidad_vendida)),
    [topProductos]
  );

  const ventasEnRango = useMemo(
    () => ventasRecientes
      .filter((venta) => {
        const fecha = String(venta.fecha_venta ?? '').slice(0, 10);
        if (!fecha) return false;
        if (fromDate && fecha < fromDate) return false;
        if (toDate && fecha > toDate) return false;
        return true;
      })
      .sort((a, b) => String(b.fecha_venta).localeCompare(String(a.fecha_venta))),
    [ventasRecientes, fromDate, toDate]
  );

  const anularVentaSeleccionada = async (venta: VentaResumen) => {
    if (!venta?.id_venta) {
      return;
    }

    const anulada = toSafeNumber(venta.total_pagado) <= 0;
    if (anulada) {
      return;
    }

    const confirmar = typeof window === 'undefined'
      ? true
      : window.confirm(`¿Seguro que deseas anular la venta #${venta.id_venta}?`);

    if (!confirmar) return;

    try {
      setAnulandoVentaId(venta.id_venta);
      setError('');
      await anularVenta(venta.id_venta);
      lanzarAviso(`Venta #${venta.id_venta} anulada correctamente.`);
      await cargarReportes(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo anular la venta.';
      setError(normalizeErrorMessage(message));
    } finally {
      setAnulandoVentaId(null);
    }
  };

  const exportarCsv = () => {
    const rows: string[] = [];
    const rango = `${fromDate || 'sin_desde'}_a_${toDate || 'sin_hasta'}`;

    rows.push('Resumen');
    rows.push('Metrica,Valor');
    rows.push(`${escapeCsv('Ventas acumuladas CLP')},${escapeCsv(totalVentas)}`);
    rows.push(`${escapeCsv('Transacciones')},${escapeCsv(totalTransacciones)}`);
    rows.push(`${escapeCsv('Ticket promedio CLP')},${escapeCsv(ticketPromedio)}`);
    rows.push('');

    rows.push('Ventas diarias');
    rows.push('Fecha,Ventas CLP,Transacciones,Ticket promedio CLP');
    filtered.forEach((item) => {
      rows.push([
        escapeCsv(item.fecha),
        escapeCsv(item.ventas),
        escapeCsv(item.transacciones),
        escapeCsv(item.ticket_promedio),
      ].join(','));
    });
    rows.push('');

    rows.push('Top productos vendidos');
    rows.push('Producto,Cantidad vendida');
    topProductos.forEach((item) => {
      rows.push([
        escapeCsv(item.id_producto__nombre),
        escapeCsv(item.cantidad_vendida),
      ].join(','));
    });

    const csvText = rows.join('\n');
    const blob = new Blob(['\uFEFF' + csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_${rango}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    lanzarAviso('CSV exportado correctamente.');
  };

  return (
    <div className="space-y-6 text-left">
      {aviso && (
        <div className="fixed left-1/2 top-5 z-[9999] w-[min(92vw,420px)] -translate-x-1/2">
          <div className="rounded-2xl border border-[#0B3D2E] bg-[#0B3D2E] px-4 py-3 shadow-[0_14px_34px_rgba(11,61,46,0.24)]">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white">Aviso</p>
            <p className="text-sm text-white">{aviso}</p>
          </div>
        </div>
      )}

      <section className="bg-white border rounded-2xl p-5 shadow-sm">
        <h2 className="text-2xl font-bold">Panel Ejecutivo</h2>
        <p className="text-sm text-gray-600 mt-1">
          Visualiza métricas clave de ventas, rendimiento diario y productos más vendidos en el rango seleccionado. Exporta reportes detallados en CSV para análisis externo.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
          <input
            type="date"
            className="border border-gray-300 bg-white text-black rounded-lg px-3 py-2"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <input
            type="date"
            className="border border-gray-300 bg-white text-black rounded-lg px-3 py-2"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <button
            onClick={() => void cargarReportes(true)}
            disabled={loading}
            className="bg-[#0B3D2E] hover:bg-[#0a4e3a] disabled:opacity-60 text-white font-semibold rounded-lg px-4 py-2"
          >
            Generar reporte
          </button>
          <button
            onClick={exportarCsv}
            disabled={loading}
            className="bg-[#0B3D2E] hover:bg-[#0a4e3a] disabled:opacity-60 text-white font-semibold rounded-lg px-4 py-2"
          >
            Exportar CSV
          </button>
        </div>

        {error && (
          <div className={NOTICE_BANNER_CLASS}>
            {error}
          </div>
        )}
      </section>

      <section
        className="gap-4 text-center"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
      >
        <div className="rounded-xl border-2 border-[#0B3D2E] ring-1 ring-[#0B3D2E]/30 bg-gradient-to-b from-white to-emerald-50/60 p-4 shadow-md">
          <p className="dashboard-panel-font text-sm sm:text-base uppercase tracking-[0.1em] font-bold text-[#0B3D2E]">Ventas acumuladas</p>
          <p className="dashboard-panel-font mt-2 text-4xl sm:text-5xl font-extrabold leading-tight text-emerald-800">{formatCLP(totalVentas)}</p>
        </div>
        <div className="rounded-xl border-2 border-[#0B3D2E] ring-1 ring-[#0B3D2E]/30 bg-gradient-to-b from-white to-emerald-50/60 p-4 shadow-md">
          <p className="dashboard-panel-font text-sm sm:text-base uppercase tracking-[0.1em] font-bold text-[#0B3D2E]">Transacciones</p>
          <p className="dashboard-panel-font mt-2 text-4xl sm:text-5xl font-extrabold leading-tight text-emerald-800">{totalTransacciones}</p>
        </div>
        <div className="rounded-xl border-2 border-[#0B3D2E] ring-1 ring-[#0B3D2E]/30 bg-gradient-to-b from-white to-emerald-50/60 p-4 shadow-md">
          <p className="dashboard-panel-font text-sm sm:text-base uppercase tracking-[0.1em] font-bold text-[#0B3D2E]">Ticket promedio</p>
          <p className="dashboard-panel-font mt-2 text-4xl sm:text-5xl font-extrabold leading-tight text-emerald-800">{formatCLP(ticketPromedio)}</p>
        </div>
        <div className="rounded-xl border-2 border-[#0B3D2E] ring-1 ring-[#0B3D2E]/30 bg-gradient-to-b from-white to-emerald-50/60 p-4 shadow-md">
          <p className="dashboard-panel-font text-sm sm:text-base uppercase tracking-[0.1em] font-bold text-[#0B3D2E]">Dias con ventas</p>
          <p className="dashboard-panel-font mt-2 text-4xl sm:text-5xl font-extrabold leading-tight text-emerald-800">{diasConVentas}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <article className="bg-white border rounded-xl p-5 shadow-sm xl:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900">Ventas diarias (tabla)</h3>
          <p className="text-sm text-gray-500 mt-1">Registro diario de ventas y ticket promedio.</p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm border border-[#0B3D2E]/20 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-[#0a4e3a] border-b border-[#0B3D2E]/25 sticky top-0 text-white">
                  <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2 border-r border-[#0B3D2E]/30">Fecha</th>
                  <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2 border-r border-[#0B3D2E]/30">Ventas (CLP)</th>
                  <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2 border-r border-[#0B3D2E]/30">Transacciones</th>
                  <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2">Ticket promedio (CLP)</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-gray-500">Cargando reportes...</td>
                  </tr>
                ) : ventasOrdenadas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-gray-500">No hay datos para el rango seleccionado.</td>
                  </tr>
                ) : ventasOrdenadas.map((item, i) => (
                  <tr key={item.fecha} className={`border-b border-[#0B3D2E]/10 transition-colors ${i % 2 ? 'bg-white hover:bg-[#edf8f1]' : 'bg-[#edf8f1] hover:bg-[#e3f3e9]'}`}>
                    <td className="px-3 py-2 border-r border-gray-100 text-center">{item.fecha}</td>
                    <td className="px-3 py-2 border-r border-gray-100 text-center">{formatCLP(toSafeNumber(item.ventas))}</td>
                    <td className="px-3 py-2 border-r border-gray-100 text-center">{toSafeNumber(item.transacciones)}</td>
                    <td className="px-3 py-2 text-center">{formatCLP(toSafeNumber(item.ticket_promedio))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="bg-white border rounded-xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Top productos vendidos (tabla)</h3>
          <p className="text-sm text-gray-500 mt-1">Ranking de unidades vendidas en el rango.</p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm border border-[#0B3D2E]/20 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-[#0a4e3a] border-b border-[#0B3D2E]/25 sticky top-0 text-white">
                  <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2 border-r border-[#0B3D2E]/30">#</th>
                  <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2 border-r border-[#0B3D2E]/30">Producto</th>
                  <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-gray-500">Cargando reportes...</td>
                  </tr>
                ) : topProductosOrdenados.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-gray-500">Sin ventas en el rango seleccionado.</td>
                  </tr>
                ) : topProductosOrdenados.map((item, idx) => (
                  <tr key={item.id_producto__nombre} className={`border-b border-[#0B3D2E]/10 transition-colors ${idx % 2 ? 'bg-white hover:bg-[#edf8f1]' : 'bg-[#edf8f1] hover:bg-[#e3f3e9]'}`}>
                    <td className="px-3 py-2 border-r border-gray-100 text-center">{idx + 1}</td>
                    <td className="px-3 py-2 border-r border-gray-100 text-center">{item.id_producto__nombre}</td>
                    <td className="px-3 py-2 text-center font-semibold">{toSafeNumber(item.cantidad_vendida)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="bg-white border rounded-xl p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Tabla diaria para BI</h3>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm border border-[#0B3D2E]/20 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-[#0a4e3a] border-b border-[#0B3D2E]/25 text-white">
                <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2 border-r border-[#0B3D2E]/30">Fecha</th>
                <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2 border-r border-[#0B3D2E]/30">Ventas (CLP)</th>
                <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2 border-r border-[#0B3D2E]/30">Transacciones</th>
                <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2">Ticket promedio (CLP)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-gray-500">Cargando reportes...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-gray-500">No hay datos para el rango seleccionado.</td>
                </tr>
              ) : filtered.map((item, i) => (
                <tr key={item.fecha} className={`border-b border-[#0B3D2E]/10 transition-colors ${i % 2 ? 'bg-white hover:bg-[#edf8f1]' : 'bg-[#edf8f1] hover:bg-[#e3f3e9]'}`}>
                  <td className="px-3 py-2 border-r border-gray-100 text-center">{item.fecha}</td>
                  <td className="px-3 py-2 border-r border-gray-100 text-center">{formatCLP(item.ventas)}</td>
                  <td className="px-3 py-2 border-r border-gray-100 text-center">{item.transacciones}</td>
                  <td className="px-3 py-2 text-center">{formatCLP(item.ticket_promedio)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white border rounded-xl p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Resumen consolidado</h3>
        <p className="text-sm text-gray-500 mt-1">Vista ejecutiva del periodo seleccionado.</p>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm border border-[#0B3D2E]/20 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-[#0a4e3a] border-b border-[#0B3D2E]/25 text-white">
                <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2 border-r border-[#0B3D2E]/30">Indicador</th>
                <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2 border-r border-[#0B3D2E]/30">Valor</th>
                <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2">Detalle</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#0B3D2E]/10 bg-[#edf8f1]">
                <td className="px-3 py-2 border-r border-gray-100">Ventas acumuladas</td>
                <td className="px-3 py-2 text-center font-semibold border-r border-gray-100">{formatCLP(totalVentas)}</td>
                <td className="px-3 py-2 text-gray-600">Suma de total_pagado por dia</td>
              </tr>
              <tr className="border-b border-[#0B3D2E]/10 bg-white">
                <td className="px-3 py-2 border-r border-gray-100">Transacciones</td>
                <td className="px-3 py-2 text-center font-semibold border-r border-gray-100">{totalTransacciones}</td>
                <td className="px-3 py-2 text-gray-600">Cantidad de ventas registradas</td>
              </tr>
              <tr className="border-b border-[#0B3D2E]/10 bg-[#edf8f1]">
                <td className="px-3 py-2 border-r border-gray-100">Ticket promedio</td>
                <td className="px-3 py-2 text-center font-semibold border-r border-gray-100">{formatCLP(ticketPromedio)}</td>
                <td className="px-3 py-2 text-gray-600">Ventas acumuladas / transacciones</td>
              </tr>
              <tr className="border-b border-[#0B3D2E]/10 bg-white">
                <td className="px-3 py-2 border-r border-gray-100">Producto mas vendido</td>
                <td className="px-3 py-2 text-center font-semibold border-r border-gray-100">{topProducto?.cantidad_vendida ?? 0}</td>
                <td className="px-3 py-2 text-gray-600">{topProducto?.id_producto__nombre ?? 'Sin datos para el rango'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white border rounded-xl p-5 shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Ventas del periodo</h3>
            <p className="text-sm text-gray-500">Consulta de ventas dentro del rango seleccionado y anulación individual.</p>
          </div>
        </div>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm border border-[#0B3D2E]/20 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-[#0a4e3a] border-b border-[#0B3D2E]/25 text-white">
                <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2 border-r border-[#0B3D2E]/30">Venta #</th>
                <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2 border-r border-[#0B3D2E]/30">Fecha</th>
                <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2 border-r border-[#0B3D2E]/30">Usuario</th>
                <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2 border-r border-[#0B3D2E]/30">Total (CLP)</th>
                <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2 border-r border-[#0B3D2E]/30">Estado</th>
                <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-gray-500">Cargando ventas...</td>
                </tr>
              ) : ventasEnRango.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-gray-500">No hay ventas para el rango seleccionado.</td>
                </tr>
              ) : ventasEnRango.map((venta, idx) => (
                <tr key={venta.id_venta} className={`border-b border-[#0B3D2E]/10 transition-colors ${idx % 2 ? 'bg-white hover:bg-[#edf8f1]' : 'bg-[#edf8f1] hover:bg-[#e3f3e9]'}`}>
                  {(() => {
                    const anulada = toSafeNumber(venta.total_pagado) <= 0;
                    return (
                      <>
                  <td className="px-3 py-2 text-center border-r border-gray-100 font-semibold">{venta.id_venta}</td>
                  <td className="px-3 py-2 text-center border-r border-gray-100">{String(venta.fecha_venta ?? '').replace('T', ' ').slice(0, 16)}</td>
                  <td className="px-3 py-2 text-center border-r border-gray-100">{venta.usuario?.username ?? '-'}</td>
                  <td className="px-3 py-2 text-center border-r border-gray-100">{formatCLP(toSafeNumber(venta.total_pagado))}</td>
                  <td className="px-3 py-2 text-center border-r border-gray-100">
                    {anulada ? (
                      <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700">Anulada</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Activa</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {puedeAnularVentas ? (
                      <button
                        onClick={() => void anularVentaSeleccionada(venta)}
                        disabled={anulada || anulandoVentaId === venta.id_venta}
                        className="px-3 py-1 rounded-lg text-white font-semibold bg-[#0B3D2E] border border-[#0B3D2E] hover:bg-[#0a4e3a] disabled:opacity-60"
                      >
                        {anulada
                          ? 'Anulada'
                          : anulandoVentaId === venta.id_venta
                            ? 'Anulando...'
                            : 'Anular'}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500">Sin permisos</span>
                    )}
                  </td>
                      </>
                    );
                  })()}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Reportes;