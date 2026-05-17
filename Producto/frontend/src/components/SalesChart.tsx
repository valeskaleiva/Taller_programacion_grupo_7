import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { VentaResumen } from "../services/api";

type Props = {
  ventas?: VentaResumen[];
};

const formatCLP = (v: number) =>
  v >= 1000 ? `${Math.round(v / 1000)}k CLP` : `${v} CLP`;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);

const shortMonth = (date: Date) => {
  const raw = date.toLocaleString("es-CL", { month: "short" }).replace(".", "").trim();
  return raw.charAt(0).toUpperCase() + raw.slice(1);
};

export default function SalesChart({ ventas = [] }: Props) {
  const data = useMemo(() => {
    const totalsByMonthKey = new Map<string, number>();

    ventas.forEach((v) => {
      const d = new Date(v.fecha_venta);
      if (Number.isNaN(d.getTime())) return;

      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const value = typeof v.total_pagado === "string" ? Number(v.total_pagado) : v.total_pagado;
      totalsByMonthKey.set(
        monthKey,
        (totalsByMonthKey.get(monthKey) ?? 0) + (Number.isFinite(value) ? value : 0)
      );
    });

    const now = new Date();
    const months: Array<{ mes: string; etiqueta: string; ventas: number }> = [];

    // Siempre renderizamos una ventana fija de 7 meses para evitar saltos visuales.
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({
        mes: shortMonth(d),
        etiqueta: d.toLocaleString("es-CL", { month: "long", year: "numeric" }),
        ventas: totalsByMonthKey.get(monthKey) ?? 0,
      });
    }

    return months;
  }, [ventas]);

  const handleBarDoubleClick = (entry: unknown) => {
    const payload = (entry as { payload?: { etiqueta?: string; ventas?: number } })?.payload;
    if (!payload) return;

    const etiqueta = payload.etiqueta ?? "Mes";
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
        <h3 className="text-gray-800 font-bold text-base">📊 Ventas Mensuales</h3>
        <span className="text-xs text-gray-400">Últimos 7 meses</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="mes"
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