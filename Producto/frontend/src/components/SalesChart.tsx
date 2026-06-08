import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);

export default function SalesChart({ data = [] }: Props) {
  const handleBarDoubleClick = (entry: unknown) => {
    const payload = (entry as { payload?: { etiqueta?: string; ventas?: number } })?.payload;
    if (!payload) return;

    const etiqueta = payload.etiqueta ?? "Día";
    const total = Number(payload.ventas ?? 0);
    const totalFormateado = formatCurrency(Number.isFinite(total) ? total : 0);

    if (typeof window !== "undefined") {
      window.alert(`Ventas de ${etiqueta}: ${totalFormateado}`);
    }
  };

  return (
    <div
      className="dashboard-panel-font bg-white p-4 sm:p-6 rounded-2xl h-full relative z-10"
      style={{
        border: "2px solid rgba(11, 61, 46, 0.35)",
        boxShadow: "0 38px 88px rgba(0, 0, 0, 0.42), 0 18px 42px rgba(11, 61, 46, 0.34)",
        transform: "translateY(-2px)",
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
          <Tooltip
            labelFormatter={(label, payload) => {
              const first = payload?.[0]?.payload as { etiqueta?: string } | undefined;
              return first?.etiqueta ?? String(label ?? "");
            }}
            formatter={(v) => {
              const value = typeof v === "number" ? v : Number(v ?? 0);
              return [formatCurrency(value), "Ventas"];
            }}
            contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,.1)" }}
          />
          <Bar
            dataKey="ventas"
            fill="#0B3D2E"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
            onDoubleClick={handleBarDoubleClick}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}