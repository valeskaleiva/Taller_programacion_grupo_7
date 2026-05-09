import Sidebar from "./components/Sidebar"
import Footer from "./components/Footer"
import Header from "./components/Header"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Reportes from "./pages/Reportes"
import Perfil from "./pages/Perfil"
import Inventario from "./pages/Inventario"
import Ventas from "./pages/Ventas"
import Usuarios from "./pages/Usuarios"
import Busqueda from "./pages/Busqueda"
import { Routes, Route, useLocation } from "react-router-dom"

function App() {
  const location = useLocation()
  const isLogin = location.pathname === "/login"

  return (
  <div className="flex min-h-screen w-full bg-gray-100">

    {/* SIDEBAR */}
    {!isLogin && <Sidebar />}

    {/* CONTENIDO */}
    <div className="flex-1 flex flex-col min-w-0">

      {/* HEADER */}
      {!isLogin && <Header titulo="DASHBOARD" />}

      {/* CONTENIDO REAL */}
      <main className="flex-1 bg-gray-100 p-3 sm:p-6">
        <div className="bg-white rounded-2xl shadow p-3 sm:p-6 h-full flex flex-col min-w-0 overflow-x-hidden">
        <div className="flex-1"> 
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/busqueda" element={<Busqueda />} />
        </Routes>
      </div>
        </div>
      </main>

      {/* FOOTER */}
      {!isLogin && <Footer />}
      
    </div>
  </div>
)
}

 
export default App