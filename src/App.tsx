import './styles.css';
import { useEffect, useState } from 'react';

type Category = { key: string; label: string };

interface DocItem {
  id: string;
  filename: string;
  categoryLabel: string;
  year: string | null;
  absPath: string;
}

export default function App() {
  /* ---------- meta ---------- */
  const [categories, setCategories] = useState<Category[]>([]);
  const [years, setYears] = useState<string[]>([]);

  /* ---------- filters ---------- */
  const [category, setCategory] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [query, setQuery] = useState<string>('');

  /* ---------- data ---------- */
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  /* ---------- fetch meta on mount ---------- */
  useEffect(() => {
    (async () => {
      try {
        const meta = await window.docs.meta();
        setCategories(meta.categories);
        setYears(meta.years);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  /* ---------- debounced search ---------- */
  useEffect(() => {
    let active = true;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const result =
          query.trim() === ''
            ? await window.docs.list({ category, year })
            : await window.docs.search({ q: query, category, year });
        if (active) {
          setDocs(result);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    }, 300); // debounce 300 ms

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [category, year, query]);

  /* ---------- helpers ---------- */
  const handleOpen = async (absPath: string) => {
    await window.docs.open(absPath);
  };

  /* ---------- render ---------- */
  return (
    <main className="container" style={{ maxWidth: 960 }}>
      <h1>Przeglądarka dokumentów medycznych</h1>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
        }}
      >
        {/* category select */}
        <label>
          Kategoria:{' '}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Wszystkie</option>
            {categories.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        {/* year select */}
        <label>
          Rok:{' '}
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">Wszystkie</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>

        {/* search input */}
        <label style={{ flex: 1 }}>
          Szukaj:{' '}
          <input
            style={{ width: '100%' }}
            type="text"
            value={query}
            placeholder="Nazwa pliku lub treść PDF…"
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      {/* results */}
      {loading ? (
        <p>Ładowanie…</p>
      ) : docs.length === 0 ? (
        <p>Brak wyników.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {docs.map((doc) => (
            <li
              key={doc.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem 0',
                borderBottom: '1px solid #ddd',
              }}
            >
              <div>
                <strong>{doc.filename}</strong>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  {doc.categoryLabel} {doc.year ? `• ${doc.year}` : ''}
                </div>
              </div>
              <button className="cta" onClick={() => handleOpen(doc.absPath)}>
                Otwórz
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
