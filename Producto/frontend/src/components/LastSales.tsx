import type { VentaResumen } from "../services/api";

const METODO_BADGE: Record<string, string> = {
  Efectivo: "bg-green-100 text-green-700",
  Tarjeta: "bg-blue-100 text-blue-700",
  Transferencia: "bg-purple-100 text-purple-700",
};

type VentaTabla = {
  cliente: string;
  producto: string;
  total: number;
  metodo: string;
  hora: string;
};

const COLS = ["#", "Hora", "Cliente", "Producto", "Método", "Total"];

type Props = {
  ventas?: VentaResumen[];
};

export default function LastSales({ ventas = [] }: Props) {
  const ventasTabla: VentaTabla[] = ventas.map((v) => {
    const firstDetail = v.detalles?.[0];
    const total = typeof v.total_pagado === 'string' ? Number(v.total_pagado) : v.total_pagado;

    return {
      cliente: v.usuario?.username || 'Cliente',
      producto: firstDetail?.producto?.nombre || 'Producto',
      total: Number.isFinite(total) ? total : 0,
      metodo: 'Tarjeta',
      hora: new Date(v.fecha_venta).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
    };
  });

  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-gray-800">🧾 Últimas Ventas</h4>
        <span className="text-xs text-gray-400">Hoy · {ventasTabla.length} transacciones</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {COLS.map((col) => (
                <th
                  key={col}
                  className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-4 last:text-right last:pr-0"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ventasTabla.map((v, i) => (
              <tr
                key={i}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                {/* # */}
                <td className="py-3 pr-4 text-gray-400 font-medium w-8">{i + 1}</td>

                {/* Hora */}
                <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">{v.hora}</td>

                {/* Cliente */}
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {v.cliente[0]}
                    </div>
                    <span className="text-gray-700 font-medium">{v.cliente}</span>
                  </div>
                </td>

                {/* Producto */}
                <td className="py-3 pr-4 text-gray-700">{v.producto}</td>

                {/* Método */}
                <td className="py-3 pr-4">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      METODO_BADGE[v.metodo] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {v.metodo}
                  </span>
                </td>

                {/* Total */}
                <td className="py-3 text-right font-bold text-gray-800 whitespace-nowrap">
                  ${v.total.toLocaleString("es-CL")}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} className="pt-3 text-xs text-gray-400 font-medium">
                Total del día
              </td>
              <td className="pt-3 text-right font-bold text-emerald-700 text-sm">
                ${ventasTabla.reduce((s, v) => s + v.total, 0).toLocaleString("es-CL")}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}