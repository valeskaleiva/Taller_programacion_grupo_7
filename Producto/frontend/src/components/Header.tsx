import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from 'react';
import { getPerfilUsuario } from '../services/mockApi';
import { clearAuthTokens } from "../services/api";
import type { UserProfile } from '../types';

const TITULOS: Record<string, string> = {
  "/": "DASHBOARD",
  "/inventario": "INVENTARIO",
  "/ventas": "VENTAS",
  "/reportes": "REPORTES",
  "/perfil": "PERFIL",
};

type Props = {
  titulo?: string;
};

function Header({ titulo }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const tituloActual = titulo ?? TITULOS[location.pathname] ?? "DASHBOARD";
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const handleLogout = () => {
    clearAuthTokens();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    async function loadProfile() {
      const data = await getPerfilUsuario();
      setProfile(data);
    }

    void loadProfile();
  }, [location.pathname]);

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
        <img
          src={profile?.avatar || "https://i.pravatar.cc/100"}
          alt="perfil"
          className="w-8 h-8 rounded-full border border-emerald-300"
        />

        <span className="hidden sm:block text-xs sm:text-sm font-semibold tracking-wide text-emerald-900 truncate max-w-[130px]">
          {profile?.nombre_usuario?.toUpperCase() || "ADMIN"}
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