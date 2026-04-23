export default function LastSales() {
  const ventas = [
    { cliente: "Juan", producto: "Charizard", total: 5000 },
    { cliente: "Ana", producto: "Pikachu", total: 3000 },
  ];

  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h4 className="font-bold mb-3">🧾 Últimas Ventas</h4>

      {ventas.map((v, i) => (
        <div
          key={i}
          className="flex justify-between bg-gray-100 p-3 rounded mb-2"
        >
          <div>
            <p className="font-semibold">{v.producto}</p>
            <p className="text-sm text-gray-500">{v.cliente}</p>
          </div>
          <span className="font-bold">${v.total}</span>
        </div>
      ))}
    </div>
  );
}