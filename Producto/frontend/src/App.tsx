import Sidebar from "./components/Sidebar"
import Footer from "./components/Footer"
import Header from "./components/Header"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Reportes from "./pages/Reportes"
import Perfil from "./pages/Perfil"
import { Routes, Route, useLocation } from "react-router-dom"

function App() {
  const location = useLocation()
  const isLogin = location.pathname === "/login"

  return (
  <div className="flex min-h-screen">

    {/* SIDEBAR */}
    {!isLogin && <Sidebar />}

    {/* CONTENIDO */}
    <div className="flex-1 flex flex-col">

      {/* HEADER */}
      {!isLogin && <Header titulo="DASHBOARD" />}

      {/* CONTENIDO REAL */}
      <main className="flex-1 bg-gray-100 p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow p-6 h-full flex flex-col">
        <div className="flex-1"> 
        <Routes>
          <Route path="/login" element={<Login />} />
         
          <Route path="/" element={<Home />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/perfil" element={<Perfil />} />
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