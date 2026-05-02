import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from 'react';
import { getPerfilUsuario } from '../services/mockApi';
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

      {/* DERECHA */}
      <div
        onClick={() => navigate("/perfil")}
        className="flex items-center gap-2 sm:gap-4 cursor-pointer hover:opacity-80 min-w-0"
      >
        <span className="text-lg sm:text-xl hidden sm:block">🔔</span>

        <img
          src={profile?.avatar || "https://i.pravatar.cc/100"}
          alt="perfil"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-primary"
        />

        <span className="hidden sm:block text-sm md:text-base font-medium tracking-wide truncate max-w-[130px]">
          {profile?.nombre_usuario?.toUpperCase() || "ADMIN"}
        </span>
      </div>
    </div>
  );
}

export default Header;