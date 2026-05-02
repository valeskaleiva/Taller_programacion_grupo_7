import { useEffect, useState } from 'react';
import { actualizarPerfilUsuario, getPerfilUsuario } from '../services/mockApi';
import type { UserProfile } from '../types';

type FormState = {
  nombre: string;
  nombre_usuario: string;
  puesto: string;
  fecha_nacimiento: string;
  email: string;
  avatar: string;
  telefono: string;
  direccion: string;
  bio: string;
};

const EMPTY_FORM: FormState = {
  nombre: '',
  nombre_usuario: '',
  puesto: '',
  fecha_nacimiento: '',
  email: '',
  avatar: '',
  telefono: '',
  direccion: '',
  bio: '',
};

const PHONE_PREFIX = '+56 9';

const extractTelefonoLocal = (value?: string): string =>
  (value ?? '').replace(/^\+56\s*9\s*/, '').replace(/\D/g, '').slice(0, 8);

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

function toFormState(profile: UserProfile): FormState {
  return {
    nombre: profile.nombre,
    nombre_usuario: profile.nombre_usuario,
    puesto: profile.puesto,
    fecha_nacimiento: profile.fecha_nacimiento,
    email: profile.email,
    avatar: profile.avatar ?? '',
    telefono: extractTelefonoLocal(profile.telefono),
    direccion: profile.direccion ?? '',
    bio: profile.bio ?? '',
  };
}

function Perfil() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadProfile() {
      const profile = await getPerfilUsuario();
      setForm(toFormState(profile));
      setLoading(false);
    }

    void loadProfile();
  }, []);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTelefonoChange = (value: string) => {
    setForm((prev) => ({ ...prev, telefono: extractTelefonoLocal(value) }));
  };

  const handleSave = async () => {
    if (!form.nombre || !form.nombre_usuario || !form.puesto || !form.fecha_nacimiento) {
      setMessage('Completa los campos obligatorios: nombre real, usuario, puesto y fecha de nacimiento.');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      await actualizarPerfilUsuario({
        nombre: form.nombre,
        nombre_usuario: form.nombre_usuario,
        puesto: form.puesto,
        fecha_nacimiento: form.fecha_nacimiento,
        email: form.email,
        avatar: form.avatar,
        telefono: formatTelefono(form.telefono),
        direccion: form.direccion,
        bio: form.bio,
      });
      setMessage('Perfil guardado correctamente.');
    } catch {
      setMessage('No se pudo guardar el perfil. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-gray-600">Cargando perfil...</p>;
  }

  return (
    <div className="w-full max-w-5xl mx-auto text-left">
      <div className="flex flex-col md:flex-row gap-6">
        <section className="bg-white rounded-2xl shadow-sm border p-6 md:w-80">
          <h2 className="text-2xl font-semibold text-gray-800">Mi perfil</h2>
          <p className="text-sm text-gray-500 mt-1">Datos visibles en el panel de administración.</p>

          <div className="mt-6 flex flex-col items-center gap-3">
            <img
              src={form.avatar || 'https://i.pravatar.cc/220?img=12'}
              alt="Avatar del usuario"
              className="w-28 h-28 rounded-full object-cover border-4 border-emerald-700"
            />
            <p className="text-lg font-semibold text-gray-800">{form.nombre || 'Sin nombre'}</p>
            <p className="text-sm text-gray-500">@{form.nombre_usuario || 'usuario'}</p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              {form.puesto || 'Sin puesto'}
            </span>
          </div>
        </section>

        <section className="flex-1 bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="text-xl font-semibold text-gray-800">Editar información</h3>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-sm text-gray-700">
              Nombre real *
              <input
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-gray-700">
              Nombre de usuario *
              <input
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.nombre_usuario}
                onChange={(e) => handleChange('nombre_usuario', e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-gray-700">
              Puesto *
              <input
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.puesto}
                onChange={(e) => handleChange('puesto', e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-gray-700">
              Fecha de nacimiento *
              <input
                type="date"
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.fecha_nacimiento}
                onChange={(e) => handleChange('fecha_nacimiento', e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-gray-700">
              Correo
              <input
                type="email"
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-gray-700">
              URL de foto
              <input
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.avatar}
                onChange={(e) => handleChange('avatar', e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-gray-700">
              Teléfono (recomendado)
              <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-emerald-500">
                <span className="px-3 py-2 text-gray-500 border-r bg-gray-50 rounded-l-lg">{PHONE_PREFIX}</span>
                <input
                  className="w-full px-3 py-2 rounded-r-lg focus:outline-none"
                  inputMode="numeric"
                  placeholder="1234 5678"
                  value={formatTelefonoInput(form.telefono)}
                  onChange={(e) => handleTelefonoChange(e.target.value)}
                />
              </div>
            </label>

            <label className="flex flex-col gap-1 text-sm text-gray-700">
              Dirección (recomendado)
              <input
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.direccion}
                onChange={(e) => handleChange('direccion', e.target.value)}
              />
            </label>
          </div>

          <label className="mt-4 flex flex-col gap-1 text-sm text-gray-700">
            Bio (recomendado)
            <textarea
              rows={3}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={form.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
            />
          </label>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-700 text-white px-5 py-2 rounded-lg hover:bg-emerald-800 disabled:opacity-60"
            >
              {saving ? 'Guardando...' : 'Guardar perfil'}
            </button>
            {message && <p className="text-sm text-gray-600">{message}</p>}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-800">
              Recomendado para BD en siguiente etapa: telefono, direccion, bio, ultimo_acceso y estado_cuenta.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Perfil;