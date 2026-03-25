import { useState, useEffect } from 'react';
import { fetchHikes, createHike, updateHike, deleteHike } from '../../api/hikes.js';
import { clearToken } from '../../api/auth.js';

const n = (v) => v ?? '';

const sel = (key, opts, form, set) => (
  <select className="edit-input" value={form[key] ?? ''} onChange={set(key)}>
    <option value=""></option>
    {opts.map((o) => <option key={o}>{o}</option>)}
  </select>
);

function EditRow({ hike, onSave, onCancel, onDelete }) {
  const [form, setForm] = useState({ ...hike });

  const set = (key) => (e) => {
    const numFields = ['time', 'distance', 'up', 'down'];
    const raw = e.target.value;
    setForm((f) => ({
      ...f,
      [key]: numFields.includes(key) ? (raw === '' ? null : parseFloat(raw)) : (raw === '' ? null : raw),
    }));
  };

  return (
    <tr className="editing">
      <td><input className="edit-input" type="text"   value={n(form.name)}      onChange={set('name')} /></td>
      <td><input className="edit-input" type="number" value={n(form.time)}      onChange={set('time')}     step="0.01" /></td>
      <td><input className="edit-input" type="number" value={n(form.distance)}  onChange={set('distance')} step="0.01" /></td>
      <td>{sel('tip',        ['Dus-intors', 'Dus'], form, set)}</td>
      <td><input className="edit-input" type="number" value={n(form.up)}        onChange={set('up')} /></td>
      <td><input className="edit-input" type="number" value={n(form.down)}      onChange={set('down')} /></td>
      <td>{sel('difficulty', ['easy', 'medium', 'hard'], form, set)}</td>
      <td><input className="edit-input" type="text"   value={n(form.mountains)} onChange={set('mountains')} /></td>
      <td>{sel('status',     ['Done', 'In progress', 'Not started'], form, set)}</td>
      <td><input className="edit-input" type="text"   value={n(form.completed)} onChange={set('completed')} placeholder="dd/mm/yyyy" /></td>
      <td><input className="edit-input" type="text"   value={n(form.zone)}      onChange={set('zone')} /></td>
      <td><input className="edit-input" type="text"   value={n(form.imageUrl)}  onChange={set('imageUrl')} placeholder="https://…" /></td>
      <td className="actions">
        <button className="btn-ok"     onClick={() => onSave(form)}>Save</button>
        <button className="btn-cancel" onClick={onCancel}>Cancel</button>
        <button className="btn-delete" onClick={() => onDelete(hike._id)}>✕</button>
      </td>
    </tr>
  );
}

function ViewRow({ hike, onEdit }) {
  return (
    <tr>
      <td>{n(hike.name)}</td>
      <td>{n(hike.time)}</td>
      <td>{n(hike.distance)}</td>
      <td>{n(hike.tip)}</td>
      <td>{n(hike.up)}</td>
      <td>{n(hike.down)}</td>
      <td>{n(hike.difficulty)}</td>
      <td>{n(hike.mountains)}</td>
      <td>{n(hike.status)}</td>
      <td>{n(hike.completed)}</td>
      <td>{n(hike.zone)}</td>
      <td className="admin-image-cell">
        {hike.imageUrl
          ? <a href={hike.imageUrl} target="_blank" rel="noreferrer" className="admin-img-link">View</a>
          : <span className="admin-no-img">—</span>}
      </td>
      <td className="actions">
        <button className="btn-edit" onClick={() => onEdit(hike._id)}>Edit</button>
      </td>
    </tr>
  );
}

export default function AdminPanel() {
  const [hikes, setHikes] = useState([]);
  const [editingId, setEditingId] = useState(null);
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
      const hike = await createHike({
        name: '', time: null, distance: null, tip: null,
        up: null, down: null, difficulty: null, mountains: null,
        status: 'Not started', completed: null, zone: null, imageUrl: null,
      });
      setHikes((prev) => [...prev, hike]);
      setEditingId(hike._id);
    } catch (e) { setError(e.message); }
  }

  async function handleSave(form) {
    try {
      const updated = await updateHike(form._id, form);
      setHikes((prev) => prev.map((h) => (h._id === updated._id ? updated : h)));
      setEditingId(null);
      showToast('Saved');
    } catch (e) { setError(e.message); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this hike?')) return;
    try {
      await deleteHike(id);
      setHikes((prev) => prev.filter((h) => h._id !== id));
      setEditingId(null);
      showToast('Deleted');
    } catch (e) { setError(e.message); }
  }

  function handleCancel() {
    const hike = hikes.find((h) => h._id === editingId);
    if (hike && !hike.name) {
      deleteHike(hike._id).catch(() => {});
      setHikes((prev) => prev.filter((h) => h._id !== editingId));
    }
    setEditingId(null);
  }

  function handleLogout() {
    clearToken();
    window.location.reload();
  }

  const filtered = hikes.filter((h) =>
    !search || Object.values(h).join(' ').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-wrap">
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '1.4rem' }}>🏔️</span>
          <div>
            <div className="admin-header-title">Admin Panel</div>
            <div className="admin-header-sub">Hiking Vision 2025</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="admin-count">{hikes.length} hikes</span>
          <button className="admin-logout" onClick={handleLogout}>Sign out</button>
        </div>
      </header>

      <div className="admin-content">
        {error && <div className="error-banner">⚠ {error}</div>}

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
                <th>Name</th>
                <th>Time (h)</th>
                <th>Distance (km)</th>
                <th>Type</th>
                <th>Up (m)</th>
                <th>Down (m)</th>
                <th>Difficulty</th>
                <th>Mountains</th>
                <th>Status</th>
                <th>Completed</th>
                <th>Zone</th>
                <th>Image URL</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={13} className="no-results">No hikes found.</td></tr>
              ) : (
                filtered.map((hike) =>
                  hike._id === editingId ? (
                    <EditRow key={hike._id} hike={hike} onSave={handleSave} onCancel={handleCancel} onDelete={handleDelete} />
                  ) : (
                    <ViewRow key={hike._id} hike={hike} onEdit={setEditingId} />
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <div className="toast show">{toast}</div>}
    </div>
  );
}
