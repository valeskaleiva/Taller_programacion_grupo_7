import { useSales } from '../hooks/useSales';
import { Sale } from '../types';
import { Table } from '../components/ui/Table';

export function Sales() {
  const { sales, isLoading } = useSales();

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'productId', header: 'ID Producto' },
    { key: 'userId', header: 'ID Usuario' },
    { key: 'date', header: 'Fecha' },
    { key: 'amount', header: 'Cantidad' },
    { key: 'totalPrice', header: 'Total', render: (row: Sale) => `$${(row.totalPrice ?? 0).toFixed(2)}` },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ventas</h1>
      <Table columns={columns} data={sales} isLoading={isLoading} emptyMessage="No hay ventas registradas" />
    </div>
  );
}
