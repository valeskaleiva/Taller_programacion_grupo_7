import { useEffect, useState } from 'react';
import { buscarPrecioTcgPlayer, type TcgPlayerCard } from '../services/api';

type ParsedCardName = {
  nombre: string;
  rareza: string;
  numero: string;
};

type SearchTerms = {
  nombre: string;
  numero?: string;
};

function parseSearchInput(value: string): SearchTerms {
  const normalized = value.replace(/\s+/g, ' ').trim();

  const serialMatch = normalized.match(/#?(\d{1,3}[\/\-]\d{1,3})/);
  const numero = serialMatch ? serialMatch[1].replace('#', '') : undefined;

  let nombre = normalized;
  if (numero) {
    nombre = normalized.replace(serialMatch?.[0] ?? '', '').trim();
  }

  if (!nombre && numero) {
    nombre = numero;
  }

  return {
    nombre,
    numero,
  };
}

function parseCardName(rawName: string): ParsedCardName {
  const source = rawName.replace(/\s+/g, ' ').trim();

  const numberMatch = source.match(/#?\d+[\/\-]\d+/);
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

const STORAGE_KEY = 'tcgplayer_search_state';

type StoredSearchState = {
  query: string;
  results: TcgPlayerCard[];
  searchInfo: SearchTerms | null;
};

export default function BuscadorTCGPlayer() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<TcgPlayerCard[]>([]);
  const [searchInfo, setSearchInfo] = useState<SearchTerms | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const stored = JSON.parse(raw) as StoredSearchState;
      setQuery(stored.query ?? '');
      setResults(stored.results ?? []);
      setSearchInfo(stored.searchInfo ?? null);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const state: StoredSearchState = {
      query,
      results,
      searchInfo,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [query, results, searchInfo]);

  const onSearch = async () => {
    const value = query.trim();
    if (!value) return;

    const terms = parseSearchInput(value);
    setSearchInfo(terms);
    setLoading(true);
    setError('');
    try {
      const cards = await buscarPrecioTcgPlayer(terms.nombre, terms.numero);
      setResults(cards);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo consultar TCGPlayer.';
      setError(message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setError('');
    setSearchInfo(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-gray-800">Buscador TCGPlayer</h1>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Diseño actualizado · Resultados compactos en tarjetas
          </div>
        </div>
        <p className="text-sm text-gray-500">Busca cartas y precios por nombre o número de serie.</p>
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
          placeholder="Ej: Pikachu #25/111 o Charizard"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          type="button"
          onClick={() => void onSearch()}
          disabled={loading || !query.trim()}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#0B3D2E] border border-[#0B3D2E] hover:bg-[#0a4e3a] disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 bg-slate-100 border border-slate-300 hover:bg-slate-200"
        >
          Limpiar
        </button>
      </div>

      {searchInfo && (
        <div className="flex flex-wrap gap-3 items-center text-sm text-slate-600">
          <span className="px-3 py-2 rounded-full bg-slate-100">Consulta: {searchInfo.nombre}</span>
          {searchInfo.numero && <span className="px-3 py-2 rounded-full bg-slate-100">Serie: {searchInfo.numero}</span>}
          <span className="px-3 py-2 rounded-full bg-slate-100">Resultados: {results.length}</span>
        </div>
      )}

      {error && (
        <div className="text-sm px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700">{error}</div>
      )}

      <div className="space-y-4">
        {results.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
            {loading ? 'Consultando TCGPlayer...' : 'Sin resultados por mostrar. Realiza una búsqueda para ver resultados en tarjetas compactas.'}
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((item, index) => {
              const parsed = parseCardName(item.name);

              return (
                <div
                  key={`${item.url}-${index}`}
                  className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex gap-3">
                    <div className="min-w-[96px] overflow-hidden rounded-xl bg-slate-100">
                      {item.image ? (
                        <img src={item.image} alt={parsed.nombre} className="h-24 w-24 object-cover" />
                      ) : (
                        <div className="h-24 w-24 bg-slate-100" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="text-sm font-semibold text-slate-900 leading-tight">{parsed.nombre}</div>
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{parsed.rareza}</div>
                      <div className="grid gap-2 sm:grid-cols-2 text-xs text-slate-600">
                        <div className="rounded-2xl bg-slate-50 px-2 py-1">Número: {parsed.numero}</div>
                        <div className="rounded-2xl bg-slate-50 px-2 py-1">Set: {item.set || 'Desconocido'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <div className="rounded-2xl bg-emerald-50 px-3 py-2 font-semibold text-emerald-700">
                      {item.currency} {item.price}
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-[#0B3D2E] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0a4e3a]"
                    >
                      Ver en TCGPlayer
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
