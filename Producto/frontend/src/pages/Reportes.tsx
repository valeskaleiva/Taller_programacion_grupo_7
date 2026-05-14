import { useEffect, useMemo, useState } from 'react';
import {
  getTopProductosVendidosPorRango,
  getVentasDiarias,
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
  const [fromDate, setFromDate] = useState(firstDayOfMonthIso);
  const [toDate, setToDate] = useState(todayIso);
  const [metrics, setMetrics] = useState<VentaDiaria[]>([]);
  const [topProductos, setTopProductos] = useState<Array<{ id_producto__nombre: string; cantidad_vendida: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cargarReportes = async () => {
    try {
      setLoading(true);
      setError('');

      const [ventasDiarias, top] = await Promise.all([
        getVentasDiarias(fromDate, toDate),
        getTopProductosVendidosPorRango(fromDate, toDate),
      ]);

      setMetrics(ventasDiarias);
      setTopProductos(top);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudieron cargar los reportes.';
      setError(normalizeErrorMessage(message));
      setMetrics([]);
      setTopProductos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarReportes();
  }, []);

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
  };

  return (
    <div className="space-y-6 text-left">
      <section className="bg-white border rounded-2xl p-5 shadow-sm">
        <h2 className="text-2xl font-bold">Centro de Reportes</h2>
        <p className="text-sm text-gray-600 mt-1">
          Panel ejecutivo con datos reales para ventas y rendimiento de productos.
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
            onClick={() => void cargarReportes()}
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-slate-950 font-semibold rounded-lg px-4 py-2"
          >
            Generar reporte
          </button>
          <button
            onClick={exportarCsv}
            disabled={loading}
            className="bg-slate-700 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold rounded-lg px-4 py-2"
          >
            Exportar CSV
          </button>
        </div>

        {error && (
          <div className="mt-4 text-sm px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700">
            {error}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">Ventas acumuladas</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatCLP(totalVentas)}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">Transacciones</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{totalTransacciones}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">Ticket promedio</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatCLP(ticketPromedio)}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">Dias con ventas</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{diasConVentas}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <article className="bg-white border rounded-xl p-5 shadow-sm xl:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900">Ventas diarias (tabla)</h3>
          <p className="text-sm text-gray-500 mt-1">Registro diario de ventas y ticket promedio.</p>
          <div className="overflow-x-auto mt-4 max-h-72">
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-50 border-b sticky top-0">
                  <th className="text-center px-3 py-2 border-r border-gray-200">Fecha</th>
                  <th className="text-center px-3 py-2 border-r border-gray-200">Ventas (CLP)</th>
                  <th className="text-center px-3 py-2 border-r border-gray-200">Transacciones</th>
                  <th className="text-center px-3 py-2">Ticket promedio (CLP)</th>
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
                ) : ventasOrdenadas.map((item) => (
                  <tr key={item.fecha} className="border-b">
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
          <div className="overflow-x-auto mt-4 max-h-72">
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-50 border-b sticky top-0">
                  <th className="text-center px-3 py-2 border-r border-gray-200">#</th>
                  <th className="text-center px-3 py-2 border-r border-gray-200">Producto</th>
                  <th className="text-center px-3 py-2">Cantidad</th>
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
                  <tr key={item.id_producto__nombre} className="border-b">
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
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-center px-3 py-2 border-r border-gray-200">Fecha</th>
                <th className="text-center px-3 py-2 border-r border-gray-200">Ventas (CLP)</th>
                <th className="text-center px-3 py-2 border-r border-gray-200">Transacciones</th>
                <th className="text-center px-3 py-2">Ticket promedio (CLP)</th>
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
              ) : filtered.map((item) => (
                <tr key={item.fecha} className="border-b">
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
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-center px-3 py-2 border-r border-gray-200">Indicador</th>
                <th className="text-center px-3 py-2 border-r border-gray-200">Valor</th>
                <th className="text-center px-3 py-2">Detalle</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-3 py-2 border-r border-gray-100">Ventas acumuladas</td>
                <td className="px-3 py-2 text-center font-semibold border-r border-gray-100">{formatCLP(totalVentas)}</td>
                <td className="px-3 py-2 text-gray-600">Suma de total_pagado por dia</td>
              </tr>
              <tr className="border-b">
                <td className="px-3 py-2 border-r border-gray-100">Transacciones</td>
                <td className="px-3 py-2 text-center font-semibold border-r border-gray-100">{totalTransacciones}</td>
                <td className="px-3 py-2 text-gray-600">Cantidad de ventas registradas</td>
              </tr>
              <tr className="border-b">
                <td className="px-3 py-2 border-r border-gray-100">Ticket promedio</td>
                <td className="px-3 py-2 text-center font-semibold border-r border-gray-100">{formatCLP(ticketPromedio)}</td>
                <td className="px-3 py-2 text-gray-600">Ventas acumuladas / transacciones</td>
              </tr>
              <tr className="border-b">
                <td className="px-3 py-2 border-r border-gray-100">Producto mas vendido</td>
                <td className="px-3 py-2 text-center font-semibold border-r border-gray-100">{topProducto?.cantidad_vendida ?? 0}</td>
                <td className="px-3 py-2 text-gray-600">{topProducto?.id_producto__nombre ?? 'Sin datos para el rango'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Reportes;