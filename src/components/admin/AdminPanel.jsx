import { useState, useEffect } from 'react';
import { fetchHikes, createHike, deleteHike } from '../../api/hikes.js';
import { clearToken } from '../../api/auth.js';
import { AdminNavTabs } from './AdminRestaurants.jsx';

const n = (v) => (v != null && v !== '' ? v : '—');

function ViewRow({ hike, onDelete }) {
  function handleDelete(e) {
    e.stopPropagation();
    if (!confirm(`Delete "${hike.name}"?`)) return;
    onDelete(hike._id);
  }

  return (
    <tr className="admin-row" onClick={() => { window.location.href = `/admin/hike/${hike._id}/edit`; }}>
      <td className="admin-cell-img">
        {hike.imageUrl
          ? <img src={hike.imageUrl} alt="" className="admin-thumb" />
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
      <td>
        {hike.status
          ? <span className={`badge status-${hike.status.replace(' ', '-')}`}>{hike.status}</span>
          : '—'}
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
  const [hikes, setHikes] = useState([]);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchHikes().then(setHikes).catch((e) => setError(e.message));
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  async function handleAdd() {
    try {
      const hike = await createHike({ ...Object.fromEntries(Object.keys({
        name: '', time: null, distance: null, tip: null,
        up: null, down: null, difficulty: null, mountains: null,
        status: 'Not started', completed: null, zone: null, imageUrl: null,
      }).map((k) => [k, null])), name: '', status: 'Not started' });
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

  function handleLogout() {
    clearToken();
    window.location.reload();
  }

  const filtered = hikes.filter(
    (h) => !search || Object.values(h).join(' ').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-wrap">
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '1.4rem' }}>🏔️</span>
          <div>
            <div className="admin-header-title">Admin Panel</div>
            <div className="admin-header-sub">Trail Mix</div>
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
          <button className="btn btn-add" onClick={handleAdd}>+ Add hike</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: '100px' }}></th>
                <th>Name</th>
                <th>Mountains</th>
                <th>Zone</th>
                <th>Distance</th>
                <th>Time</th>
                <th>Elevation ↑</th>
                <th>Difficulty</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="no-results">No hikes found.</td></tr>
              ) : (
                filtered.map((hike) => (
                  <ViewRow key={hike._id} hike={hike} onDelete={handleDelete} />
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
