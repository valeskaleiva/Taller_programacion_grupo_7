import { useEffect, useRef, useState } from 'react';
import {
  getVendedores,
  crearVendedor,
  actualizarVendedor,
  eliminarVendedor,
} from '../services/mockApi';
import type { Vendedor } from '../types';

type FormNuevo = {
  nombre: string;
  nombre_usuario: string;
  email: string;
  telefono: string;
  estado: 'activo' | 'inactivo';
};

const EMPTY_FORM: FormNuevo = { nombre: '', nombre_usuario: '', email: '', telefono: '', estado: 'activo' };
const PHONE_PREFIX = '+569';

const extractTelefonoLocal = (value?: string): string =>
  (value ?? '').replace(/^\+56\s*9\s*|^\+569\s*/, '').replace(/\D/g, '').slice(0, 8);

const formatTelefono = (localDigits: string): string => {
  if (!localDigits) return '';
  const first = localDigits.slice(0, 4);
  const second = localDigits.slice(4);
  return `${PHONE_PREFIX} ${first}${second ? ` ${second}` : ''}`;
};

const formatTelefonoInput = (localDigits: string): string => {
  if (localDigits.length <= 4) return localDigits;
  return `${localDigits.slice(0, 4)} ${localDigits.slice(4)}`;
};

const BTN_BASE =
  'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-150 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';
const BTN_PRIMARY = `${BTN_BASE} text-sm px-4 py-2 !text-white shadow-sm hover:opacity-90 active:opacity-100 focus-visible:!ring-emerald-700`;
const BTN_EDIT = `${BTN_BASE} text-xs px-3 py-1.5 text-sky-700 bg-sky-50 border border-sky-100 hover:bg-sky-100 active:bg-sky-200 active:border-emerald-600 active:ring-1 active:ring-emerald-300 focus-visible:ring-sky-400`;
const BTN_DANGER = `${BTN_BASE} text-xs px-3 py-1.5 text-rose-700 bg-rose-50 border border-rose-100 hover:bg-rose-100 active:bg-rose-200 active:border-emerald-600 active:ring-1 active:ring-emerald-300 focus-visible:ring-rose-400`;
const BTN_SECONDARY = `${BTN_BASE} text-sm px-4 py-2 text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 active:bg-gray-100 focus-visible:ring-gray-300`;

