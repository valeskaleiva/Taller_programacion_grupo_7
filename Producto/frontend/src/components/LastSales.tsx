const METODO_BADGE: Record<string, string> = {
  Efectivo: "bg-green-100 text-green-700",
  Tarjeta: "bg-blue-100 text-blue-700",
  Transferencia: "bg-purple-100 text-purple-700",
};

const ventas = [
  { cliente: "Carlos Muñoz", producto: "Charizard EX", total: 32000, metodo: "Tarjeta", hora: "09:14" },
  { cliente: "Valentina P.", producto: "Sobre Paldea Evolved", total: 7000, metodo: "Efectivo", hora: "10:02" },
  { cliente: "Diego Rojas", producto: "Caja Elite Trainer", total: 45000, metodo: "Transferencia", hora: "11:38" },
  { cliente: "Camila Ávila", producto: "Pikachu V", total: 7500, metodo: "Tarjeta", hora: "13:50" },
  { cliente: "Lucas Torres", producto: "Mewtwo VSTAR", total: 22000, metodo: "Efectivo", hora: "15:22" },
];

const COLS = ["#", "Hora", "Cliente", "Producto", "Método", "Total"];

export default function LastSales() {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-gray-800">🧾 Últimas Ventas</h4>
        <span className="text-xs text-gray-400">Hoy · {ventas.length} transacciones</span>
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
            {ventas.map((v, i) => (
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
                ${ventas.reduce((s, v) => s + v.total, 0).toLocaleString("es-CL")}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}