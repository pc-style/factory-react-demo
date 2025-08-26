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
    <div className="app-shell">
      {/* ===== Sidebar ===== */}
      <aside className="sidebar">
        <h2>Kategorie</h2>
        <ul className="list">
          <li
            className={`category-item ${category === '' ? 'active' : ''}`}
            onClick={() => setCategory('')}
          >
            Wszystkie
          </li>
          {categories.map((c) => (
            <li
              key={c.key}
              className={`category-item ${category === c.key ? 'active' : ''}`}
              onClick={() => setCategory(c.key)}
            >
              {c.label}
            </li>
          ))}
        </ul>
      </aside>

      {/* ===== Main content ===== */}
      <main className="main">
        <h1>Przeglądarka dokumentów medycznych</h1>

        {/* Toolbar */}
        <div className="toolbar">
          <label>
            Rok:{' '}
            <select
              className="select"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">Wszystkie</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>

          <input
            className="input"
            type="text"
            value={query}
            placeholder="Nazwa pliku lub treść PDF…"
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1, minWidth: '160px' }}
          />

          {/* Result count */}
          {!loading && (
            <span style={{ marginLeft: 'auto', color: 'var(--gray-300)' }}>
              {docs.length} wyników
            </span>
          )}
        </div>

        {/* results */}
        {loading ? (
          <p>Ładowanie…</p>
        ) : docs.length === 0 ? (
          <p>Brak wyników.</p>
        ) : (
          <ul className="list">
            {docs.map((doc) => (
              <li key={doc.id} className="list-item">
                <div>
                  <strong>{doc.filename}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gray-300)' }}>
                    {doc.categoryLabel} {doc.year ? `• ${doc.year}` : ''}
                  </div>
                </div>
                <button className="btn" onClick={() => handleOpen(doc.absPath)}>
                  Otwórz
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
