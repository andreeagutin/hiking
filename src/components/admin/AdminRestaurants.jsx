import { useState, useEffect } from 'react';
import { fetchRestaurants, createRestaurant, deleteRestaurant } from '../../api/restaurants.js';
import { clearToken } from '../../api/auth.js';

const EMPTY = { name: '', type: null, mountains: null, zone: null, address: null, link: null, notes: null };

function AdminNavTabs({ active }) {
  return (
    <div className="admin-nav-tabs">
      <button className={`admin-nav-tab${active === 'hikes' ? ' active' : ''}`} onClick={() => { window.location.href = '/admin'; }}>Hikes</button>
      <button className={`admin-nav-tab${active === 'restaurants' ? ' active' : ''}`} onClick={() => { window.location.href = '/admin/restaurants'; }}>Restaurants</button>
      <button className={`admin-nav-tab${active === 'caves' ? ' active' : ''}`} onClick={() => { window.location.href = '/admin/caves'; }}>Caves</button>
    </div>
  );
}

export { AdminNavTabs };

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError]   = useState('');
  const [toast, setToast]   = useState('');

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

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"?`)) return;
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
          <span style={{ fontSize: '1.4rem' }}>🍽️</span>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="no-results">No restaurants found.</td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id} className="admin-row" onClick={() => { window.location.href = `/admin/restaurant/${r._id}/edit`; }}>
                    <td className="admin-cell-name">{r.name}</td>
                    <td>{r.type || '—'}</td>
                    <td>{r.mountains || '—'}</td>
                    <td>{r.zone || '—'}</td>
                    <td>{r.address || '—'}</td>
                    <td className="actions" onClick={(e) => e.stopPropagation()}>
                      <button className="btn-edit" onClick={() => { window.location.href = `/admin/restaurant/${r._id}/edit`; }}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(r._id, r.name)}>✕</button>
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
