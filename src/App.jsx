import { useState, useEffect, useCallback } from 'react';
import Controls from './components/Controls.jsx';
import HikingTable from './components/HikingTable.jsx';
import { fetchHikes, createHike, updateHike, deleteHike } from './api/hikes.js';

const EMPTY_FILTERS = { q: '', status: '', difficulty: '', mountains: '', zone: '', tip: '' };

function Toast({ message }) {
  return message ? <div className="toast show">{message}</div> : null;
}

export default function App() {
  const [hikes, setHikes] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHikes()
      .then((data) => { console.log('✅ hikes loaded:', data); setHikes(data); })
      .catch((e) => { console.error('❌ fetch error:', e.message); setError(e.message); });
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  const filtered = hikes.filter((h) => {
    if (filters.status     && h.status     !== filters.status)     return false;
    if (filters.difficulty && h.difficulty !== filters.difficulty) return false;
    if (filters.mountains  && h.mountains  !== filters.mountains)  return false;
    if (filters.zone       && h.zone       !== filters.zone)       return false;
    if (filters.tip        && h.tip        !== filters.tip)        return false;
    if (filters.q) {
      const q = filters.q.toLowerCase();
      const hay = Object.values(h).join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  async function handleAdd() {
    try {
      const hike = await createHike({
        name: '', time: null, distance: null, tip: null,
        up: null, down: null, difficulty: null, mountains: null,
        status: 'Not started', completed: null, zone: null,
      });
      setHikes((prev) => [...prev, hike]);
      setEditingId(hike._id);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleSave(form) {
    try {
      const updated = await updateHike(form._id, form);
      setHikes((prev) => prev.map((h) => (h._id === updated._id ? updated : h)));
      setEditingId(null);
      showToast('Row saved');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this hike?')) return;
    try {
      await deleteHike(id);
      setHikes((prev) => prev.filter((h) => h._id !== id));
      setEditingId(null);
      showToast('Row deleted');
    } catch (e) {
      setError(e.message);
    }
  }

  function handleCancel() {
    const hike = hikes.find((h) => h._id === editingId);
    if (hike && !hike.name) {
      deleteHike(hike._id).catch(() => {});
      setHikes((prev) => prev.filter((h) => h._id !== editingId));
    }
    setEditingId(null);
  }

  return (
    <>
      <header className="page-header">
        <div className="page-header-icon">🏔️</div>
        <div className="page-header-text">
          <h1>Hiking Vision 2025</h1>
          <p>Trail tracker &amp; planner</p>
        </div>
      </header>

      <div className="page-content">
        {error && <div className="error-banner">⚠ {error}</div>}
        <Controls filters={filters} onChange={setFilters} hikes={hikes} onAdd={handleAdd} />
        <div className="stats">
          {filtered.length === hikes.length
            ? `Showing all ${hikes.length} hikes`
            : `Showing ${filtered.length} of ${hikes.length} hikes`}
        </div>
        <HikingTable
          hikes={filtered}
          editingId={editingId}
          onEdit={setEditingId}
          onSave={handleSave}
          onCancel={handleCancel}
          onDelete={handleDelete}
        />
      </div>

      <Toast message={toast} />
    </>
  );
}
