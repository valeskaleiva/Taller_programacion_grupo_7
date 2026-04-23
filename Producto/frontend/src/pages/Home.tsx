import Card from "../components/Card";
import SalesChart from "../components/SalesChart";
import TopProducts from "../components/TopProducts";
import LowStock from "../components/LowStock";
import LastSales from "../components/LastSales";

export default function Home() {
  const stats = {
    ventas: 300000,
    cambioVentas: 15,
    stock: 6,
    productos: 320,
  };

  return (
    <div className="p-6 md:p-10 bg-gray-100 min-h-screen space-y-6">
                        
        n
      {/* FILA 1: 3 Cards - Ventas, Stock, Productos */}
<div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card 
          title="💰 Ventas" 
          value={`$${stats.ventas.toLocaleString()}`} 
          extra={`+${stats.cambioVentas}%`} 
        />
        <Card title="📦 Stock" value={stats.stock} />
        <Card title="🧾 Productos" value={stats.productos} />
      </div>

      {/* FILA 2: Gráfico + Top Products (2 columnas) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        <SalesChart />
        <TopProducts />
      </div>
       <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">

       
      </div>

      {/* FILA 3: Bajo Stock + Últimas Ventas + Total $5000 (3 columnas) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6" >
        <LowStock />
        <LastSales />
        
      
      </div>

    </div>
  );
}