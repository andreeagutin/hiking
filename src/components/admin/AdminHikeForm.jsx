import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { fetchHikes, fetchHike, createHike, updateHike, deleteHike } from '../../api/hikes.js';
import { clearToken } from '../../api/auth.js';
import { uploadImage } from '../../api/upload.js';

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
  const [form, setForm]         = useState(EMPTY);
  const [original, setOriginal] = useState(EMPTY);
  const [allHikes, setAllHikes] = useState([]);
  const [loading, setLoading]   = useState(!isNew);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState('');
  const fileInputRef = useRef(null);

  const isDirty = JSON.stringify(form) !== JSON.stringify(original);

  useEffect(() => {
    fetchHikes().then(setAllHikes).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isNew) {
      fetchHike(id)
        .then((h) => { setForm(h); setOriginal(h); setLoading(false); })
        .catch((e) => { setError(e.message); setLoading(false); });
    }
  }, [id, isNew]);

  const currentIndex = allHikes.findIndex((h) => h._id === id);
  const prevHike = currentIndex > 0 ? allHikes[currentIndex - 1] : null;
  const nextHike = currentIndex !== -1 && currentIndex < allHikes.length - 1 ? allHikes[currentIndex + 1] : null;

  function navigateTo(hike) {
    if (isDirty && !confirm('Ai modificari nesalvate. Esti sigur ca vrei sa pleci?')) return;
    window.location.href = `/admin/hike/${hike._id}/edit`;
  }

  async function handleImagePick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const { url } = await uploadImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

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

  function handleBack() {
    if (isDirty && !confirm('Ai modificari nesalvate. Esti sigur ca vrei sa pleci?')) return;
    window.location.href = '/admin';
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
          <button className="admin-back-btn" onClick={handleBack}>
            ← Back
          </button>
          <div>
            <div className="admin-header-title">{isNew ? 'New hike' : 'Edit hike'}</div>
            {!isNew && form.name && <div className="admin-header-sub">{form.name}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!isNew && (
            <div className="admin-hike-nav">
              <button
                className="admin-nav-btn"
                onClick={() => prevHike && navigateTo(prevHike)}
                disabled={!prevHike}
                title={prevHike ? prevHike.name : ''}
              >
                ‹
              </button>
              <span className="admin-nav-pos">
                {currentIndex + 1} / {allHikes.length}
              </span>
              <button
                className="admin-nav-btn"
                onClick={() => nextHike && navigateTo(nextHike)}
                disabled={!nextHike}
                title={nextHike ? nextHike.name : ''}
              >
                ›
              </button>
            </div>
          )}
          <button className="admin-logout" onClick={handleLogout}>Sign out</button>
        </div>
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
            <Field label="Upload image" full>
              <div className="form-upload-row">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImagePick}
                />
                <button
                  type="button"
                  className="btn btn-upload"
                  onClick={() => fileInputRef.current.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading…' : form.imageUrl ? 'Replace photo' : 'Choose photo'}
                </button>
                {form.imageUrl && (
                  <button
                    type="button"
                    className="btn btn-upload-remove"
                    onClick={() => setForm((f) => ({ ...f, imageUrl: null }))}
                  >
                    Remove
                  </button>
                )}
                {form.imageUrl && (
                  <span className="upload-filename">{form.imageUrl.split('/').pop()}</span>
                )}
              </div>
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
              <input type="number" step="any" min="0" value={form.distance ?? ''} onChange={set('distance')} placeholder="0.0" />
            </Field>
            <Field label="Time (hours)">
              <input type="number" step="any" min="0" value={form.time ?? ''} onChange={set('time')} placeholder="0.0" />
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
            <button type="button" className="btn btn-form-cancel" onClick={handleBack}>
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