export default function Usuarios() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormNuevo>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalPosition, setModalPosition] = useState<{ x: number; y: number } | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);

  const cargar = async () => {
    const data = await getVendedores();
    setVendedores(data);
    setLoading(false);
  };

  useEffect(() => { void cargar(); }, []);

  useEffect(() => {
    if (!showModal) {
      setModalPosition(null);
      draggingRef.current = false;
      return;
    }

    const frame = requestAnimationFrame(() => {
      const rect = modalRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = Math.max((window.innerWidth - rect.width) / 2, 12);
      const y = Math.max(window.innerHeight - rect.height - 16, 12);
      setModalPosition({ x, y });
    });

    return () => cancelAnimationFrame(frame);
  }, [showModal]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!draggingRef.current) return;

      const rect = modalRef.current?.getBoundingClientRect();
      const width = rect?.width ?? 560;
      const height = rect?.height ?? 420;

      const nextX = event.clientX - dragOffsetRef.current.x;
      const nextY = event.clientY - dragOffsetRef.current.y;

      const clampedX = Math.min(Math.max(nextX, 8), Math.max(window.innerWidth - width - 8, 8));
      const clampedY = Math.min(Math.max(nextY, 8), Math.max(window.innerHeight - height - 8, 8));

      setModalPosition({ x: clampedX, y: clampedY });
    };

    const stopDragging = () => {
      draggingRef.current = false;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopDragging);
    window.addEventListener('pointercancel', stopDragging);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopDragging);
      window.removeEventListener('pointercancel', stopDragging);
    };
  }, []);

  const handleDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('[data-close-modal="true"]')) return;
    if (!modalPosition) return;

    draggingRef.current = true;
    dragOffsetRef.current = {
      x: event.clientX - modalPosition.x,
      y: event.clientY - modalPosition.y,
    };
  };

  const handleChange = (field: keyof FormNuevo, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTelefonoChange = (value: string) => {
    setForm((prev) => ({ ...prev, telefono: extractTelefonoLocal(value) }));
  };

  const handleAgregar = async () => {
    if (!form.nombre || !form.nombre_usuario || !form.email) {
      setError('Nombre, usuario y correo son obligatorios.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await crearVendedor({
        nombre: form.nombre,
        nombre_usuario: form.nombre_usuario,
        email: form.email,
        telefono: formatTelefono(form.telefono),
        estado: form.estado,
      });
      setForm(EMPTY_FORM);
      setShowModal(false);
      void cargar();
    } catch {
      setError('No se pudo guardar el vendedor.');
    } finally {
      setSaving(false);
    }
  };

  const openEditar = (v: Vendedor) => {
    setEditingId(v.id);
    setForm({
      nombre: v.nombre,
      nombre_usuario: v.nombre_usuario,
      email: v.email,
      telefono: extractTelefonoLocal(v.telefono),
      estado: v.estado,
    });
    setError('');
    setShowModal(true);
  };

  const handleGuardar = async () => {
    if (editingId === null) {
      await handleAgregar();
      return;
    }

    if (!form.nombre || !form.nombre_usuario || !form.email) {
      setError('Nombre, usuario y correo son obligatorios.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await actualizarVendedor(editingId, {
        nombre: form.nombre,
        nombre_usuario: form.nombre_usuario,
        email: form.email,
        telefono: formatTelefono(form.telefono),
        estado: form.estado,
      });
      setEditingId(null);
      setForm(EMPTY_FORM);
      setShowModal(false);
      void cargar();
    } catch {
      setError('No se pudo actualizar el vendedor.');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Eliminar este vendedor?')) return;
    await eliminarVendedor(id);
    void cargar();
  };

  return (
    <div className="space-y-6 p-2 sm:p-4">
      {/* Encabezado */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Gestión de Vendedores</h2>
          <p className="text-sm text-gray-500 mt-0.5">Solo el administrador puede agregar o desactivar cuentas.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setShowModal(true);
            setError('');
            setForm(EMPTY_FORM);
          }}
          className={BTN_PRIMARY}
          style={{ backgroundColor: 'var(--primary)', border: '1px solid var(--primary-dark)', color: '#fff' }}
        >
          + Agregar vendedor
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['#', 'Nombre', 'Usuario', 'Correo', 'Teléfono', 'Estado', 'Creado', 'Acciones'].map((col) => (
                <th
                  key={col}
                  className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-400">Cargando...</td>
              </tr>
            ) : vendedores.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-400">No hay vendedores registrados.</td>
              </tr>
            ) : (
              vendedores.map((v, i) => (
                <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {v.nombre[0]}
                      </div>
                      <span className="font-medium text-gray-800">{v.nombre}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500">@{v.nombre_usuario}</td>
                  <td className="px-5 py-3 text-gray-500">{v.email}</td>
                  <td className="px-5 py-3 text-gray-500">
                    {v.telefono ? formatTelefono(extractTelefonoLocal(v.telefono)) : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        v.estado === 'activo'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {v.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{v.creado_en}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => openEditar(v)}
                        className={BTN_EDIT}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => void handleEliminar(v.id)}
                        className={BTN_DANGER}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={8} className="px-5 py-3 text-xs text-gray-400">
                {vendedores.filter((v) => v.estado === 'activo').length} activos ·{' '}
                {vendedores.filter((v) => v.estado === 'inactivo').length} inactivos
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Modal Agregar */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/25 p-3">
          <div
            ref={modalRef}
            style={{ ...(modalPosition ? { left: modalPosition.x, top: modalPosition.y } : {}), backgroundColor: '#bbf7d0', opacity: 1 }}
            className={`fixed w-[min(100%,32rem)] border border-emerald-300 rounded-2xl shadow-2xl ${modalPosition ? '' : 'left-1/2 -translate-x-1/2 bottom-4'}`}
          >
            <div
              onPointerDown={handleDragStart}
              className="flex items-center justify-between gap-3 rounded-t-2xl bg-emerald-200 px-5 py-3 cursor-move select-none"
            >
              <h3 className="text-lg font-bold text-emerald-900">
                {editingId === null ? 'Nuevo Vendedor' : 'Editar Vendedor'}
              </h3>
              <button
                data-close-modal="true"
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                  setForm(EMPTY_FORM);
                  setError('');
                }}
                className="h-8 w-8 rounded-full text-emerald-900/80 hover:text-emerald-950 hover:bg-emerald-100 text-lg leading-none"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="bg-emerald-100 px-6 py-4 rounded-b-2xl">

            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'Nombre completo *', field: 'nombre' as const, type: 'text' },
                { label: 'Nombre de usuario *', field: 'nombre_usuario' as const, type: 'text' },
                { label: 'Correo electrónico *', field: 'email' as const, type: 'email' },
                { label: 'Teléfono', field: 'telefono' as const, type: 'text' },
              ].map(({ label, field, type }) => (
                <label key={field} className="flex flex-col gap-1 text-sm text-gray-700">
                  {label}
                  {field === 'telefono' ? (
                    <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-emerald-500 min-h-[46px] bg-white">
                      <span className="px-3 py-2 text-gray-600 border-r bg-emerald-50 rounded-l-lg whitespace-nowrap shrink-0">{PHONE_PREFIX}</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="1234 5678"
                        value={formatTelefonoInput(form.telefono)}
                        onChange={(e) => handleTelefonoChange(e.target.value)}
                        className="w-full min-w-[220px] px-3 py-2 rounded-r-lg focus:outline-none bg-transparent"
                      />
                    </div>
                  ) : (
                    <input
                      type={type}
                      value={form[field]}
                      onChange={(e) => handleChange(field, e.target.value)}
                      className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  )}
                </label>
              ))}

              <label className="flex flex-col gap-1 text-sm text-gray-700">
                Estado
                <select
                  value={form.estado}
                  onChange={(e) => handleChange('estado', e.target.value as FormNuevo['estado'])}
                  className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </label>
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                  setForm(EMPTY_FORM);
                  setError('');
                }}
                className={BTN_SECONDARY}
              >
                Cancelar
              </button>
              <button
                onClick={() => void handleGuardar()}
                disabled={saving}
                className={`${BTN_PRIMARY} px-5`}
                style={{ backgroundColor: 'var(--primary)', border: '1px solid var(--primary-dark)', color: '#fff' }}
              >
                {saving ? 'Guardando...' : editingId === null ? 'Agregar' : 'Guardar cambios'}
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
