import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Sidebar() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <aside
      style={{
        width: open ? "200px" : "70px",
        minHeight: "100vh", // ← Cambiado de height a min-height
        backgroundColor: "var(--primary-dark)",
        color: "white",
        transition: "0.3s",
        paddingTop: "20px",
      }}
      className="shrink-0 sticky top-0" // ← sticky para que siga al scroll
    >
      <button
        onClick={() => setOpen(!open)}
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

      <ul style={{ listStyle: "none", padding: "0" }}>
        <li style={{ padding: "15px", cursor: "pointer" }} onClick={() => navigate("/")}>
          🏠 {open && "Inicio"}
        </li>
        <li style={{ padding: "15px", cursor: "pointer" }} onClick={() => navigate("/inventario")}>
          📦 {open && "Inventario"}
        </li>
        <li style={{ padding: "15px", cursor: "pointer" }} onClick={() => navigate("/reportes")}>
          📊 {open && "Reportes"}
        </li>
        <li style={{ padding: "15px", cursor: "pointer" }} onClick={() => navigate("/ventas")}>
          💰 {open && "Ventas"}
        </li>
        <li style={{ padding: "15px", cursor: "pointer" }} onClick={() => navigate("/login")}>
          🔐 {open && "Login"}
        </li>
        <li style={{ padding: "15px", cursor: "pointer" }} onClick={() => navigate("/perfil")}>
          👤 {open && "Perfil"}
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;