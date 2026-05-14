type TopProducto = {
  nombre: string;
  cantidad_vendida: number;
};

const BADGE_COLORS = [
  "bg-yellow-400 text-yellow-900",
  "bg-gray-300 text-gray-800",
  "bg-orange-300 text-orange-900",
];

type Props = {
  topVendidos?: TopProducto[];
};

export default function TopProducts({ topVendidos = [] }: Props) {
  const top = topVendidos.slice(0, 5);

  return (
    <div className="bg-white p-5 rounded-xl shadow h-full">
      <h4 className="font-bold text-gray-800 mb-4">🔥 Top Productos Vendidos</h4>
      <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide py-2 px-2 border-r border-gray-200 w-10">#</th>
            <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide py-2 px-3 border-r border-gray-200">Producto</th>
            <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide py-2 px-3">Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {top.map((p, i) => (
            <tr key={`${p.nombre}-${i}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-2.5 px-2 border-r border-gray-100 align-middle">
                <span
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                    BADGE_COLORS[i] ?? "bg-gray-100 text-gray-600"
                  } mx-auto`}
                >
                  {i + 1}
                </span>
              </td>
              <td className="py-2.5 px-3 border-r border-gray-100 font-medium text-gray-800 text-center">{p.nombre}</td>
              <td className="py-2.5 px-3 text-center font-semibold text-emerald-700 whitespace-nowrap">{p.cantidad_vendida}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}