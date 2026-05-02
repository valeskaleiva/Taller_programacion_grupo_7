import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { mes: "Oct", ventas: 320000 },
  { mes: "Nov", ventas: 485000 },
  { mes: "Dic", ventas: 710000 },
  { mes: "Ene", ventas: 395000 },
  { mes: "Feb", ventas: 460000 },
  { mes: "Mar", ventas: 528000 },
  { mes: "Abr", ventas: 186220 },
];

const formatCLP = (v: number) =>
  v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`;

export default function SalesChart() {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-800 font-bold text-base">📊 Ventas Mensuales</h3>
        <span className="text-xs text-gray-400">Últimos 7 meses</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="mes"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatCLP}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip
            formatter={(v: number) => [`$${v.toLocaleString("es-CL")}`, "Ventas"]}
            contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,.1)" }}
          />
          <Bar dataKey="ventas" fill="#0B3D2E" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}