import { useState, useEffect } from 'react';
import { fetchPois, createPoi, updatePoi, deletePoi } from '../../api/poi.js';
import { clearToken } from '../../api/auth.js';
import { AdminNavTabs } from './AdminRestaurants.jsx';
import ConfirmModal from './ConfirmModal.jsx';

const EMPTY = { name: '', poiType: null, photos: [], mainPhoto: null, mountains: null, development: null, verticalExtent: null, altitude: null, rockType: null };

export default function AdminPoi() {
  const [pois, setPois]         = useState([]);
  const [search, setSearch]     = useState('');
  const [error, setError]       = useState('');
  const [toast, setToast]       = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, name }

  useEffect(() => {
    fetchPois().then(setPois).catch((e) => setError(e.message));
  }, []);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2500); }

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

  const filtered = pois.filter(
    (p) => !search || [p.name, p.mountains, p.rockType, p.poiType].join(' ').toLowerCase().includes(search.toLowerCase())
  );

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
          <button className="btn btn-add" onClick={handleAdd}>+ Adaugă punct</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: '100px' }}></th>
                <th>Nume</th>
                <th>Tip</th>
                <th>Munți</th>
                <th>Dezvoltare</th>
                <th>Denivelarea</th>
                <th>Altitudine</th>
                <th>Tip rocă</th>
                <th title="Vizibil pe site">Activ</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="no-results">Niciun punct de interes găsit.</td></tr>
              ) : (
                filtered.map((p) => (
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
