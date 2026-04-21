// src/pages/Home.tsx
import { mockSales, mockProducts } from '../utils/mockData';

export function Home() {
  const totalVentas = mockSales.reduce((acc, s) => acc + s.amount, 0);
  const totalProductos = mockProducts.length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Ventas totales</p>
          <p className="mt-1 text-3xl font-bold text-blue-600">{totalVentas}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Productos en catálogo</p>
          <p className="mt-1 text-3xl font-bold text-green-600">{totalProductos}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Órdenes recientes</p>
          <p className="mt-1 text-3xl font-bold text-purple-600">{mockSales.length}</p>
        </div>
      </div>
    </div>
  );
}
