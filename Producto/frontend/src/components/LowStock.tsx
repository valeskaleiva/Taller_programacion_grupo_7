export default function LowStock() {
  const productos = [
    { nombre: "Caterpie", cantidad: 2 },
    { nombre: "Clefairy", cantidad: 1 },
    { nombre: "Solgaleo", cantidad: 0 },
  ];

  return (
    <div className="bg-white p-5 rounded-xl shadow-lg">
      <h4 className="font-bold mb-3">⚠️ Bajo Stock</h4>

      {productos.map((p, i) => (
        <div
          key={i}
          className="flex justify-between bg-gray-100 p-2 rounded mb-2"
        >
          <span>{p.nombre}</span>
          <span className={p.cantidad <= 1 ? "text-red-500 font-bold" : ""}>
            {p.cantidad}
          </span>
        </div>
      ))}
    </div>
  );
}