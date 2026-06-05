import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { getPerfilUsuarioApi, actualizarPerfilUsuarioApi } from '../services/api';
import type { UserProfileApi } from '../services/api';

const NOTICE_TIMEOUT_MS = 1000;
const NOTICE_BANNER_CLASS = 'text-sm px-3 py-2 rounded-2xl border border-[#0B3D2E] bg-[#0B3D2E] text-white shadow-sm';

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

const isUploadedAvatar = (value?: string): boolean => {
  const avatar = (value ?? '').trim();
  return avatar.startsWith('data:image/');
};

function toFormState(profile: UserProfileApi): FormState {
  const nombre = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.username;
  return {
    nombre,
    nombre_usuario: profile.username,
    puesto: profile.puesto ?? '',
    fecha_nacimiento: profile.fecha_nacimiento ?? '',
    email: profile.email,
    avatar: isUploadedAvatar(profile.avatar) ? profile.avatar ?? '' : '',
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
  const hasUploadedAvatar = isUploadedAvatar(form.avatar);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(''), NOTICE_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getPerfilUsuarioApi();
        setForm(toFormState(profile));
      } catch {
        setMessage('No se pudo cargar el perfil desde el servidor.');
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Manejar subida de archivo de imagen y guardar como base64 en el estado
  const handleAvatarFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((prev) => ({ ...prev, avatar: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
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
      const [firstName, ...rest] = form.nombre.trim().split(' ');
      await actualizarPerfilUsuarioApi({
        first_name: firstName ?? '',
        last_name: rest.join(' '),
        email: form.email,
        puesto: form.puesto,
        fecha_nacimiento: form.fecha_nacimiento || null,
        telefono: formatTelefono(form.telefono),
        direccion: form.direccion,
        bio: form.bio,
        avatar: form.avatar,
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
    <div className="w-full max-w-5xl mx-auto text-left" style={{ fontFamily: 'var(--sans)', fontSize: '18.5px', color: '#082f1a' }}>
      <div className="flex flex-col md:flex-row gap-6">
        <section className="bg-gradient-to-br from-emerald-50 via-white to-emerald-100 rounded-2xl shadow-md border-2 border-emerald-300 p-6 md:w-80" style={{ fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit' }}>
          <h2 className="text-2xl font-semibold text-gray-800"></h2>{/* aca va el titulo #borre el titulo porque se ve raro con el header, pero se puede volver a poner si se quiere*/}
          <p className="text-sm text-gray-500 mt-1"></p>{/*borre la descripcion porque se ve raro con el header, pero se puede volver a poner si se quiere*/}

          <div className="mt-6 flex flex-col items-center gap-3">
            {hasUploadedAvatar ? (
              <img
                src={form.avatar}
                alt="Foto de perfil"
                className="h-24 w-20 rounded-md object-cover border-2 border-emerald-300 shadow"
                style={{ width: '80px', height: '96px', maxWidth: '80px', objectFit: 'cover', flexShrink: 0 }}
              />
            ) : (
              <div className="h-24 w-20 rounded-md border-2 border-dashed border-emerald-400 bg-emerald-100 flex items-center justify-center text-[10px] font-semibold text-emerald-800 text-center px-1 leading-tight">
                Sin foto subida
              </div>
            )}
            <p className="text-lg font-bold text-emerald-900">{form.nombre || 'Sin nombre'}</p>
            <p className="text-sm text-emerald-700 font-medium">@{form.nombre_usuario || 'usuario'}</p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-200 text-emerald-900 border border-emerald-400">
              {form.puesto || 'Sin puesto'}
            </span>
          </div>
        </section>

        <section className="flex-1 bg-gradient-to-br from-white via-emerald-50 to-emerald-100 rounded-2xl shadow-md border-2 border-emerald-200 p-6" style={{ fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit' }}>
          <h3 className="text-2xl font-bold text-emerald-900 mb-2">Editar información</h3>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-base text-emerald-900 font-medium">
              Nombre real *
              <input
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1 text-base text-emerald-900 font-medium">
              Nombre de usuario *
              <input
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.nombre_usuario}
                onChange={(e) => handleChange('nombre_usuario', e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1 text-base text-emerald-900 font-medium">
              Puesto *
              <input
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.puesto}
                onChange={(e) => handleChange('puesto', e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1 text-base text-emerald-900 font-medium">
              Fecha de nacimiento *
              <input
                type="date"
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.fecha_nacimiento}
                onChange={(e) => handleChange('fecha_nacimiento', e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1 text-base text-emerald-900 font-medium">
              Correo
              <input
                type="email"
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1 text-base text-emerald-900 font-medium">
              Subir foto desde archivo
              <input
                type="file"
                accept="image/*"
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                onChange={handleAvatarFile}
              />
              <span className="text-xs text-gray-500 mt-1">Puedes subir una imagen JPG, PNG o GIF.</span>
              {hasUploadedAvatar && (
                <img
                  src={form.avatar}
                  alt="Previsualizacion de foto"
                  className="mt-2 h-20 w-16 rounded-md object-cover border-2 border-emerald-300"
                  style={{ width: '64px', height: '80px', maxWidth: '64px', objectFit: 'cover', flexShrink: 0 }}
                />
              )}
            </label>

            <label className="flex flex-col gap-1 text-base text-emerald-900 font-medium">
              Teléfono (recomendado)
              <div className="flex flex-row items-center border rounded-lg focus-within:ring-2 focus-within:ring-emerald-500 overflow-hidden" style={{height: 44}}>
                <span className="px-3 text-gray-500 bg-gray-50 border-r rounded-l-lg whitespace-nowrap" style={{height: '100%', display: 'flex', alignItems: 'center'}}>{PHONE_PREFIX}</span>
                <input
                  className="w-full px-3 py-2 rounded-r-lg focus:outline-none border-0 bg-transparent"
                  inputMode="numeric"
                  placeholder="1234 5678"
                  value={formatTelefonoInput(form.telefono)}
                  onChange={(e) => handleTelefonoChange(e.target.value)}
                  style={{height: '100%'}}
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

          <label className="mt-4 flex flex-col gap-1 text-base text-emerald-900 font-medium">
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
              className="btn-verde px-5 py-2 rounded-lg font-semibold text-base shadow hover:brightness-95 disabled:opacity-70 transition-all"
              style={{ minWidth: 150 }}
            >
              {saving ? 'Guardando...' : 'Guardar perfil'}
            </button>
          </div>

          {message && (
            <div className="mt-3">
              <div className={NOTICE_BANNER_CLASS}>{message}</div>
            </div>
          )}

          <div className="mt-6 p-4 rounded-xl bg-amber-50 border-2 border-amber-300">
            <p className="text-sm text-amber-900 font-semibold">
             
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Perfil;