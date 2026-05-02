import { mockProductos } from "../utils/mockData";

const BADGE_COLORS = [
  "bg-yellow-400 text-yellow-900",
  "bg-gray-300 text-gray-800",
  "bg-orange-300 text-orange-900",
];

export default function TopProducts() {
  const top = [...mockProductos]
    .filter((p) => p.categoria === "Carta" && p.precio_mercado)
    .sort((a, b) => (b.precio_mercado ?? 0) - (a.precio_mercado ?? 0))
    .slice(0, 5);

  return (
    <div className="bg-white p-5 rounded-xl shadow h-full">
      <h4 className="font-bold text-gray-800 mb-4">🔥 Top Cartas</h4>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-3 w-6">#</th>
            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-3">Carta</th>
            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-3">Rareza</th>
            <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2">Precio</th>
          </tr>
        </thead>
        <tbody>
          {top.map((p, i) => (
            <tr key={p.id_producto} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-2.5 pr-3">
                <span
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                    BADGE_COLORS[i] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {i + 1}
                </span>
              </td>
              <td className="py-2.5 pr-3 font-medium text-gray-800 max-w-[120px] truncate">{p.nombre}</td>
              <td className="py-2.5 pr-3 text-gray-400 text-xs">{p.rareza}</td>
              <td className="py-2.5 text-right font-semibold text-emerald-700 whitespace-nowrap">
                ${p.precio_mercado!.toLocaleString("es-CL")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}