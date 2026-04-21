// src/components/layout/Layout.tsx
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', label: 'Inicio' },
  { path: '/inventario', label: 'Inventario' },
  { path: '/ventas', label: 'Ventas' },
  { path: '/reportes', label: 'Reportes' },
  { path: '/perfil', label: 'Perfil' },
];

export function Layout({ children }: LayoutProps) {
  const { state, toggleSidebar } = useAppContext();
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white shadow-md transition-transform duration-200 ${
          state.sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <span className="text-xl font-bold text-blue-600">Tienda</span>
          <button className="md:hidden" onClick={toggleSidebar} aria-label="Cerrar menú">
            ✕
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between bg-white px-4 shadow-sm">
          <button className="md:hidden" onClick={toggleSidebar} aria-label="Abrir menú">
            ☰
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Sistema de Ventas</h1>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
