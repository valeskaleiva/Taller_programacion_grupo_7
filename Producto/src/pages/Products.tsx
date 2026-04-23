import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { Product } from '../types';
import { Table } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';

export function Products() {
  const { products, isLoading, createProduct, deleteProduct } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', category: '', stock: '', description: '' });

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Nombre' },
    { key: 'category', header: 'Categoría' },
    { key: 'price', header: 'Precio', render: (row: Product) => `$${row.price.toFixed(2)}` },
    { key: 'stock', header: 'Stock' },
    {
      key: 'actions',
      header: 'Acciones',
      render: (row: Product) => (
        <Button variant="danger" size="sm" onClick={() => deleteProduct(row.id)}>
          Eliminar
        </Button>
      ),
    },
  ];

  const handleCreate = async () => {
    await createProduct({
      name: form.name,
      price: parseFloat(form.price),
      category: form.category,
      stock: parseInt(form.stock, 10),
      description: form.description,
    });
    setIsModalOpen(false);
    setForm({ name: '', price: '', category: '', stock: '', description: '' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <Button onClick={() => setIsModalOpen(true)}>+ Agregar Producto</Button>
      </div>
      <Table columns={columns} data={products} isLoading={isLoading} emptyMessage="No hay productos" />
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nuevo Producto"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate}>Guardar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Input label="Precio" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          <Input label="Categoría" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          <Input label="Stock" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
          <Input label="Descripción" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
