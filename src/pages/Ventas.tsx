// src/pages/Ventas.tsx
import { mockSales } from '../utils/mockData';
import { Table } from '../components/ui/Table';
import type { Sale } from '../types';

const columns = [
  { key: 'id' as keyof Sale, header: 'ID' },
  { key: 'productId' as keyof Sale, header: 'Producto ID' },
  { key: 'userId' as keyof Sale, header: 'Usuario ID' },
  { key: 'date' as keyof Sale, header: 'Fecha' },
  { key: 'amount' as keyof Sale, header: 'Cantidad' },
];

export function Ventas() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Ventas</h1>
      <Table<Sale>
        columns={columns}
        data={mockSales}
        keyExtractor={(s) => s.id}
      />
    </div>
  );
}
