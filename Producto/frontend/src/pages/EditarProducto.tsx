import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { actualizarProducto, getProductoPorId } from '../services/api';
import type { Producto } from '../types';

const productoVacio: Omit<Producto, 'id_producto'> = {
  codigo_barras: '',
  nombre: '',
  descripcion: '',
  stock: 0,
  precio_base: 0,
  categoria: 'Carta',
  rareza: '',
  edicion: '',
  estado: 'Mint',
  precio_mercado: 0,
  cant_cartas: 0,
  serie: '',
  cant_sobres: 0,
};

const EditarProducto: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const idProducto = Number(id);

  const [form, setForm] = useState<Omit<Producto, 'id_producto'>>(productoVacio);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const volverInventario = () => {
    if (typeof window !== 'undefined' && window.opener) {
      window.close();
      return;
    }
    navigate('/inventario');
  };

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      if (!Number.isFinite(idProducto) || idProducto <= 0) {
        setError('ID de producto inválido.');
        setCargando(false);
        return;
      }

      try {
        setError('');
        setCargando(true);
        const producto = await getProductoPorId(idProducto);
        if (!activo) return;
        const { id_producto, ...resto } = producto;
        void id_producto;
        setForm(resto);
      } catch (err) {
        if (!activo) return;
        const message = err instanceof Error ? err.message : 'No se pudo cargar el producto.';
        setError(message);
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    void cargar();

    return () => {
      activo = false;
    };
  }, [idProducto]);

  const guardarProducto = async () => {
    if (!form.codigo_barras.trim() || !form.nombre.trim()) {
      setError('Completa Código de Barras y Nombre.');
      return;
    }

    try {
      setGuardando(true);
      setError('');
      await actualizarProducto(idProducto, form);
      if (typeof window !== 'undefined' && window.opener) {
        window.close();
        return;
      }
      navigate('/inventario');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo actualizar el producto.';
      setError(message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-3 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Editar producto</h1>
          <p className="text-sm text-gray-500">Ventana emergente para edición de inventario.</p>
        </div>
        <button
          type="button"
          onClick={volverInventario}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:text-gray-800"
        >
          Cerrar
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-4">
        {error && (
          <div className="text-sm px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700">
            {error}
          </div>
        )}

        {cargando ? (
          <div className="text-sm text-gray-500">Cargando producto...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Codigo de Barras *</label>
                <input
                  type="text"
                  value={form.codigo_barras}
                  onChange={(e) => setForm({ ...form, codigo_barras: e.target.value })}
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Categoria *</label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value as Producto['categoria'] })}
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight"
                >
                  <option value="Carta">Carta</option>
                  <option value="Sobre">Sobre</option>
                  <option value="Caja">Caja</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Nombre *</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Descripcion</label>
              <input
                type="text"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Stock</label>
                <input
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Precio Base (CLP)</label>
                <input
                  type="number"
                  min={0}
                  value={form.precio_base}
                  onChange={(e) => setForm({ ...form, precio_base: Number(e.target.value) })}
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={volverInventario}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void guardarProducto()}
                disabled={guardando || !form.codigo_barras.trim() || !form.nombre.trim()}
                className="btn-primary px-5 py-2 text-sm font-semibold rounded-lg"
              >
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EditarProducto;
