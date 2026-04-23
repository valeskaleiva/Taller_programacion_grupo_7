import { useNavigate } from "react-router-dom"

function Login() {
  
  const navigate = useNavigate()
  return (
    <div
      style={{
        height: "100vh",
        background: "linear-gradient(135deg, #0B3D2E, #145A46)", // 🌲 verde pino elegante
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Logo */}
      <img
        src="/logo-gecko.png"
        alt="logo"
        style={{ width: "100px", marginBottom: "20px" }}
      />

      {/* Título */}
      <h2 style={{ color: "white", marginBottom: "20px" }}>
        INICIAR SESIÓN
      </h2>

      {/* Card */}
      <div
        style={{
          backgroundColor: "#e5e5e5",
          padding: "30px",
          borderRadius: "8px",
          width: "300px",
        }}
      >
        <label>USUARIO</label>
        <input
          type="text"
          style={{
            width: "100%",
            marginBottom: "15px",
            padding: "8px",
          }}


        />

        <label>CONTRASEÑA</label>
        <input
          type="password"
          style={{
            width: "100%",
            marginBottom: "15px",
            padding: "8px",
          }}
          
        />

        <form onSubmit={(e) => {
            e.preventDefault()
            navigate("/home")
        }}></form>

        <button
            type="submit"
            onClick={() => navigate("/Home")}
          style={{
            width: "100%",
            backgroundColor: "#1F7A63",
            color: "white",
            border: "none",
            padding: "10px",
            cursor: "pointer",
            
          }}
        >
          INGRESAR
        </button>

        <p style={{ fontSize: "12px", textAlign: "center", marginTop: "10px" }}>
          ¿OLVIDÓ SU CONTRASEÑA?
        </p>
      </div>
    </div>
  )
}

export default Login