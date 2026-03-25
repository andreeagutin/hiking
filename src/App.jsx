import { useState, useEffect } from 'react';
import Controls from './components/Controls.jsx';
import HikingTable from './components/HikingTable.jsx';
import HikeCarousel from './components/HikeCarousel.jsx';
import AdminLogin from './components/admin/AdminLogin.jsx';
import AdminPanel from './components/admin/AdminPanel.jsx';
import { fetchHikes } from './api/hikes.js';
import { isLoggedIn } from './api/auth.js';

const EMPTY_FILTERS = { q: '', status: '', difficulty: '', mountains: '', zone: '', tip: '' };

const isAdminRoute = window.location.pathname === '/admin';

export default function App() {
  // ── Admin routing ──────────────────────────────────────────────
  if (isAdminRoute) {
    const [loggedIn, setLoggedIn] = useState(isLoggedIn());
    if (!loggedIn) return <AdminLogin onSuccess={() => setLoggedIn(true)} />;
    return <AdminPanel />;
  }

  // ── Public view ────────────────────────────────────────────────
  const [hikes, setHikes] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHikes()
      .then(setHikes)
      .catch((e) => setError(e.message));
  }, []);

  const filtered = hikes.filter((h) => {
    if (filters.status     && h.status     !== filters.status)     return false;
    if (filters.difficulty && h.difficulty !== filters.difficulty) return false;
    if (filters.mountains  && h.mountains  !== filters.mountains)  return false;
    if (filters.zone       && h.zone       !== filters.zone)       return false;
    if (filters.tip        && h.tip        !== filters.tip)        return false;
    if (filters.q) {
      const q = filters.q.toLowerCase();
      if (!Object.values(h).join(' ').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <>
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="page-header-icon">🏔️</div>
          <div className="page-header-text">
            <h1>Hiking High</h1>
            <p>Trail tracker &amp; planner</p>
          </div>
        </div>
        <div className="page-header-stats">
          <div className="header-stat">
            <span className="header-stat-value">{hikes.length}</span>
            <span className="header-stat-label">Trails</span>
          </div>
          <div className="header-stat">
            <span className="header-stat-value">{hikes.filter(h => h.status === 'Done').length}</span>
            <span className="header-stat-label">Done</span>
          </div>
          <div className="header-stat">
            <span className="header-stat-value">
              {hikes.filter(h => h.status === 'Done').reduce((s, h) => s + (h.distance || 0), 0).toFixed(0)}
            </span>
            <span className="header-stat-label">km hiked</span>
          </div>
        </div>
      </header>

      <HikeCarousel hikes={hikes} />

      <div className="page-content">
        {error && <div className="error-banner">⚠ {error}</div>}
        <Controls filters={filters} onChange={setFilters} hikes={hikes} />
        <div className="stats">
          {filtered.length === hikes.length
            ? `Showing all ${hikes.length} hikes`
            : `Showing ${filtered.length} of ${hikes.length} hikes`}
        </div>
        <HikingTable hikes={filtered} />
      </div>
    </>
  );
}
