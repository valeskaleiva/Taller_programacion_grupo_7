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
    <div
      className="dashboard-panel-font bg-white p-5 rounded-2xl h-full relative z-10"
      style={{
        border: "2px solid rgba(11, 61, 46, 0.35)",
        boxShadow: "0 38px 88px rgba(0, 0, 0, 0.42), 0 18px 42px rgba(11, 61, 46, 0.34)",
        transform: "translateY(-2px)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-gray-800">🏆 Top Productos Vendidos</h4>
        <span className="inline-flex items-center justify-center min-w-7 h-7 text-xs bg-[#b7e4c7] text-[#073b2a] font-semibold px-2 rounded-full border border-[#1f6b45] shadow-[0_0_0_1px_rgba(31,107,69,0.12)]">
          {top.length} productos
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-[#0B3D2E]/20 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-[#0a4e3a] border-b border-[#0B3D2E]/25 text-white">
              <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide py-2 px-2 border-r border-[#0B3D2E]/30 w-10">#</th>
              <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide py-2 px-3 border-r border-[#0B3D2E]/30">Producto</th>
              <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide py-2 px-3">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {top.map((p, i) => (
              <tr key={`${p.nombre}-${i}`} className={`border-b border-[#0B3D2E]/10 transition-colors ${i % 2 ? 'bg-white hover:bg-[#edf8f1]' : 'bg-[#edf8f1] hover:bg-[#e3f3e9]'}`}>
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
    </div>
  );
}