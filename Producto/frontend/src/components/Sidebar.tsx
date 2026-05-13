import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Sidebar() {
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarWidth = desktopOpen ? "220px" : "78px";

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const menuItems = [
    { icon: "🏠", label: "Inicio", path: "/" },
    { icon: "📦", label: "Inventario", path: "/inventario" },
    { icon: "🧭", label: "Buscador TCG", path: "/tcgplayer" },
    { icon: "📊", label: "Reportes", path: "/reportes" },
    { icon: "💰", label: "Ventas", path: "/ventas" },
    { icon: "👤", label: "Perfil", path: "/perfil" },
    { icon: "🧑‍💼", label: "Usuarios", path: "/usuarios" },
  ];

  return (
    <>
      <button
        onClick={() => setMobileOpen((prev) => !prev)}
        className="md:hidden fixed top-3 left-3 z-50 rounded-lg px-3 py-2 shadow"
        style={{
          backgroundColor: "var(--primary)",
          color: "black",
          border: "none",
          cursor: "pointer",
        }}
      >
        ☰
      </button>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/40"
        />
      )}

      <aside
        style={{
          width: sidebarWidth,
          minHeight: "100vh",
          backgroundColor: "var(--primary-dark)",
          color: "white",
          transition: "transform 0.3s ease, width 0.3s ease",
          paddingTop: "20px",
        }}
        className={`fixed top-0 left-0 z-50 h-screen shrink-0 md:sticky md:z-10 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
      <div className="flex items-center justify-between px-2">
        <button
          onClick={() => setDesktopOpen(!desktopOpen)}
          className="hidden md:block"
          style={{
            backgroundColor: "var(--primary)",
            color: "black",
            border: "none",
            padding: "10px",
            borderRadius: "8px",
            cursor: "pointer",
            margin: "10px",
          }}
        >
          ☰
        </button>

        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden mr-3 text-xl leading-none"
          type="button"
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>

      <ul style={{ listStyle: "none", padding: "0" }}>
        {menuItems.map((item) => (
          <li
            key={item.path}
            style={{ padding: "15px", cursor: "pointer" }}
            onClick={() => handleNavigate(item.path)}
            className="hover:bg-black/10 transition-colors"
          >
            {item.icon} {desktopOpen && item.label}
          </li>
        ))}
      </ul>

      </aside>
    </>
  );
}

export default Sidebar;