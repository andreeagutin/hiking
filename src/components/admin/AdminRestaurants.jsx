import { useState, useEffect } from 'react';
import { fetchRestaurants, createRestaurant, updateRestaurant, deleteRestaurant } from '../../api/restaurants.js';
import { clearToken } from '../../api/auth.js';
import ConfirmModal from './ConfirmModal.jsx';

const EMPTY = { name: '', type: null, mountains: null, zone: null, address: null, link: null, notes: null };

function AdminNavTabs({ active }) {
  return (
    <div className="admin-nav-tabs">
      <button className={`admin-nav-tab${active === 'hikes' ? ' active' : ''}`} onClick={() => { window.location.href = '/admin'; }}>Hikes</button>
      <button className={`admin-nav-tab${active === 'poi' ? ' active' : ''}`} onClick={() => { window.location.href = '/admin/poi'; }}>Puncte de interes</button>
    </div>
  );
}

export { AdminNavTabs };

export default function AdminRestaurants() {
  const [restaurants, setRestaurants]   = useState([]);
  const [search, setSearch]             = useState('');
  const [error, setError]               = useState('');
  const [toast, setToast]               = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, name }

  useEffect(() => {
    fetchRestaurants().then(setRestaurants).catch((e) => setError(e.message));
  }, []);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  async function handleAdd() {
    try {
      const r = await createRestaurant({ ...EMPTY, name: 'New restaurant' });
      window.location.href = `/admin/restaurant/${r._id}/edit`;
    } catch (e) { setError(e.message); }
  }

  async function handleToggleActive(id, currentActive) {
    try {
      await updateRestaurant(id, { active: !currentActive });
      setRestaurants((prev) => prev.map((r) => r._id === id ? { ...r, active: !currentActive } : r));
    } catch (e) { setError(e.message); }
  }

  async function handleDelete() {
    const { id } = confirmDelete;
    setConfirmDelete(null);
    try {
      await deleteRestaurant(id);
      setRestaurants((prev) => prev.filter((r) => r._id !== id));
      showToast('Deleted');
    } catch (e) { setError(e.message); }
  }

  function handleLogout() { clearToken(); window.location.href = '/admin'; }

  const filtered = restaurants.filter(
    (r) => !search || Object.values(r).join(' ').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-wrap">
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/favicon.svg" alt="" style={{ width: '2rem', height: '2rem', borderRadius: '7px' }} />
          <div>
            <div className="admin-header-title">Restaurants</div>
            <div className="admin-header-sub">Trail Mix</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="admin-count">{restaurants.length} places</span>
          <button className="admin-logout" onClick={handleLogout}>Sign out</button>
        </div>
      </header>

      <div className="admin-content">
        {error && <div className="error-banner">⚠ {error}</div>}
        <AdminNavTabs active="restaurants" />

        <div className="admin-toolbar">
          <input className="admin-search" type="search" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="btn btn-add" onClick={handleAdd}>+ Add restaurant</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Mountains</th>
                <th>Zone</th>
                <th>Address</th>
                <th title="Visible on site">Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="no-results">No restaurants found.</td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id} className={`admin-row${r.active === false ? ' admin-row--inactive' : ''}`} onClick={() => { window.location.href = `/admin/restaurant/${r._id}/edit`; }}>
                    <td className="admin-cell-name">{r.name}</td>
                    <td>{r.type || '—'}</td>
                    <td>{r.mountains || '—'}</td>
                    <td>{r.zone || '—'}</td>
                    <td>{r.address || '—'}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="admin-active-toggle"
                        checked={r.active !== false}
                        onChange={() => handleToggleActive(r._id, r.active !== false)}
                        title="Visible on site"
                      />
                    </td>
                    <td className="actions" onClick={(e) => e.stopPropagation()}>
                      <button className="btn-edit" onClick={() => { window.location.href = `/admin/restaurant/${r._id}/edit`; }}>Edit</button>
                      <button className="btn-delete" onClick={() => setConfirmDelete({ id: r._id, name: r.name })}>✕</button>
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
