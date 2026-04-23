import { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { Sale, Product } from '../types';

export function Reports() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([mockApi.getSales(), mockApi.getProducts()]).then(([salesRes, productsRes]) => {
      setSales(salesRes.data);
      setProducts(productsRes.data);
      setIsLoading(false);
    });
  }, []);

  const totalRevenue = sales.reduce((sum, s) => sum + (s.totalPrice ?? 0), 0);
  const avgSale = sales.length > 0 ? totalRevenue / sales.length : 0;

  const salesByProduct = products.map(p => ({
    name: p.name,
    count: sales.filter(s => s.productId === p.id).reduce((sum, s) => sum + s.amount, 0),
    revenue: sales.filter(s => s.productId === p.id).reduce((sum, s) => sum + (s.totalPrice ?? 0), 0),
  })).filter(p => p.count > 0).sort((a, b) => b.revenue - a.revenue);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><p className="text-gray-500">Cargando...</p></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reportes</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Ingresos Totales</p>
          <p className="text-3xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Ventas</p>
          <p className="text-3xl font-bold text-blue-600">{sales.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Venta Promedio</p>
          <p className="text-3xl font-bold text-purple-600">${avgSale.toFixed(2)}</p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ventas por Producto</h2>
        <div className="space-y-3">
          {salesByProduct.map(item => (
            <div key={item.name} className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-700">{item.name}</span>
              <div className="flex gap-8 text-sm">
                <span className="text-gray-500">{item.count} unidades</span>
                <span className="font-medium text-green-600">${item.revenue.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
