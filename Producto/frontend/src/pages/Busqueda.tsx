import { useEffect, useMemo, useState } from 'react';
import { getProductos } from '../services/mockApi';
import type { Producto } from '../types';

function buildImageUrl(producto: Producto): string {
  const text = encodeURIComponent(producto.nombre);
  return `https://placehold.co/140x196/f7f7f7/1f2937?text=${text}`;
}

function buildSourceUrl(producto: Producto): string {
  const query = encodeURIComponent(producto.nombre);
  return `https://www.tcgplayer.com/search/all/product?q=${query}`;
}

export default function Busqueda() {
  const [termino, setTermino] = useState('');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const data = await getProductos();
        setProductos(data);
      } finally {
        setLoading(false);
      }
    }

    cargar();
  }, []);

  const resultados = useMemo(() => {
    const texto = termino.trim().toLowerCase();
    if (!texto) {
      return [];
    }

    return productos.filter((p) => {
      return (
        p.nombre.toLowerCase().includes(texto) ||
        p.codigo_barras.toLowerCase().includes(texto) ||
        p.descripcion.toLowerCase().includes(texto)
      );
    });
  }, [termino, productos]);

  return (
    <section className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-4 sm:p-6 lg:p-8">
      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-5">
        <label htmlFor="busqueda-producto" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Buscar producto
        </label>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1 rounded-2xl border-2 border-emerald-700 bg-emerald-100/60 shadow-sm focus-within:ring-4 focus-within:ring-emerald-200">
            <input
              id="busqueda-producto"
              type="text"
              value={termino}
              onChange={(event) => setTermino(event.target.value)}
              placeholder="Escribe nombre, código o descripción"
              className="w-full rounded-2xl border-0 bg-transparent py-3 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-2 font-medium text-slate-600">Búsqueda</span>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Resultados</h2>
              <p className="text-sm text-slate-500">
                {loading
                  ? 'Cargando productos...'
                  : termino.trim() === ''
                    ? 'Escribe algo en el buscador para ver resultados.'
                    : resultados.length === 0
                      ? 'No se encontraron resultados para esa búsqueda.'
                      : 'Productos encontrados para tu búsqueda.'}
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              {loading ? '...' : `${resultados.length} resultados`}
            </span>
          </div>

          {loading ? (
            <div className="grid place-items-center rounded-[24px] border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
              <div className="max-w-md space-y-3">
                <div className="mx-auto h-14 w-14 animate-pulse rounded-2xl bg-sky-100 ring-1 ring-sky-200" />
                <h3 className="text-lg font-semibold text-slate-900">Cargando productos...</h3>
                <p className="text-sm leading-6 text-slate-500">
                  Espera un momento mientras cargamos el catálogo para que puedas buscar.
                </p>
              </div>
            </div>
          ) : resultados.length === 0 ? (
            <div className="grid place-items-center rounded-[24px] border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
              <div className="max-w-md space-y-3">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-sky-100 ring-1 ring-sky-200" />
                <h3 className="text-lg font-semibold text-slate-900">
                  {termino.trim() === '' ? 'Aún no has hecho una búsqueda' : 'Sin coincidencias'}
                </h3>
                <p className="text-sm leading-6 text-slate-500">
                  {termino.trim() === ''
                    ? 'Escribe el nombre, código o descripción de un producto para empezar.'
                    : 'Prueba con otro término o revisa la ortografía para encontrar el producto.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {resultados.map((producto) => {
                const imageUrl = buildImageUrl(producto);
                const sourceUrl = buildSourceUrl(producto);

                return (
                  <article
                    key={producto.id_producto}
                    className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(15,23,42,0.12)]"
                  >
                    <div className="relative aspect-[5/4] bg-white p-3 sm:p-4">
                      <div className="absolute left-3 top-3 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
                        TCG
                      </div>
                      <div className="flex h-full items-center justify-center">
                        <img
                          src={imageUrl}
                          alt={producto.nombre}
                          loading="lazy"
                          className="max-h-[160px] w-auto object-contain transition duration-500 group-hover:scale-[1.02]"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 p-4">
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-slate-900">{producto.nombre}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2">{producto.descripcion}</p>
                      </div>

                      <div className="grid gap-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700 ring-1 ring-slate-100">
                        <p>
                          <span className="font-semibold text-slate-900">Precio:</span> ${producto.precio_base.toLocaleString('es-CL')}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-900">Código:</span> {producto.codigo_barras}
                        </p>
                      </div>

                      <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-slate-800 to-sky-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-800/20 transition hover:scale-[1.01] hover:from-slate-900 hover:to-sky-800"
                      >
                        Ver en TCGPlayer
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
      </div>
    </section>
  );
}
