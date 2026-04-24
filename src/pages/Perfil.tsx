// src/pages/Perfil.tsx
import { useAuth } from '../hooks/useAuth';

export function Perfil() {
  const { state, logout } = useAuth();

  if (!state.user) {
    return <p className="text-gray-600">No has iniciado sesión.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Perfil</h1>
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <dl className="space-y-3">
          <div>
            <dt className="text-sm text-gray-500">Usuario</dt>
            <dd className="font-medium text-gray-800">{state.user.username}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Email</dt>
            <dd className="font-medium text-gray-800">{state.user.email}</dd>
          </div>
        </dl>
        <button
          onClick={logout}
          className="mt-6 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
