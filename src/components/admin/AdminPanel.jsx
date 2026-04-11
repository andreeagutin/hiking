import { useState, useEffect, useMemo } from 'react';
import { fetchHikes, createHike, deleteHike, updateHike } from '../../api/hikes.js';
import { clearToken } from '../../api/auth.js';
import { AdminNavTabs } from './AdminRestaurants.jsx';

const n = (v) => (v != null && v !== '' ? v : '—');

function SortTh({ label, sortKey, current, dir, onSort, style }) {
  const active = current === sortKey;
  return (
    <th
      className={active ? dir : ''}
      style={{ cursor: 'pointer', userSelect: 'none', ...style }}
      onClick={() => onSort(sortKey)}
    >
      {label}<span className="sort-icon" />
    </th>
  );
}

function ViewRow({ hike, onDelete, onToggleActive }) {
  function handleDelete(e) {
    e.stopPropagation();
    if (!confirm(`Delete "${hike.name}"?`)) return;
    onDelete(hike._id);
  }

  return (
    <tr className={`admin-row${hike.active === false ? ' admin-row--inactive' : ''}`} onClick={() => { window.location.href = `/admin/hike/${hike._id}/edit`; }}>
      <td className="admin-cell-img">
        {(hike.mainPhoto || hike.photos?.[0] || hike.imageUrl)
          ? <img src={hike.mainPhoto || hike.photos?.[0] || hike.imageUrl} alt="" className="admin-thumb" />
          : <div className="admin-thumb-placeholder" />}
      </td>
      <td className="admin-cell-name">{hike.name || <em className="admin-no-name">Unnamed</em>}</td>
      <td>{n(hike.mountains)}</td>
      <td>{n(hike.zone)}</td>
      <td>{hike.distance ? `${hike.distance} km` : '—'}</td>
      <td>{hike.time ? `${hike.time} h` : '—'}</td>
      <td>{hike.up ? `↑${hike.up}m` : '—'}</td>
      <td>
        {hike.difficulty
          ? <span className={`badge diff-${hike.difficulty}`}>{hike.difficulty}</span>
          : '—'}
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          className="admin-active-toggle"
          checked={hike.active !== false}
          onChange={() => onToggleActive(hike._id, hike.active !== false)}
          title="Visible on site"
        />
      </td>
      <td className="actions" onClick={(e) => e.stopPropagation()}>
        <button
          className="btn-edit"
          onClick={() => { window.location.href = `/admin/hike/${hike._id}/edit`; }}
        >
          Edit
        </button>
        <button className="btn-delete" onClick={handleDelete}>✕</button>
      </td>
    </tr>
  );
}

export default function AdminPanel() {
  const [hikes, setHikes]       = useState([]);
  const [toast, setToast]       = useState('');
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [filterMountains, setFilterMountains] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [sortKey, setSortKey]   = useState('name');
  const [sortDir, setSortDir]   = useState('asc');

  useEffect(() => {
    fetchHikes({ all: true }).then(setHikes).catch((e) => setError(e.message));
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  function handleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  async function handleAdd() {
    try {
      const hike = await createHike({ name: 'New hike' });
      window.location.href = `/admin/hike/${hike._id}/edit`;
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteHike(id);
      setHikes((prev) => prev.filter((h) => h._id !== id));
      showToast('Deleted');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleToggleActive(id, currentActive) {
    try {
      await updateHike(id, { active: !currentActive });
      setHikes((prev) => prev.map((h) => h._id === id ? { ...h, active: !currentActive } : h));
    } catch (e) {
      setError(e.message);
    }
  }

  function handleLogout() {
    clearToken();
    window.location.reload();
  }

  const mountainOptions = useMemo(() => [...new Set(hikes.map((h) => h.mountains).filter(Boolean))].sort(), [hikes]);

  const SORT_FNS = {
    name:       (a, b) => (a.name || '').localeCompare(b.name || ''),
    mountains:  (a, b) => (a.mountains || '').localeCompare(b.mountains || ''),
    zone:       (a, b) => (a.zone || '').localeCompare(b.zone || ''),
    distance:   (a, b) => (a.distance ?? -1) - (b.distance ?? -1),
    time:       (a, b) => (a.time ?? -1) - (b.time ?? -1),
    up:         (a, b) => (a.up ?? -1) - (b.up ?? -1),
    difficulty: (a, b) => (a.difficulty || '').localeCompare(b.difficulty || ''),
  };

  const displayed = useMemo(() => {
    let result = hikes.filter((h) => {
      if (search && !Object.values(h).join(' ').toLowerCase().includes(search.toLowerCase())) return false;
      if (filterMountains && h.mountains !== filterMountains) return false;
      if (filterDifficulty && h.difficulty !== filterDifficulty) return false;
      if (filterActive === 'active' && h.active === false) return false;
      if (filterActive === 'inactive' && h.active !== false) return false;
      return true;
    });
    const fn = SORT_FNS[sortKey];
    if (fn) result = [...result].sort((a, b) => sortDir === 'asc' ? fn(a, b) : fn(b, a));
    return result;
  }, [hikes, search, filterMountains, filterDifficulty, filterActive, sortKey, sortDir]);

  const hasFilters = search || filterMountains || filterDifficulty || filterActive;

  return (
    <div className="admin-wrap">
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/hikenSeek-owl-icon.svg" alt="" style={{ width: '2rem', height: '2rem', borderRadius: '7px' }} />
          <div>
            <div className="admin-header-title">Admin Panel</div>
            <div className="admin-header-sub">Hike'n'Seek</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="admin-count">{hikes.length} hikes</span>
          <button className="admin-logout" onClick={handleLogout}>Sign out</button>
        </div>
      </header>

      <div className="admin-content">
        {error && <div className="error-banner">⚠ {error}</div>}
        <AdminNavTabs active="hikes" />

        <div className="admin-toolbar">
          <input
            className="admin-search"
            type="search"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="admin-filter-select" value={filterMountains} onChange={(e) => setFilterMountains(e.target.value)}>
            <option value="">All mountains</option>
            {mountainOptions.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select className="admin-filter-select" value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}>
            <option value="">All difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
          </select>
          <select className="admin-filter-select" value={filterActive} onChange={(e) => setFilterActive(e.target.value)}>
            <option value="">All</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>
          {hasFilters && (
            <button className="admin-filter-clear" onClick={() => { setSearch(''); setFilterMountains(''); setFilterDifficulty(''); setFilterActive(''); }}>
              Clear
            </button>
          )}
          <button className="btn btn-add" onClick={handleAdd}>+ Add hike</button>
        </div>

        <div className="admin-toolbar-count">
          {displayed.length !== hikes.length
            ? `${displayed.length} of ${hikes.length} hikes`
            : `${hikes.length} hikes`}
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: '100px' }}></th>
                <SortTh label="Name"       sortKey="name"       current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortTh label="Mountains"  sortKey="mountains"  current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortTh label="Zone"       sortKey="zone"       current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortTh label="Distance"   sortKey="distance"   current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortTh label="Time"       sortKey="time"       current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortTh label="Elevation ↑" sortKey="up"        current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortTh label="Difficulty" sortKey="difficulty" current={sortKey} dir={sortDir} onSort={handleSort} />
                <th title="Visible on site">Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr><td colSpan={11} className="no-results">No hikes found.</td></tr>
              ) : (
                displayed.map((hike) => (
                  <ViewRow key={hike._id} hike={hike} onDelete={handleDelete} onToggleActive={handleToggleActive} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <div className="toast show">{toast}</div>}
    </div>
  );
}
