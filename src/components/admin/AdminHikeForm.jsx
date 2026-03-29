import { useState, useEffect } from 'react';
import { fetchHike, createHike, updateHike, deleteHike } from '../../api/hikes.js';
import { clearToken } from '../../api/auth.js';

const EMPTY = {
  name: '', time: null, distance: null, tip: null,
  up: null, down: null, difficulty: null, mountains: null,
  status: 'Not started', completed: null, zone: null, imageUrl: null,
};

function Field({ label, children, full }) {
  return (
    <div className={`form-field${full ? ' form-field-full' : ''}`}>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

export default function AdminHikeForm({ id }) {
  const isNew = !id;
  const [form, setForm]     = useState(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (!isNew) {
      fetchHike(id)
        .then((h) => { setForm(h); setLoading(false); })
        .catch((e) => { setError(e.message); setLoading(false); });
    }
  }, [id, isNew]);

  function set(key) {
    const NUM = ['time', 'distance', 'up', 'down'];
    return (e) => {
      const raw = e.target.value;
      setForm((f) => ({
        ...f,
        [key]: NUM.includes(key)
          ? (raw === '' ? null : parseFloat(raw))
          : (raw === '' ? null : raw),
      }));
    };
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name) { setError('Name is required'); return; }
    setSaving(true);
    setError('');
    try {
      if (isNew) {
        await createHike(form);
      } else {
        await updateHike(id, form);
      }
      window.location.href = '/admin';
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${form.name}"?`)) return;
    try {
      await deleteHike(id);
      window.location.href = '/admin';
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    clearToken();
    window.location.href = '/admin';
  }

  if (loading) return <div className="detail-loading">Loading…</div>;

  return (
    <div className="admin-wrap">
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="admin-back-btn" onClick={() => window.location.href = '/admin'}>
            ← Back
          </button>
          <div>
            <div className="admin-header-title">{isNew ? 'New hike' : 'Edit hike'}</div>
            {!isNew && form.name && <div className="admin-header-sub">{form.name}</div>}
          </div>
        </div>
        <button className="admin-logout" onClick={handleLogout}>Sign out</button>
      </header>

      <div className="admin-form-content">
        {error && <div className="error-banner">⚠ {error}</div>}

        <form className="admin-form-card" onSubmit={handleSave}>

          {/* Image preview */}
          {form.imageUrl && (
            <div className="form-image-preview">
              <img src={form.imageUrl} alt="Preview" />
            </div>
          )}

          <div className="form-section-title">Photo</div>
          <div className="form-grid">
            <Field label="Image URL" full>
              <input type="url" value={form.imageUrl ?? ''} onChange={set('imageUrl')} placeholder="https://…" />
            </Field>
          </div>

          <div className="form-section-title">Basic info</div>
          <div className="form-grid">
            <Field label="Name *" full>
              <input type="text" value={form.name ?? ''} onChange={set('name')} placeholder="Trail name" required />
            </Field>
            <Field label="Mountains">
              <input type="text" value={form.mountains ?? ''} onChange={set('mountains')} placeholder="e.g. Bucegi" />
            </Field>
            <Field label="Zone">
              <input type="text" value={form.zone ?? ''} onChange={set('zone')} placeholder="e.g. Prahova" />
            </Field>
          </div>

          <div className="form-section-title">Stats</div>
          <div className="form-grid">
            <Field label="Distance (km)">
              <input type="number" step="0.1" min="0" value={form.distance ?? ''} onChange={set('distance')} placeholder="0.0" />
            </Field>
            <Field label="Time (hours)">
              <input type="number" step="0.5" min="0" value={form.time ?? ''} onChange={set('time')} placeholder="0.0" />
            </Field>
            <Field label="Elevation up (m)">
              <input type="number" min="0" value={form.up ?? ''} onChange={set('up')} placeholder="0" />
            </Field>
            <Field label="Elevation down (m)">
              <input type="number" min="0" value={form.down ?? ''} onChange={set('down')} placeholder="0" />
            </Field>
          </div>

          <div className="form-section-title">Details</div>
          <div className="form-grid">
            <Field label="Difficulty">
              <select value={form.difficulty ?? ''} onChange={set('difficulty')}>
                <option value="">—</option>
                <option>easy</option>
                <option>medium</option>
                <option>hard</option>
              </select>
            </Field>
            <Field label="Trip type">
              <select value={form.tip ?? ''} onChange={set('tip')}>
                <option value="">—</option>
                <option>Dus-intors</option>
                <option>Dus</option>
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status ?? 'Not started'} onChange={set('status')}>
                <option>Not started</option>
                <option>In progress</option>
                <option>Done</option>
              </select>
            </Field>
            <Field label="Completed (dd/mm/yyyy)">
              <input type="text" value={form.completed ?? ''} onChange={set('completed')} placeholder="dd/mm/yyyy" />
            </Field>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-form-save" disabled={saving}>
              {saving ? 'Saving…' : 'Save hike'}
            </button>
            <button type="button" className="btn btn-form-cancel" onClick={() => window.location.href = '/admin'}>
              Cancel
            </button>
            {!isNew && (
              <button type="button" className="btn btn-form-delete" onClick={handleDelete}>
                Delete hike
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
