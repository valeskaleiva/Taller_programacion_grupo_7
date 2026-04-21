// src/pages/NotFound.tsx
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <p className="mt-4 text-lg text-gray-600">Página no encontrada</p>
      <Link
        to="/"
        className="mt-6 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
