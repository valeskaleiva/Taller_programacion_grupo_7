import { useState } from 'react';
import { buscarPrecioTcgPlayer, type TcgPlayerCard } from '../services/api';

type ParsedCardName = {
  nombre: string;
  rareza: string;
  numero: string;
};

function extractSerial(value: string): string | null {
  const match = value.match(/#?(\d{1,3}\/\d{1,3})/);
  return match?.[1] ?? null;
}

function normalizeSerial(value: string): string {
  return value.replace(/^#/, '').trim();
}

function parseCardName(rawName: string): ParsedCardName {
  const source = rawName.replace(/\s+/g, ' ').trim();

  const numberMatch = source.match(/#?\d+\/\d+/);
  const numero = numberMatch ? (numberMatch[0].startsWith('#') ? numberMatch[0] : `#${numberMatch[0]}`) : 'N/A';

  const rarityMatch = source.match(
    /(Special Illustration Rare|Illustration Rare|Secret Rare|Ultra Rare|Holo Rare|Uncommon|Common|Rare|Promo)/i
  );
  const rareza = rarityMatch?.[0] ?? 'N/A';

  let nombre = source;

  const cleanTailNameMatch = source.match(/#?\d+\/\d+\s*([^\d]+?)\s*(?:\d+\s+listings?|Out of Stock|Market Price:|$)/i);
  if (cleanTailNameMatch?.[1]) {
    nombre = cleanTailNameMatch[1].trim();
  } else if (numberMatch) {
    const before = source.slice(0, numberMatch.index).trim();
    const after = source.slice((numberMatch.index ?? 0) + numberMatch[0].length).trim();
    nombre = before || after || source;
  }

  nombre = nombre
    .replace(/^[\s,:;.-]+|[\s,:;.-]+$/g, '')
    .replace(/\b(Common|Uncommon|Rare|Holo Rare|Ultra Rare|Secret Rare|Promo|Special Illustration Rare|Illustration Rare)\b/gi, '')
    .replace(/\b\d+\s+listings?\b.*$/i, '')
    .replace(/\b(Market Price:|Out of Stock)\b.*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (!nombre) {
    nombre = source;
  }

  return { nombre, rareza, numero };
}

export default function BuscadorTCGPlayer() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<TcgPlayerCard[]>([]);

  const onSearch = async () => {
    const value = query.trim();
    if (!value) return;

    setLoading(true);
    setError('');
    try {
      const cards = await buscarPrecioTcgPlayer(value);
      setResults(cards);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo consultar TCGPlayer.';
      setError(message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Buscador TCGPlayer</h1>
        <p className="text-sm text-gray-500">Aplicación independiente para consultar precios y cartas.</p>
        <p className="text-xs text-amber-700 mt-1">Búsqueda por número de serie desactivada temporalmente. Usa nombre de carta por ahora.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              void onSearch();
            }
          }}
          placeholder="Ej: Pikachu, Charizard"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          onClick={() => void onSearch()}
          disabled={loading || !query.trim()}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {error && (
        <div className="text-sm px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700">{error}</div>
      )}

      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-center px-3 py-2 border-r border-gray-200">Carta</th>
              <th className="text-center px-3 py-2 border-r border-gray-200">Set</th>
              <th className="text-center px-3 py-2 border-r border-gray-200">Precio (USD)</th>
              <th className="text-center px-3 py-2">Fuente</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-gray-500">
                  {loading ? 'Consultando TCGPlayer...' : 'Sin resultados por mostrar'}
                </td>
              </tr>
            ) : (
              results.map((item, index) => {
                const parsed = parseCardName(item.name);

                return (
                <tr key={`${item.url}-${index}`} className="border-b last:border-b-0">
                  <td className="px-3 py-2 text-gray-800 border-r border-gray-100">
                    <div className="font-semibold">{parsed.nombre}</div>
                    <div className="text-xs text-gray-500">Rareza: {parsed.rareza}</div>
                    <div className="text-xs text-gray-500">Numero: {parsed.numero}</div>
                  </td>
                  <td className="px-3 py-2 text-gray-600 text-center border-r border-gray-100">{item.set}</td>
                  <td className="px-3 py-2 font-semibold text-emerald-700 text-center border-r border-gray-100">{item.currency} {item.price}</td>
                  <td className="px-3 py-2 text-blue-700 text-center">
                    <a href={item.url} target="_blank" rel="noreferrer" className="hover:underline">
                      Ver en TCGPlayer
                    </a>
                  </td>
                </tr>
              )})
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
