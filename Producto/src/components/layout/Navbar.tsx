import { useAuthContext } from '../../context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuthContext();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🃏</span>
        <span className="font-bold text-gray-900 text-lg">TCG Management</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Hola, <span className="font-medium">{user?.username}</span>
          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{user?.role}</span>
        </span>
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
