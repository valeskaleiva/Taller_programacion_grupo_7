import { useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import SalesChart from "../components/SalesChart";
import TopProducts from "../components/TopProducts";
import LowStock from "../components/LowStock";
import LastSales from "../components/LastSales";
import {
  getProductos,
  getProductosBajoStock,
  getTopProductosVendidos,
  getVentas,
  type VentaResumen,
} from "../services/api";
import type { Producto } from "../types";

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
          categoria: 'Producto',
          stock: item.stock,
        }))
      );
      setVentas(ventasData.slice(0, 5));
    }

    void load();
  }, []);

  const totalStock = useMemo(() => productos.reduce((acc, p) => acc + p.stock, 0), [productos]);
  const totalProductos = productos.length;
  const ventasHoy = useMemo(
    () =>
      ventas.reduce((acc, v) => {
        const value = typeof v.total_pagado === 'string' ? Number(v.total_pagado) : v.total_pagado;
        return acc + (Number.isFinite(value) ? value : 0);
      }, 0),
    [ventas]
  );
  const valorInventario = useMemo(
    () => productos.reduce((acc, p) => acc + p.precio_base * p.stock, 0),
    [productos]
  );

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
      <SalesChart ventas={ventas} />

      {/* FILA 3: Top Cartas + Stock Crítico */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <TopProducts topVendidos={topVendidos} />
        <LowStock productos={bajoStock} />
      </div>

      {/* FILA 4: Últimas Ventas ancho completo */}
      <LastSales ventas={ventas} />
    </div>
  );
}