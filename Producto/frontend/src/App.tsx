import { useEffect, useState } from "react"
import Sidebar from "./components/Sidebar"
import Footer from "./components/Footer"
import Header from "./components/Header"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Reportes from "./pages/Reportes"
import Perfil from "./pages/Perfil"
import Inventario from "./pages/Inventario"
import AgregarProducto from "./pages/AgregarProducto"
import EditarProducto from "./pages/EditarProducto"
import Ventas from "./pages/Ventas"
import Usuarios from "./pages/Usuarios"

import BuscadorTCGPlayer from "./pages/BuscadorTCGPlayer"
import Busqueda from "./pages/Busqueda"
import { Routes, Route, useLocation, Navigate } from "react-router-dom"
import { clearAuthTokens, getStoredAuthUser } from "./services/api"

const ACCESS_TOKEN_KEY = "gecko_access_token"

function App() {
  const location = useLocation()
  const isLogin = location.pathname === "/login"
  const [authLoading, setAuthLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [rol, setRol] = useState<"admin" | "vendedor">("admin")

  useEffect(() => {
    function validateAdminSession() {
      const hasToken = Boolean(localStorage.getItem(ACCESS_TOKEN_KEY))
      if (!hasToken) {
        setIsAuthenticated(false)
        setAuthLoading(false)
        return
      }

      const localUser = getStoredAuthUser()
      if (localUser?.rol) {
        setRol(localUser.rol)
      }

      setIsAuthenticated(true)
      setAuthLoading(false)
    }

    validateAdminSession()
  }, [isLogin])

  useEffect(() => {
    if (isLogin) return

    const onStorage = () => {
      const hasToken = Boolean(localStorage.getItem(ACCESS_TOKEN_KEY))
      if (!hasToken) {
        clearAuthTokens()
        setIsAuthenticated(false)
      }
    }

    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [isLogin])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-600">
        Validando sesión de administrador...
      </div>
    )
  }

  if (isLogin && isAuthenticated) {
    return <Navigate to={rol === "vendedor" ? "/ventas" : "/"} replace />
  }

  if (!isLogin && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const isVendedor = rol === "vendedor"

  return (
  <div className="flex min-h-screen w-full bg-gray-100">

    {/* SIDEBAR */}
    {!isLogin && <Sidebar />}

    {/* CONTENIDO */}
    <div className="flex-1 flex flex-col min-w-0">

      {/* HEADER */}
      {!isLogin && <Header />}

      {/* CONTENIDO REAL */}
      <main className="flex-1 bg-gray-100 p-3 sm:p-6">
        <div className="bg-white rounded-2xl shadow p-3 sm:p-6 h-full flex flex-col min-w-0 overflow-x-hidden">
        <div className="flex-1"> 
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/inventario/agregar" element={isVendedor ? <Navigate to="/inventario" replace /> : <AgregarProducto />} />
          <Route path="/inventario/editar/:id" element={isVendedor ? <Navigate to="/inventario" replace /> : <EditarProducto />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/usuarios" element={<Usuarios />} />
<Route path="/tcgplayer" element={<BuscadorTCGPlayer />} />
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