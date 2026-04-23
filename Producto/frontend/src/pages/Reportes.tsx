import Header from "../components/Header"
function Reportes() {
  return (
    <>
   
    <Header titulo="REPORTES" />

    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>REPORTES</h2>

      {/* Buscador */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Buscar"
          style={{
            padding: "8px",
            width: "250px",
            marginRight: "10px",
          }}
        />
        <button>IR</button>
      </div>

      {/* Crear reporte */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h4>CREAR REPORTE</h4>

        <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
          <div>
            <label>FECHA INICIO</label>
            <input type="date" />
          </div>

          <div>
            <label>FECHA FINAL</label>
            <input type="date" />
          </div>

          <div>
            <label>TEMA</label>
            <select>
              <option>Inventario</option>
              <option>Ventas</option>
            </select>
          </div>

          <button style={{ alignSelf: "end" }}>CREAR</button>
        </div>
      </div>

      {/* Tabla */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "15px",
          borderRadius: "8px",
        }}
      >
        <table style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>ID INFORME</th>
              <th>FECHA</th>
              <th>ABRIR</th>
              <th>ACCIÓN</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>01A</td>
              <td>25/01/2026</td>
              <td>📄</td>
              <td>⬇️ 🗑️</td>
            </tr>

            <tr>
              <td>02A</td>
              <td>25/02/2026</td>
              <td>📄</td>
              <td>⬇️ 🗑️</td>
            </tr>

            <tr>
              <td>03F</td>
              <td>25/03/2026</td>
              <td>📄</td>
              <td>⬇️ 🗑️</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
     </>
  )
}

export default Reportes