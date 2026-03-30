import { useState, useEffect, useRef } from 'react';
import { fetchHikes, fetchHike, createHike, updateHike, deleteHike, addHistory, updateHistory, deleteHistory } from '../../api/hikes.js';
import { fetchRestaurants } from '../../api/restaurants.js';
import { clearToken } from '../../api/auth.js';
import { uploadImage } from '../../api/upload.js';

const EMPTY = {
  name: '', time: null, distance: null, tip: null,
  up: null, down: null, difficulty: null, mountains: null,
  status: 'Not started', completed: null, zone: null, imageUrl: null, description: null,
};

// YYYY-MM-DD → DD-MM-YYYY (display)
function toDisplay(val) {
  if (!val) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const [y, m, d] = val.split('-');
    return `${d}-${m}-${y}`;
  }
  return val;
}

// DD-MM-YYYY → YYYY-MM-DD (storage)
function fromDisplay(val) {
  if (!val) return '';
  if (/^\d{2}-\d{2}-\d{4}$/.test(val)) {
    const [d, m, y] = val.split('-');
    return `${y}-${m}-${d}`;
  }
  return val;
}

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
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');
  const [historyEdit, setHistoryEdit] = useState(null);
  const [historyForm, setHistoryForm] = useState({});
  const [allRestaurants, setAllRestaurants] = useState([]);
  const fileInputRef = useRef(null);

  const EMPTY_HISTORY = { time: '', is_hike: true, distance: '', up: '', down: '', updatedAt: new Date().toISOString().slice(0, 10) };

  const isDirty = JSON.stringify(form) !== JSON.stringify(original);

  useEffect(() => {
    fetchHikes().then(setAllHikes).catch(() => {});
    fetchRestaurants().then(setAllRestaurants).catch(() => {});
  }, []);

  function toInputDate(val) {
    if (!val) return '';
    // convert dd/mm/yyyy → yyyy-mm-dd
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
      const [d, m, y] = val.split('/');
      return `${y}-${m}-${d}`;
    }
    return val; // already ISO or empty
  }

  useEffect(() => {
    if (!isNew) {
      fetchHike(id)
        .then((h) => {
          const normalized = { ...h, completed: toInputDate(h.completed) };
          setForm(normalized);
          setOriginal(normalized);
          setLoading(false);
        })
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

  async function handleHistorySave() {
    const data = {
      ...historyForm,
      time:     historyForm.time     !== '' ? parseFloat(historyForm.time)     : null,
      distance: historyForm.distance !== '' ? parseFloat(historyForm.distance) : null,
      up:       historyForm.up       !== '' ? parseFloat(historyForm.up)       : null,
      down:     historyForm.down     !== '' ? parseFloat(historyForm.down)     : null,
      updatedAt: historyForm.updatedAt || new Date().toISOString().slice(0, 10),
    };
    try {
      if (historyEdit === 'new') {
        const entry = await addHistory(id, data);
        setForm((f) => ({ ...f, history: [...(f.history || []), entry] }));
        setOriginal((f) => ({ ...f, history: [...(f.history || []), entry] }));
      } else {
        const entry = await updateHistory(id, historyEdit, data);
        setForm((f) => ({ ...f, history: f.history.map((h) => h._id === historyEdit ? entry : h) }));
        setOriginal((f) => ({ ...f, history: f.history.map((h) => h._id === historyEdit ? entry : h) }));
      }
      setHistoryEdit(null);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleHistoryDelete(entryId) {
    if (!confirm('Delete this history entry?')) return;
    try {
      await deleteHistory(id, entryId);
      setForm((f) => ({ ...f, history: f.history.filter((h) => h._id !== entryId) }));
      setOriginal((f) => ({ ...f, history: f.history.filter((h) => h._id !== entryId) }));
    } catch (e) {
      setError(e.message);
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

          <div className="form-section-title">Description</div>
          <div className="form-grid">
            <Field label="Description" full>
              <textarea
                className="form-textarea"
                value={form.description ?? ''}
                onChange={set('description')}
                placeholder="Descriere traseu, puncte de interes, sfaturi…"
                rows={4}
              />
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
            <Field label="Completed">
              <input
                type="text"
                placeholder="DD-MM-YYYY"
                value={toDisplay(form.completed ?? '')}
                onChange={(e) => setForm((f) => ({ ...f, completed: fromDisplay(e.target.value) }))}
              />
            </Field>
          </div>

          {!isNew && (
            <>
              <div className="form-section-title">Restaurants</div>
              <div className="restaurant-link-list">
                {allRestaurants.length === 0 && (
                  <p className="restaurant-link-empty">No restaurants yet. <a href="/admin/restaurants">Add one →</a></p>
                )}
                {allRestaurants.map((r) => {
                  const linked = (form.restaurants || []).some((x) => (x._id || x) === r._id);
                  return (
                    <label key={r._id} className={`restaurant-link-item${linked ? ' linked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={linked}
                        onChange={() => {
                          setForm((f) => {
                            const ids = (f.restaurants || []).map((x) => x._id || x);
                            return {
                              ...f,
                              restaurants: linked
                                ? ids.filter((id) => id !== r._id)
                                : [...ids, r._id],
                            };
                          });
                        }}
                      />
                      <span className="restaurant-link-name">{r.name}</span>
                      {r.type && <span className="restaurant-link-type">{r.type}</span>}
                      {r.zone && <span className="restaurant-link-zone">{r.zone}</span>}
                    </label>
                  );
                })}
              </div>

              <div className="form-section-title">History</div>
              <div className="history-admin-wrap">
                {(form.history || []).length > 0 && (
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Hike?</th>
                        <th>Distance</th>
                        <th>Time</th>
                        <th>↑</th>
                        <th>↓</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(form.history || []).map((h) => (
                        <tr key={h._id}>
                          <td>{h.updatedAt ? (() => { const d = new Date(h.updatedAt); return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`; })() : '—'}</td>
                          <td>{h.is_hike ? '✓' : '—'}</td>
                          <td>{h.distance != null ? `${h.distance} km` : '—'}</td>
                          <td>{h.time != null ? `${h.time} h` : '—'}</td>
                          <td>{h.up != null ? `↑${h.up}m` : '—'}</td>
                          <td>{h.down != null ? `↓${h.down}m` : '—'}</td>
                          <td className="history-actions">
                            <button type="button" className="btn-edit" onClick={() => { setHistoryEdit(h._id); setHistoryForm({ ...h, updatedAt: h.updatedAt ? new Date(h.updatedAt).toISOString().slice(0,10) : '' }); }}>Edit</button>
                            <button type="button" className="btn-delete" onClick={() => handleHistoryDelete(h._id)}>✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {historyEdit && (
                  <div className="history-form">
                    <div className="history-form-grid">
                      <label>Date<input type="text" placeholder="DD-MM-YYYY" value={toDisplay(historyForm.updatedAt || '')} onChange={(e) => setHistoryForm((f) => ({ ...f, updatedAt: fromDisplay(e.target.value) }))} /></label>
                      <label>Hike?<select value={historyForm.is_hike ? 'true' : 'false'} onChange={(e) => setHistoryForm((f) => ({ ...f, is_hike: e.target.value === 'true' }))}><option value="true">Yes</option><option value="false">No</option></select></label>
                      <label>Distance (km)<input type="number" step="any" min="0" value={historyForm.distance ?? ''} onChange={(e) => setHistoryForm((f) => ({ ...f, distance: e.target.value }))} /></label>
                      <label>Time (h)<input type="number" step="any" min="0" value={historyForm.time ?? ''} onChange={(e) => setHistoryForm((f) => ({ ...f, time: e.target.value }))} /></label>
                      <label>Up (m)<input type="number" min="0" value={historyForm.up ?? ''} onChange={(e) => setHistoryForm((f) => ({ ...f, up: e.target.value }))} /></label>
                      <label>Down (m)<input type="number" min="0" value={historyForm.down ?? ''} onChange={(e) => setHistoryForm((f) => ({ ...f, down: e.target.value }))} /></label>
                    </div>
                    <div className="history-form-actions">
                      <button type="button" className="btn btn-form-save" style={{padding:'8px 20px', fontSize:'0.82rem'}} onClick={handleHistorySave}>Save entry</button>
                      <button type="button" className="btn btn-form-cancel" onClick={() => setHistoryEdit(null)}>Cancel</button>
                    </div>
                  </div>
                )}

                {!historyEdit && (
                  <button type="button" className="btn btn-add" style={{marginTop: 12}} onClick={() => { setHistoryEdit('new'); setHistoryForm({ ...EMPTY_HISTORY }); }}>
                    + Add entry
                  </button>
                )}
              </div>
            </>
          )}

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
