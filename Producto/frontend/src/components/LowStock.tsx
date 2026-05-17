type BajoStockProducto = {
  id_producto: number;
  nombre: string;
  categoria: string;
  stock: number;
};

function stockBadge(stock: number) {
  if (stock === 0) return "bg-[#9fd9b1] text-[#073b2a] border-2 border-[#1f6b45] shadow-[0_0_0_1px_rgba(31,107,69,0.15)] font-bold";
  if (stock <= 3) return "bg-orange-100 text-orange-700 font-semibold";
  return "bg-yellow-100 text-yellow-700";
}

type Props = {
  productos?: BajoStockProducto[];
};

export default function LowStock({ productos = [] }: Props) {
  const bajoStock = [...productos].sort((a, b) => a.stock - b.stock);

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
        <h4 className="font-bold text-gray-800">⚠️ Stock Crítico</h4>
        <span className="inline-flex items-center justify-center min-w-7 h-7 text-xs bg-[#b7e4c7] text-[#073b2a] font-semibold px-2 rounded-full border border-[#1f6b45] shadow-[0_0_0_1px_rgba(31,107,69,0.12)]">
          {bajoStock.length} productos
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-[#0B3D2E]/20 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-[#0a4e3a] border-b border-[#0B3D2E]/25 text-white">
              <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide py-2 px-3 border-r border-[#0B3D2E]/30">Producto</th>
              <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide py-2 px-3 border-r border-[#0B3D2E]/30">Categoría</th>
              <th className="text-center text-xs font-semibold text-[#e4f3eb] uppercase tracking-wide py-2 px-3">Stock</th>
            </tr>
          </thead>
          <tbody>
            {bajoStock.map((p) => (
              <tr key={p.id_producto} className={`border-b border-[#0B3D2E]/10 transition-colors ${p.stock === 0 ? 'bg-[#b7e4c7] hover:bg-[#a3dcba]' : 'bg-white hover:bg-[#f6faf8]'}`}>
                <td className="py-2.5 px-3 border-r border-gray-100 font-medium text-gray-800 text-center">{p.nombre}</td>
                <td className="py-2.5 px-3 border-r border-gray-100 text-gray-500 text-xs text-center">{p.categoria}</td>
                <td className="py-2.5 px-3 text-center">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${stockBadge(p.stock)}`}>
                    {p.stock === 0 ? "Sin stock" : `${p.stock} uds.`}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}