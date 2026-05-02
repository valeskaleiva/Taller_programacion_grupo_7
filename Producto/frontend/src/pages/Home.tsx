import Card from "../components/Card";
import SalesChart from "../components/SalesChart";|
import TopProducts from "../components/TopProducts";
import LowStock from "../components/LowStock";
import LastSales from "../components/LastSales";
import { mockProductos } from "../utils/mockData";

export default function Home() {
  const totalStock = mockProductos.reduce((acc, p) => acc + p.stock, 0);
  const totalProductos = mockProductos.length;
  const ventasHoy = 186220;
  const valorInventario = mockProductos.reduce((acc, p) => acc + p.precio_base * p.stock, 0);

  return (
    <div className="space-y-6 p-2 sm:p-4">
      {/* FILA 1: 4 KPIs en una sola fila */}
      <div className="grid grid-cols-4 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card title="💰 Ventas hoy" value={`$${ventasHoy.toLocaleString('es-CL')}`} extra="+12% vs ayer" />
        <Card title="📦 Unidades en stock" value={totalStock} />
        <Card title="🧾 Productos" value={totalProductos} />
        <Card title="🏦 Valor inventario" value={`$${valorInventario.toLocaleString('es-CL')}`} />
      </div>

      {/* FILA 2: Gráfico ancho completo */}
      <SalesChart />

      {/* FILA 3: Top Cartas + Stock Crítico */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <TopProducts />
        <LowStock />
      </div>

      {/* FILA 4: Últimas Ventas ancho completo */}
      <LastSales />
    </div>
  );
}