import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { loginAdmin } from "../services/api"

function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setError("")

    if (!username.trim() || !password.trim()) {
      setError("Ingresa usuario y contraseña.")
      return
    }

    try {
      setLoading(true)
      const user = await loginAdmin(username.trim(), password)
      navigate(user.rol === 'vendedor' ? "/ventas" : "/", { replace: true })
    } catch {
      setError("Acceso denegado. Verifica usuario, contraseña y rol activo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1c7f63_0%,#0b3d2e_42%,#06271e_100%)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-transparent rounded-2xl p-5 sm:p-6">
        <div className="text-center mb-5">
          <img
            src="/logo-gecko.png"
            alt="logo"
            className="w-[260px] h-[280px] mx-auto mb-2 object-contain"
          />
          <h1 className="text-xl font-extrabold text-white">Acceso al Sistema</h1>
          <p className="text-sm text-white/90 mt-1">Roles habilitados: administrador y vendedor</p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-white tracking-wide">USUARIO</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/40 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white tracking-wide">CONTRASEÑA</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/40 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-sm px-3 py-2 rounded-lg border border-white/40 bg-red-700/70 text-white">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-black font-semibold rounded-lg px-4 py-2.5 transition"
          >
            {loading ? "Validando..." : "Ingresar"}
          </button>
        </form>

        <p className="text-center text-xs text-white mt-4">
          Si no tienes acceso, solicita habilitación al administrador del sistema.
        </p>
      </div>
    </div>
  )
}

export default Login