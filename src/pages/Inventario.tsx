// src/pages/Inventario.tsx
import { mockProducts } from '../utils/mockData';
import { Table } from '../components/ui/Table';
import type { Product } from '../types';

const columns = [
  { key: 'id' as keyof Product, header: 'ID' },
  { key: 'name' as keyof Product, header: 'Producto' },
  { key: 'category' as keyof Product, header: 'Categoría' },
  {
    key: 'price' as keyof Product,
    header: 'Precio',
    render: (value: Product[keyof Product]) => `$${Number(value).toFixed(2)}`,
  },
];

export function Inventario() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Inventario</h1>
      <Table<Product>
        columns={columns}
        data={mockProducts}
        keyExtractor={(p) => p.id}
      />
    </div>
  );
}
