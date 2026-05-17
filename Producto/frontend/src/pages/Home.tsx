import { useEffect, useMemo, useState } from "react";
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
  type VentaResumen,
} from "../services/api";
import type { Producto } from "../types";

const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

const formatCLP = (amount: number) => clpFormatter.format(amount);

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [topVendidos, setTopVendidos] = useState<Array<{ nombre: string; cantidad_vendida: number }>>([]);
  const [bajoStock, setBajoStock] = useState<Array<{ id_producto: number; nombre: string; categoria: string; stock: number }>>([]);
  const [ventas, setVentas] = useState<VentaResumen[]>([]);

  useEffect(() => {
    async function load() {
      const [productosData, topData, bajoStockData, ventasData] = await Promise.all([
        getProductos(),
        getTopProductosVendidos(),
        getProductosBajoStock(),
        getVentas(),
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
    }

    void load();
  }, []);

  const totalStock = useMemo(() => productos.reduce((acc, p) => acc + p.stock, 0), [productos]);
  const totalProductos = productos.length;
  const ventasHoy = useMemo(() => {
    const hoy = new Date();
    return ventas.reduce((acc, v) => {
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
  }, [ventas]);

  const ultimasVentas = useMemo(
    () => [...ventas].sort((a, b) => new Date(b.fecha_venta).getTime() - new Date(a.fecha_venta).getTime()).slice(0, 5),
    [ventas]
  );
  const valorInventario = useMemo(
    () => productos.reduce((acc, p) => acc + p.precio_base * p.stock, 0),
    [productos]
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
          <Card title="Valor inventario" value={formatCLP(valorInventario)} />
        </div>
      </div>

      {/* FILA 2: Gráfico ancho completo */}
      <div>
        <SalesChart ventas={ventas} />
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