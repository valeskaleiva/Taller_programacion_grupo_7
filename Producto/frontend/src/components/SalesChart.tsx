import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
type DailySalesPoint = {
  dia: string;
  etiqueta: string;
  ventas: number;
};

type Props = {
  data?: DailySalesPoint[];
};

const formatCLP = (v: number) =>
  v >= 1000 ? `${Math.round(v / 1000)}k CLP` : `${v} CLP`;

export default function SalesChart({ data = [] }: Props) {
  return (
    <div
      className="dashboard-panel-font bg-white p-4 sm:p-6 rounded-2xl h-full relative z-10"
      style={{
        border: "2px solid rgba(11, 61, 46, 0.35)",
        boxShadow: "0 38px 88px rgba(0, 0, 0, 0.42), 0 18px 42px rgba(11, 61, 46, 0.34)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-800 font-bold text-base">📊 Ventas Diarias</h3>
        <span className="text-xs text-gray-400">Últimos días</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="dia"
            tick={{ fontSize: 13, fill: "#1F2937", fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatCLP}
            tick={{ fontSize: 12, fill: "#1F2937", fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Bar
            dataKey="ventas"
            fill="#0B3D2E"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}