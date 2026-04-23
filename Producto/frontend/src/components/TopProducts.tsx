export default function TopProducts() {
  const productos = ["Charizard", "Pikachu", "Mew"];

  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h4 className="font-bold mb-3">🔥 Top Productos</h4>

      {productos.map((p, i) => (
        <div
          key={i}
          className="bg-gray-100 p-2 rounded mb-2"
        >
          {p}
        </div>
      ))}
    </div>
  );
}