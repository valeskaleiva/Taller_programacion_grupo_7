import { useEffect, useMemo, useState } from 'react';
import { getProductos } from '../services/mockApi';
import type { Producto } from '../types';

function buildImageUrl(producto: Producto): string {
  const text = encodeURIComponent(producto.nombre);
  return `https://placehold.co/180x252/f7f7f7/1f2937?text=${text}`;
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
    <section className="mx-auto w-full max-w-3xl space-y-4">
      <div className="rounded-2xl border border-gray-300 bg-white p-4 shadow-sm">
        <label htmlFor="busqueda-producto" className="mb-2 block text-sm font-semibold text-gray-700">
          Buscar producto
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">­ƒöì</span>
          <input
            id="busqueda-producto"
            type="text"
            value={termino}
            onChange={(event) => setTermino(event.target.value)}
            placeholder="Escribe nombre, codigo o descripcion"
            className="w-full rounded-xl border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-gray-300 bg-white p-4 shadow-sm">
        {loading && <p className="text-sm text-gray-500">Cargando productos...</p>}

        {!loading && termino.trim() === '' && (
          <p className="text-sm text-gray-500">Escribe algo en el buscador para ver resultados.</p>
        )}

        {!loading && termino.trim() !== '' && resultados.length === 0 && (
          <p className="text-sm text-gray-500">No se encontraron resultados para esa busqueda.</p>
        )}

        {!loading && resultados.length > 0 && (
          <div className="space-y-3">
            {resultados.map((producto) => {
              const imageUrl = buildImageUrl(producto);
              const sourceUrl = buildSourceUrl(producto);

              return (
                <article key={producto.id_producto} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div className="mx-auto rounded-md bg-gradient-to-b from-amber-100 to-yellow-200 p-[1px] shadow-sm" style={{ width: '24px' }}>
                    <img
                      src={imageUrl}
                      alt={producto.nombre}
                      loading="lazy"
                      className="rounded-sm border border-amber-300 bg-white object-cover"
                      style={{ width: '22px', height: '31px', display: 'block' }}
                    />
                  </div>

                  <div className="mt-3 min-w-0 space-y-1 text-sm">
                    <p className="text-gray-800">
                      <span className="font-semibold">Nombre:</span> {producto.nombre}
                    </p>
                    <p className="text-gray-800">
                      <span className="font-semibold">Precio:</span> ${producto.precio_base.toLocaleString('es-CL')}
                    </p>
                    <p className="text-gray-800">
                      <span className="font-semibold">Pagina de origen:</span>{' '}
                      <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-blue-600 underline hover:text-blue-700"
                      >
                        {sourceUrl}
                      </a>
                    </p>
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
