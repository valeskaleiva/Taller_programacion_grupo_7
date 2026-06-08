import { useCallback, useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import SalesChart from "../components/SalesChart";
import TopProducts from "../components/TopProducts";
import LowStock from "../components/LowStock";
import LastSales from "../components/LastSales.tsx";
import {
  getVentaMetodoPago,
  getProductos,
  getProductosBajoStock,
  getTopProductosVendidos,
  getVentas,
  getVentasDiarias,
  type VentaResumen,
  type VentaDiaria,
} from "../services/api";
import type { Producto } from "../types";

const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

const formatCLP = (amount: number) => clpFormatter.format(amount);
const HIDDEN_PRODUCTS_STORAGE_KEY = 'gecko_hidden_product_ids';

const toLocalIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const readHiddenProductIds = (): number[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(HIDDEN_PRODUCTS_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0);
  } catch {
    return [];
  }
};

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosOcultos, setProductosOcultos] = useState<number[]>(() => readHiddenProductIds());
  const [topVendidos, setTopVendidos] = useState<Array<{ nombre: string; cantidad_vendida: number }>>([]);
  const [bajoStock, setBajoStock] = useState<Array<{ id_producto: number; nombre: string; categoria: string; stock: number }>>([]);
  const [ventas, setVentas] = useState<VentaResumen[]>([]);
  const [ventasDiarias, setVentasDiarias] = useState<VentaDiaria[]>([]);

  const loadDashboard = useCallback(async () => {
    const hoy = new Date();
    const desde = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 6);

    const [productosData, topData, bajoStockData, ventasData, ventasDiariasData] = await Promise.all([
      getProductos(),
      getTopProductosVendidos(),
      getProductosBajoStock(),
      getVentas(),
      getVentasDiarias(toLocalIsoDate(desde), toLocalIsoDate(hoy)),
    ]);

    setProductos(productosData);

    const categoriaPorId = new Map<number, string>(
      productosData.map((p) => [p.id_producto, p.categoria])
    );

    setTopVendidos(
      topData.map((item) => ({
        nombre: item.id_producto__nombre,
        cantidad_vendida: item.cantidad_vendida,
      }))
    );
    setBajoStock(
      bajoStockData.map((item) => ({
        id_producto: item.id_producto,
        nombre: item.nombre,
        categoria: categoriaPorId.get(item.id_producto) ?? 'Producto',
        stock: item.stock,
      }))
    );
    setVentas(
      ventasData.map((venta) => ({
        ...venta,
        metodo_pago: getVentaMetodoPago(venta.id_venta) ?? venta.metodo_pago,
      }))
    );
    setVentasDiarias(ventasDiariasData);
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const onFocus = () => {
      void loadDashboard();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', onFocus);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', onFocus);
      }
    };
  }, [loadDashboard]);

  useEffect(() => {
    const syncHiddenProducts = () => {
      setProductosOcultos(readHiddenProductIds());
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', syncHiddenProducts);
      window.addEventListener('storage', syncHiddenProducts);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', syncHiddenProducts);
        window.removeEventListener('storage', syncHiddenProducts);
      }
    };
  }, []);

  const productosVisibles = useMemo(
    () => productos.filter((p) => !productosOcultos.includes(p.id_producto)),
    [productos, productosOcultos]
  );

  const totalStock = useMemo(() => productosVisibles.reduce((acc, p) => acc + p.stock, 0), [productosVisibles]);
  const totalProductos = productosVisibles.length;
  const ventasActivas = useMemo(
    () => ventas.filter((venta) => {
      const value = typeof venta.total_pagado === 'string' ? Number(venta.total_pagado) : venta.total_pagado;
      return Number.isFinite(value) && value > 0;
    }),
    [ventas]
  );

  const ventasHoy = useMemo(() => {
    const hoy = new Date();
    return ventasActivas.reduce((acc, v) => {
      const fecha = new Date(v.fecha_venta);
      if (Number.isNaN(fecha.getTime())) return acc;

      const esHoy =
        fecha.getFullYear() === hoy.getFullYear() &&
        fecha.getMonth() === hoy.getMonth() &&
        fecha.getDate() === hoy.getDate();
      if (!esHoy) return acc;

      const value = typeof v.total_pagado === 'string' ? Number(v.total_pagado) : v.total_pagado;
      return acc + (Number.isFinite(value) ? value : 0);
    }, 0);
  }, [ventasActivas]);

  const ventasDiariasTotal = useMemo(() => {
    const hoy = toLocalIsoDate(new Date());
    const todayRow = ventasDiarias.find((item) => item.fecha === hoy);
    return Number(todayRow?.transacciones ?? 0);
  }, [ventasDiarias]);

  const datosVentasDiarias = useMemo(
    () => ventasDiarias.map((item) => ({
      dia: new Date(item.fecha).toLocaleDateString("es-CL", { weekday: "short", day: "2-digit" }),
      etiqueta: new Date(item.fecha).toLocaleDateString("es-CL", { weekday: "long", day: "2-digit", month: "short" }),
      ventas: Number(item.ventas) || 0,
    })),
    [ventasDiarias]
  );

  const ultimasVentas = useMemo(
    () => [...ventas].sort((a, b) => new Date(b.fecha_venta).getTime() - new Date(a.fecha_venta).getTime()).slice(0, 5),
    [ventas]
  );
  return (
    <div className="p-3 sm:p-5">
      {/* FILA 1: 4 KPIs en una sola fila */}
      <div
        className="mb-20 rounded-2xl p-3"
        style={{ boxShadow: "0 20px 44px rgba(0, 0, 0, 0.22), 0 10px 24px rgba(11, 61, 46, 0.20)" }}
      >
        <div className="grid grid-cols-4 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <Card title=" Ventas hoy" value={formatCLP(ventasHoy)} extra="Actualizado en tiempo real" />
          <Card title="Unidades en stock" value={totalStock} />
          <Card title="Productos" value={totalProductos} />
          <Card title="Venta del día" value={ventasDiariasTotal} />
        </div>
      </div>

      {/* FILA 2: Gráfico ancho completo */}
      <div>
        <SalesChart data={datosVentasDiarias} />
      </div>

      {/* FILA 3: Top Cartas + Stock Crítico */}
      <div className="mt-20 grid grid-cols-1 xl:grid-cols-2 gap-x-5 gap-y-20 xl:gap-y-5">
        <TopProducts topVendidos={topVendidos} />
        <LowStock productos={bajoStock} />
      </div>

      {/* FILA 4: Últimas Ventas ancho completo */}
      <div className="mt-20">
        <LastSales ventas={ultimasVentas} />
      </div>
    </div>
  );
}