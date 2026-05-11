type BajoStockProducto = {
  id_producto: number;
  nombre: string;
  categoria: string;
  stock: number;
};

function stockBadge(stock: number) {
  if (stock === 0) return "bg-red-100 text-red-700 font-bold";
  if (stock <= 3) return "bg-orange-100 text-orange-700 font-semibold";
  return "bg-yellow-100 text-yellow-700";
}

type Props = {
  productos?: BajoStockProducto[];
};

export default function LowStock({ productos = [] }: Props) {
  const bajoStock = [...productos].sort((a, b) => a.stock - b.stock);

  return (
    <div className="bg-white p-5 rounded-xl shadow h-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-gray-800">⚠️ Stock Crítico</h4>
        <span className="text-xs bg-orange-50 text-orange-600 font-semibold px-2 py-0.5 rounded-full border border-orange-200">
          {bajoStock.length} productos
        </span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-3">Producto</th>
            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-3">Categoría</th>
            <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2">Stock</th>
          </tr>
        </thead>
        <tbody>
          {bajoStock.map((p) => (
            <tr key={p.id_producto} className={`border-b border-gray-50 transition-colors ${p.stock === 0 ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-50"}`}>
              <td className="py-2.5 pr-3 font-medium text-gray-800 max-w-[140px] truncate">{p.nombre}</td>
              <td className="py-2.5 pr-3 text-gray-400 text-xs">{p.categoria}</td>
              <td className="py-2.5 text-right">
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${stockBadge(p.stock)}`}>
                  {p.stock === 0 ? "Sin stock" : `${p.stock} uds.`}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}