// src/pages/Reportes.tsx
import { mockSales, mockProducts } from '../utils/mockData';

export function Reportes() {
  const totalIngresos = mockSales.reduce((acc, sale) => {
    const product = mockProducts.find((p) => p.id === sale.productId);
    return acc + (product ? product.price * sale.amount : 0);
  }, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-700">Resumen</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-gray-500">Total ventas</dt>
            <dd className="text-2xl font-bold text-blue-600">{mockSales.length}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Unidades vendidas</dt>
            <dd className="text-2xl font-bold text-green-600">
              {mockSales.reduce((acc, s) => acc + s.amount, 0)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Ingresos totales</dt>
            <dd className="text-2xl font-bold text-purple-600">
              ${totalIngresos.toFixed(2)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
