import './styles.css';
import { useEffect, useState } from 'react';
import {
  MenuIcon,
  SearchIcon,
  PdfIcon,
  OpenIcon,
  RevealIcon,
  CopyIcon,
  CloseIcon,
} from './icons';

type Category = { key: string; label: string };

/* ---------- global typings for Electron preload API ---------- */
declare global {
  interface Window {
    docs?: {
      reveal?: (p: string) => Promise<boolean>;
      copyPath?: (p: string) => Promise<boolean>;
      open?: (p: string) => Promise<boolean>;
      meta?: () => Promise<DocsMeta>;
      list?: (f?: DocsFilter) => Promise<DocumentItem[]>;
      search?: (p: SearchParams) => Promise<DocumentItem[]>;
    };
  }

  /* ===== Minimal duplicates of shared types (to keep this file self-contained
     and satisfy lint without importing from TS declaration file) ===== */
  interface DocsMeta {
    categories: Category[];
    years: string[];
  }

  interface DocsFilter {
    category?: string;
    year?: string;
  }

  interface SearchParams {
    q?: string;
    category?: string;
    year?: string;
  }

  interface DocumentItem {
    id: string;
    filename: string;
    categoryLabel: string;
    year: string | null;
    absPath: string;
  }
}

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
  const [selected, setSelected] = useState<DocItem | null>(null);

  /* ---------- ui feedback ---------- */
  const [toast, setToast] = useState<string>('');
  const showToast = (msg: string) => {
    setToast(msg);
  };
  // auto-dismiss toast after 3 s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---------- layout ---------- */
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const toggleSidebar = () => setSidebarCollapsed((c) => !c);

  /* ---------- environment ---------- */
  // Native (Electron) features available only when preload injected
  const canUseNative =
    !!window.docs && typeof window.docs.reveal === 'function';

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
  const handleReveal = async (absPath: string) => {
    if (!canUseNative) {
      showToast('Funkcja niedostępna w przeglądarce');
      return;
    }
    try {
      const ok = await window.docs.reveal(absPath);
      showToast(ok ? 'Otworzono w eksploratorze' : 'Nie udało się otworzyć');
    } catch (err) {
      console.error(err);
      showToast('Nie udało się otworzyć');
    }
  };
  const handleCopyPath = async (absPath: string) => {
    if (!canUseNative) {
      // Try clipboard fallback directly
      try {
        await navigator.clipboard.writeText(absPath);
        showToast('Ścieżka skopiowana');
      } catch {
        showToast('Funkcja niedostępna w przeglądarce');
      }
      return;
    }
    let ok = false;
    try {
      ok = await window.docs.copyPath(absPath);
    } catch (err) {
      console.error(err);
    }
    if (!ok && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(absPath);
        ok = true;
      } catch {
        /* ignore */
      }
    }
    showToast(ok ? 'Ścieżka skopiowana' : 'Nie udało się skopiować');
  };

  /* ---------- render ---------- */
  return (
    <div className={`app-shell${sidebarCollapsed ? ' collapsed' : ''}`}>
      {/* ===== Sidebar ===== */}
      <aside className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
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
        {/* floating reopen button */}
        {sidebarCollapsed && (
          <button
            className="menu-fab btn-ghost btn-sm"
            aria-label="Pokaż menu"
            onClick={toggleSidebar}
          >
            <MenuIcon className="icon" />
          </button>
        )}
        <h1>Przeglądarka dokumentów medycznych</h1>

        {/* Toolbar */}
        <div className="toolbar sticky">
          {/* sidebar toggle */}
          <button
            className="btn-ghost btn-sm"
            type="button"
            onClick={toggleSidebar}
            aria-label="Zwiń/rozwiń menu"
          >
            <MenuIcon className="icon" />
          </button>

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

          <div className="input-group" style={{ flex: 1, minWidth: '160px' }}>
            <SearchIcon className="icon icon-left" />
            <input
              className="input"
              type="text"
              value={query}
              placeholder="Nazwa pliku lub treść PDF…"
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* chips for active filters */}
          <div className="chips" style={{ marginLeft: 'auto' }}>
            {category && (
              <span className="chip">
                {categories.find((c) => c.key === category)?.label || category}
                <span className="close" onClick={() => setCategory('')}>
                  <CloseIcon className="icon" />
                </span>
              </span>
            )}
            {year && (
              <span className="chip">
                {year}
                <span className="close" onClick={() => setYear('')}>
                  <CloseIcon className="icon" />
                </span>
              </span>
            )}
            {query && (
              <span className="chip">
                „{query}”
                <span className="close" onClick={() => setQuery('')}>
                  <CloseIcon className="icon" />
                </span>
              </span>
            )}
          </div>

          {/* Result count */}
          {!loading && (
            <span style={{ marginLeft: 'auto', color: 'var(--gray-300)' }}>
              {docs.length} wyników
            </span>
          )}
        </div>

        {/* Preview panel */}
        {selected && (
          <div className="preview">
            <embed
              src={`file://${encodeURI(selected.absPath)}`}
              type="application/pdf"
            />
          </div>
        )}

        {/* results */}
        {loading ? (
          <p>Ładowanie…</p>
        ) : docs.length === 0 ? (
          <p>Brak wyników.</p>
        ) : (
          <ul className="list">
            {docs.map((doc) => (
              <li
                key={doc.id}
                className={`list-item ${
                  selected?.id === doc.id ? 'selected' : ''
                }`}
              >
                <div
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelected(doc)}
                >
                  <PdfIcon className="icon" style={{ marginRight: '0.4rem' }} />
                  <strong>{doc.filename}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gray-300)' }}>
                    {doc.categoryLabel} {doc.year ? `• ${doc.year}` : ''}
                  </div>
                </div>
                <div className="actions">
                  <button
                    className="btn"
                    onClick={() => handleOpen(doc.absPath)}
                    aria-label="Otwórz dokument"
                  >
                    <OpenIcon className="icon" />
                    Otwórz
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={() => handleReveal(doc.absPath)}
                    aria-label="Pokaż dokument w folderze"
                  >
                    <RevealIcon className="icon" />
                    Pokaż w folderze
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={() => handleCopyPath(doc.absPath)}
                    aria-label="Kopiuj pełną ścieżkę dokumentu"
                  >
                    <CopyIcon className="icon" />
                    Kopiuj ścieżkę
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {/* toast notification */}
        {toast && <div className="toast">{toast}</div>}
      </main>
    </div>
  );
}
