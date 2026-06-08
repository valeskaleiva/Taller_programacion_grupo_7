import { useNavigate, useLocation } from "react-router-dom";
import { useState } from 'react';
import { clearAuthTokens, getStoredAuthUser } from "../services/api";

const TITULOS: Record<string, string> = {
  "/": "DASHBOARD",
  "/inventario": "INVENTARIO",
  "/inventario/agregar": "AGREGAR PRODUCTO",
  "/ventas": "VENTAS",
  "/reportes": "REPORTES",
  "/perfil": "PERFIL",
  "/usuarios": "USUARIOS",
  "/tcgplayer": "BUSCADOR TCGPLAYER",
};

type Props = {
  titulo?: string;
};

function Header({ titulo }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const tituloActual = titulo ?? TITULOS[location.pathname] ?? "DASHBOARD";
  const [profile] = useState(() => getStoredAuthUser());

  const username = profile?.username ?? 'ADMIN';
  const hasAvatar = false;

  const handleLogout = () => {
    clearAuthTokens();
    navigate('/login', { replace: true });
  };

  return (
    <div className="
      w-full
      bg-white 
      px-3 sm:px-4 py-3 sm:py-4 
      flex 
      justify-between 
      items-center 
      gap-3
      shadow-md 
      border-b
      flex-shrink-0
    ">

      {/* TÍTULO */}
      <h1 className="text-lg sm:text-2xl lg:text-3xl font-semibold tracking-wide sm:tracking-widest text-gray-800 truncate">
        {tituloActual}
      </h1>

      {/* Mini barra de sesion */}
      <div className="flex items-center gap-2 sm:gap-3 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 sm:px-3 sm:py-1.5">
        {hasAvatar ? (
          <img
            src=""
            alt="perfil"
            className="rounded-full border border-emerald-300 object-cover"
            style={{
              width: '120px',
              height: '120px',
              minWidth: '120px',
              maxWidth: '120px',
              minHeight: '120px',
              maxHeight: '120px',
              objectFit: 'cover',
              flexShrink: 0,
              display: 'block',
            }}
          />
        ) : (
          <div
            className="rounded-full border border-emerald-300 bg-emerald-700 text-white text-xs font-bold flex items-center justify-center"
            style={{
              width: '120px',
              height: '120px',
              minWidth: '120px',
              maxWidth: '120px',
              minHeight: '120px',
              maxHeight: '120px',
              flexShrink: 0,
            }}
          >
            {username[0].toUpperCase()}
          </div>
        )}

        <span className="hidden sm:block text-xs sm:text-sm font-semibold tracking-wide text-emerald-900 truncate max-w-[130px]">
          {username.toUpperCase()}
        </span>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-1.5 transition"
          style={{ backgroundColor: '#15803d', color: '#ffffff' }}
        >
          Cerrar sesion
        </button>
      </div>
    </div>
  );
}

export default Header;