import { useMemo, useState } from 'react';

type DailyMetric = {
  fecha: string;
  ventas: number;
  transacciones: number;
  ticket_promedio: number;
};

const metricsMock: DailyMetric[] = [
  { fecha: '2026-04-20', ventas: 145990, transacciones: 11, ticket_promedio: 13272 },
  { fecha: '2026-04-21', ventas: 178500, transacciones: 14, ticket_promedio: 12750 },
  { fecha: '2026-04-22', ventas: 121990, transacciones: 9, ticket_promedio: 13554 },
  { fecha: '2026-04-23', ventas: 205430, transacciones: 17, ticket_promedio: 12084 },
  { fecha: '2026-04-24', ventas: 186220, transacciones: 15, ticket_promedio: 12414 },
];

function Reportes() {
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('2026-04-20');
  const [toDate, setToDate] = useState('2026-04-24');

  const filtered = useMemo(() => {
    return metricsMock.filter((item) => {
      const byText = item.fecha.includes(search.trim());
      const byDate = item.fecha >= fromDate && item.fecha <= toDate;
      return byText && byDate;
    });
  }, [search, fromDate, toDate]);

  const totalVentas = useMemo(
    () => filtered.reduce((acc, item) => acc + item.ventas, 0),
    [filtered]
  );

  const totalTransacciones = useMemo(
    () => filtered.reduce((acc, item) => acc + item.transacciones, 0),
    [filtered]
  );

  const ticketPromedio = totalTransacciones > 0 ? Math.round(totalVentas / totalTransacciones) : 0;

  return (
    <div className="space-y-6 text-left">
      <section className="bg-white border rounded-xl p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Centro de Reportes</h2>
        <p className="text-sm text-gray-500 mt-1">
          Esta vista queda lista para conectar Power BI con ventas diarias de tienda.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Buscar por fecha (YYYY-MM-DD)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            type="date"
            className="border rounded-lg px-3 py-2"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <input
            type="date"
            className="border rounded-lg px-3 py-2"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <button className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg px-4 py-2">
            Generar reporte
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">Ventas acumuladas</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">${totalVentas.toLocaleString('es-CL')}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">Transacciones</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{totalTransacciones}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">Ticket promedio</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">${ticketPromedio.toLocaleString('es-CL')}</p>
        </div>
      </section>

      <section className="bg-white border rounded-xl p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Tabla diaria para BI</h3>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-3 py-2">Fecha</th>
                <th className="text-right px-3 py-2">Ventas</th>
                <th className="text-right px-3 py-2">Transacciones</th>
                <th className="text-right px-3 py-2">Ticket Promedio</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.fecha} className="border-b">
                  <td className="px-3 py-2">{item.fecha}</td>
                  <td className="px-3 py-2 text-right">${item.ventas.toLocaleString('es-CL')}</td>
                  <td className="px-3 py-2 text-right">{item.transacciones}</td>
                  <td className="px-3 py-2 text-right">${item.ticket_promedio.toLocaleString('es-CL')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white border rounded-xl p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Power BI Embed (placeholder)</h3>
        <p className="text-sm text-gray-500 mt-1">
          Reemplaza este bloque por el iframe seguro o el SDK de Power BI cuando conectemos tenant/workspace.
        </p>
        <div className="mt-4 h-[420px] rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-500">
          Aquí irá el reporte de Power BI embebido
        </div>

        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          Campos recomendados para el modelo analítico: fecha, id_venta, id_producto, id_vendedor, cantidad, total, margen, metodo_pago y sucursal.
        </div>
      </section>
    </div>
  );
}

export default Reportes;