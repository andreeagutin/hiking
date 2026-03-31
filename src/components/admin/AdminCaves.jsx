import { useState, useEffect } from 'react';
import { fetchCaves, createCave, deleteCave } from '../../api/caves.js';
import { clearToken } from '../../api/auth.js';
import { AdminNavTabs } from './AdminRestaurants.jsx';

const EMPTY = { name: '', photos: [], mainPhoto: null, mountains: null, development: null, verticalExtent: null, altitude: null, rockType: null };

export default function AdminCaves() {
  const [caves, setCaves]   = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError]   = useState('');
  const [toast, setToast]   = useState('');

  useEffect(() => {
    fetchCaves().then(setCaves).catch((e) => setError(e.message));
  }, []);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  async function handleAdd() {
    try {
      const c = await createCave({ ...EMPTY, name: 'New cave' });
      window.location.href = `/admin/cave/${c._id}/edit`;
    } catch (e) { setError(e.message); }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await deleteCave(id);
      setCaves((prev) => prev.filter((c) => c._id !== id));
      showToast('Deleted');
    } catch (e) { setError(e.message); }
  }

  function handleLogout() { clearToken(); window.location.href = '/admin'; }

  const filtered = caves.filter(
    (c) => !search || [c.name, c.mountains, c.rockType].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-wrap">
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '1.4rem' }}>🦇</span>
          <div>
            <div className="admin-header-title">Caves</div>
            <div className="admin-header-sub">Trail Mix</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="admin-count">{caves.length} caves</span>
          <button className="admin-logout" onClick={handleLogout}>Sign out</button>
        </div>
      </header>

      <div className="admin-content">
        {error && <div className="error-banner">⚠ {error}</div>}
        <AdminNavTabs active="caves" />

        <div className="admin-toolbar">
          <input className="admin-search" type="search" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="btn btn-add" onClick={handleAdd}>+ Add cave</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: '100px' }}></th>
                <th>Name</th>
                <th>Mountains</th>
                <th>Development</th>
                <th>Vertical extent</th>
                <th>Altitude</th>
                <th>Rock type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="no-results">No caves found.</td></tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c._id} className="admin-row" onClick={() => { window.location.href = `/admin/cave/${c._id}/edit`; }}>
                    <td className="admin-cell-img">
                      {c.mainPhoto || c.photos?.[0]
                        ? <img src={c.mainPhoto || c.photos[0]} alt="" className="admin-thumb" />
                        : <div className="admin-thumb-placeholder" />}
                    </td>
                    <td className="admin-cell-name">{c.name}</td>
                    <td>{c.mountains || '—'}</td>
                    <td>{c.development != null ? `${c.development} m` : '—'}</td>
                    <td>{c.verticalExtent != null ? `${c.verticalExtent} m` : '—'}</td>
                    <td>{c.altitude != null ? `${c.altitude} m` : '—'}</td>
                    <td>{c.rockType || '—'}</td>
                    <td className="actions" onClick={(e) => e.stopPropagation()}>
                      <button className="btn-edit" onClick={() => { window.location.href = `/admin/cave/${c._id}/edit`; }}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(c._id, c.name)}>✕</button>
                    </td>
                  </tr>
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
