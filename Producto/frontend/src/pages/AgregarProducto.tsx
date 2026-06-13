import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearProducto } from '../services/api';
import type { Producto } from '../types';

const NOTICE_TIMEOUT_MS = 1000;
const NOTICE_BANNER_CLASS = 'text-sm px-3 py-2 rounded-2xl border border-[#0B3D2E] bg-[#0B3D2E] text-white shadow-sm';

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

const AgregarProducto: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<Omit<Producto, 'id_producto'>>(productoVacio);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensajeEscaner, setMensajeEscaner] = useState('');

  const volverInventario = () => navigate('/inventario');

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => setError(''), NOTICE_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    if (!mensajeEscaner) return;
    const timer = window.setTimeout(() => setMensajeEscaner(''), NOTICE_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [mensajeEscaner]);

  const guardarProducto = async () => {
    if (!form.codigo_barras.trim() || !form.nombre.trim()) {
      setError('Completa Código de Barras y Nombre.');
      return;
    }

    try {
      setGuardando(true);
      setError('');
      await crearProducto(form);
      navigate('/inventario');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar el producto.';
      setError(message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-3 sm:p-6 space-y-4 dashboard-panel-font">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-green-900 dashboard-panel-font">Agregar producto</h1>
          <p className="text-sm text-green-700">Formulario en pantalla completa para evitar problemas de modal.</p>
        </div>
        <button
          type="button"
          onClick={volverInventario}
          className="px-4 py-2 text-sm border border-green-300 rounded-lg text-green-700 hover:text-green-900 bg-green-50 font-semibold shadow"
        >
          Volver a inventario
        </button>
      </div>

      <div className="bg-green-50 rounded-2xl border border-green-200 shadow-lg p-4 sm:p-6 space-y-4">
        {error && (
          <div className={NOTICE_BANNER_CLASS}>
            {error}
          </div>
        )}

        {mensajeEscaner && (
          <div className={NOTICE_BANNER_CLASS}>
            {mensajeEscaner}
          </div>
        )}

        <div className="text-xs text-gray-600 rounded-lg border border-green-200 bg-white px-3 py-2">
          El código de barras se ingresa con lector tipo teclado (celular como pistola) o manualmente.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-green-900 dashboard-panel-font">Código de Barras *</label>
            <input
              type="text"
              value={form.codigo_barras}
              onChange={(e) => setForm({ ...form, codigo_barras: e.target.value })}
              className="w-full mt-1 border border-green-300 rounded-lg px-3 py-2 text-base bg-green-100 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-400 font-semibold shadow"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-green-900 dashboard-panel-font">Categoría *</label>
            <select
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value as Producto['categoria'] })}
              className="w-full mt-1 border border-green-300 rounded-lg px-3 py-2 text-base bg-green-100 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-400 font-semibold shadow"
            >
              <option value="Carta">Carta</option>
              <option value="Sobre">Sobre</option>
              <option value="Caja">Caja</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-green-900 dashboard-panel-font">Nombre *</label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full mt-1 border border-green-300 rounded-lg px-3 py-2 text-base bg-green-100 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-400 font-semibold shadow"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-green-900 dashboard-panel-font">Descripción</label>
          <input
            type="text"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            className="w-full mt-1 border border-green-300 rounded-lg px-3 py-2 text-base bg-green-100 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-400 font-semibold shadow"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-green-900 dashboard-panel-font">Stock</label>
            <input
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              className="w-full mt-1 border border-green-300 rounded-lg px-3 py-2 text-base bg-green-100 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-400 font-semibold shadow"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-green-900 dashboard-panel-font">Precio Base (CLP)</label>
            <input
              type="number"
              min={0}
              value={form.precio_base}
              onChange={(e) => setForm({ ...form, precio_base: Number(e.target.value) })}
              className="w-full mt-1 border border-green-300 rounded-lg px-3 py-2 text-base bg-green-100 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-400 font-semibold shadow"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={volverInventario}
            className="px-4 py-2 text-sm text-green-700 hover:text-green-900 border border-green-300 rounded-lg bg-green-50 font-semibold shadow"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void guardarProducto()}
            disabled={guardando || !form.codigo_barras.trim() || !form.nombre.trim()}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
          >
            {guardando ? 'Guardando...' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgregarProducto;
