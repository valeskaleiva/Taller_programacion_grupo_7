import type { VentaResumen } from "../services/api";

const METODO_BADGE: Record<string, string> = {
  Efectivo: "bg-green-100 text-green-700",
  Tarjeta: "bg-blue-100 text-blue-700",
  Transferencia: "bg-purple-100 text-purple-700",
  "N/D": "bg-gray-100 text-gray-600",
};

type Props = {
  ventas?: VentaResumen[];
};

const formatCLP = (value: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);

const formatHora = (fechaIso: string) => {
  const date = new Date(fechaIso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getCliente = (venta: VentaResumen) => {
  const username = venta.usuario?.username?.trim();
  return username ? username : "admin";
};

const getProducto = (venta: VentaResumen) => {
  const firstDetail = venta.detalles?.[0];
  const nombre = firstDetail?.producto?.nombre?.trim();
  return nombre ? nombre : "Sin detalle";
};

const toNumber = (value: number | string | undefined) => {
  const num = typeof value === "string" ? Number(value) : value ?? 0;
  return Number.isFinite(num) ? num : 0;
};

export default function LastSales({ ventas = [] }: Props) {
  const hoy = new Date();
  const hoyCount = ventas.filter((venta) => {
    const fecha = new Date(venta.fecha_venta);
    if (Number.isNaN(fecha.getTime())) return false;
    return (
      fecha.getFullYear() === hoy.getFullYear() &&
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getDate() === hoy.getDate()
    );
  }).length;

  return (
    <div
      className="dashboard-panel-font bg-white p-5 rounded-2xl h-full relative z-10"
      style={{
        border: "2px solid rgba(11, 61, 46, 0.35)",
        boxShadow: "0 38px 88px rgba(0, 0, 0, 0.42), 0 18px 42px rgba(11, 61, 46, 0.34)",
        transform: "translateY(-2px)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-gray-800">🧾 Últimas Ventas</h4>
        <span className="inline-flex items-center justify-center min-w-7 h-7 text-xs bg-[#b7e4c7] text-[#073b2a] font-semibold px-2 rounded-full border border-[#1f6b45] shadow-[0_0_0_1px_rgba(31,107,69,0.12)]">
          {hoyCount} transacciones
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-[#0B3D2E]/20 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-[#0a4e3a] border-b border-[#0B3D2E]/25 text-white">
              <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2 border-r border-[#0B3D2E]/30 w-10">#</th>
              <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2 border-r border-[#0B3D2E]/30">Hora</th>
              <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2 border-r border-[#0B3D2E]/30">Cliente</th>
              <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2 border-r border-[#0B3D2E]/30">Producto</th>
              <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2 border-r border-[#0B3D2E]/30">Método</th>
              <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide px-3 py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {ventas.length === 0 ? (
              <tr className="bg-white">
                <td className="px-3 py-4 text-center text-gray-500" colSpan={6}>
                  No hay ventas recientes.
                </td>
              </tr>
            ) : (
              ventas.map((venta, index) => {
                const metodo = venta.metodo_pago?.trim() || "N/D";
                return (
                  <tr
                    key={venta.id_venta}
                    className={`border-b border-[#0B3D2E]/10 transition-colors ${
                      index % 2 ? "bg-white hover:bg-[#edf8f1]" : "bg-[#edf8f1] hover:bg-[#e3f3e9]"
                    }`}
                  >
                    <td className="px-3 py-2 text-center border-r border-gray-100">{index + 1}</td>
                    <td className="px-3 py-2 text-center border-r border-gray-100">{formatHora(venta.fecha_venta)}</td>
                    <td className="px-3 py-2 text-center border-r border-gray-100">{getCliente(venta)}</td>
                    <td className="px-3 py-2 text-center border-r border-gray-100">{getProducto(venta)}</td>
                    <td className="px-3 py-2 text-center border-r border-gray-100">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                          METODO_BADGE[metodo] ?? METODO_BADGE["N/D"]
                        }`}
                      >
                        {metodo}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center font-semibold text-emerald-700 whitespace-nowrap">
                      {formatCLP(toNumber(venta.total_pagado))}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
