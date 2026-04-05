import { useState, useEffect, useMemo } from 'react';
import { fetchPois, createPoi, updatePoi, deletePoi } from '../../api/poi.js';
import { clearToken } from '../../api/auth.js';
import { AdminNavTabs } from './AdminRestaurants.jsx';
import ConfirmModal from './ConfirmModal.jsx';

const EMPTY = { name: '', poiType: null, photos: [], mainPhoto: null, mountains: null, development: null, verticalExtent: null, altitude: null, rockType: null };

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

export default function AdminPoi() {
  const [pois, setPois]         = useState([]);
  const [search, setSearch]     = useState('');
  const [error, setError]       = useState('');
  const [toast, setToast]       = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filterMountains, setFilterMountains] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortKey, setSortKey]   = useState('name');
  const [sortDir, setSortDir]   = useState('asc');

  useEffect(() => {
    fetchPois().then(setPois).catch((e) => setError(e.message));
  }, []);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  function handleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  async function handleAdd() {
    try {
      const p = await createPoi({ ...EMPTY, name: 'Punct nou' });
      window.location.href = `/admin/poi/${p._id}/edit`;
    } catch (e) { setError(e.message); }
  }

  async function handleToggleActive(id, currentActive) {
    try {
      await updatePoi(id, { active: !currentActive });
      setPois((prev) => prev.map((p) => p._id === id ? { ...p, active: !currentActive } : p));
    } catch (e) { setError(e.message); }
  }

  async function handleDelete() {
    const { id } = confirmDelete;
    setConfirmDelete(null);
    try {
      await deletePoi(id);
      setPois((prev) => prev.filter((p) => p._id !== id));
      showToast('Șters');
    } catch (e) { setError(e.message); }
  }

  function handleLogout() { clearToken(); window.location.href = '/admin'; }

  const mountainOptions = useMemo(() => [...new Set(pois.map((p) => p.mountains).filter(Boolean))].sort(), [pois]);
  const typeOptions     = useMemo(() => [...new Set(pois.map((p) => p.poiType).filter(Boolean))].sort(), [pois]);

  const SORT_FNS = {
    name:           (a, b) => (a.name || '').localeCompare(b.name || ''),
    poiType:        (a, b) => (a.poiType || '').localeCompare(b.poiType || ''),
    mountains:      (a, b) => (a.mountains || '').localeCompare(b.mountains || ''),
    development:    (a, b) => (a.development ?? -1) - (b.development ?? -1),
    verticalExtent: (a, b) => (a.verticalExtent ?? -1) - (b.verticalExtent ?? -1),
    altitude:       (a, b) => (a.altitude ?? -1) - (b.altitude ?? -1),
  };

  const displayed = useMemo(() => {
    let result = pois.filter((p) => {
      if (search && ![p.name, p.mountains, p.rockType, p.poiType].join(' ').toLowerCase().includes(search.toLowerCase())) return false;
      if (filterMountains && p.mountains !== filterMountains) return false;
      if (filterType && p.poiType !== filterType) return false;
      return true;
    });
    const fn = SORT_FNS[sortKey];
    if (fn) result = [...result].sort((a, b) => sortDir === 'asc' ? fn(a, b) : fn(b, a));
    return result;
  }, [pois, search, filterMountains, filterType, sortKey, sortDir]);

  const hasFilters = search || filterMountains || filterType;

  return (
    <div className="admin-wrap">
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/favicon.svg" alt="" style={{ width: '2rem', height: '2rem', borderRadius: '7px' }} />
          <div>
            <div className="admin-header-title">Puncte de interes</div>
            <div className="admin-header-sub">Trail Mix</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="admin-count">{pois.length} puncte</span>
          <button className="admin-logout" onClick={handleLogout}>Sign out</button>
        </div>
      </header>

      <div className="admin-content">
        {error && <div className="error-banner">⚠ {error}</div>}
        <AdminNavTabs active="poi" />

        <div className="admin-toolbar">
          <input className="admin-search" type="search" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="admin-filter-select" value={filterMountains} onChange={(e) => setFilterMountains(e.target.value)}>
            <option value="">Toți munții</option>
            {mountainOptions.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select className="admin-filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">Toate tipurile</option>
            {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {hasFilters && (
            <button className="admin-filter-clear" onClick={() => { setSearch(''); setFilterMountains(''); setFilterType(''); }}>
              Clear
            </button>
          )}
          <button className="btn btn-add" onClick={handleAdd}>+ Adaugă punct</button>
        </div>

        <div className="admin-toolbar-count">
          {displayed.length !== pois.length
            ? `${displayed.length} din ${pois.length} puncte`
            : `${pois.length} puncte`}
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: '100px' }}></th>
                <SortTh label="Nume"        sortKey="name"           current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortTh label="Tip"         sortKey="poiType"        current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortTh label="Munți"       sortKey="mountains"      current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortTh label="Dezvoltare"  sortKey="development"    current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortTh label="Denivelarea" sortKey="verticalExtent" current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortTh label="Altitudine"  sortKey="altitude"       current={sortKey} dir={sortDir} onSort={handleSort} />
                <th>Tip rocă</th>
                <th title="Vizibil pe site">Activ</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr><td colSpan={10} className="no-results">Niciun punct de interes găsit.</td></tr>
              ) : (
                displayed.map((p) => (
                  <tr key={p._id} className={`admin-row${p.active === false ? ' admin-row--inactive' : ''}`} onClick={() => { window.location.href = `/admin/poi/${p._id}/edit`; }}>
                    <td className="admin-cell-img">
                      {p.mainPhoto || p.photos?.[0]
                        ? <img src={p.mainPhoto || p.photos[0]} alt="" className="admin-thumb" />
                        : <div className="admin-thumb-placeholder" />}
                    </td>
                    <td className="admin-cell-name">{p.name}</td>
                    <td>{p.poiType || '—'}</td>
                    <td>{p.mountains || '—'}</td>
                    <td>{p.development != null ? `${p.development} m` : '—'}</td>
                    <td>{p.verticalExtent != null ? `${p.verticalExtent} m` : '—'}</td>
                    <td>{p.altitude != null ? `${p.altitude} m` : '—'}</td>
                    <td>{p.rockType || '—'}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="admin-active-toggle"
                        checked={p.active !== false}
                        onChange={() => handleToggleActive(p._id, p.active !== false)}
                        title="Vizibil pe site"
                      />
                    </td>
                    <td className="actions" onClick={(e) => e.stopPropagation()}>
                      <button className="btn-edit" onClick={() => { window.location.href = `/admin/poi/${p._id}/edit`; }}>Edit</button>
                      <button className="btn-delete" onClick={() => setConfirmDelete({ id: p._id, name: p.name })}>✕</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <div className="toast show">{toast}</div>}
      {confirmDelete && (
        <ConfirmModal
          message={`Ștergi "${confirmDelete.name}"?`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
