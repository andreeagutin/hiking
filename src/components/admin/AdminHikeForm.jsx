import { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchHikes, fetchHike, createHike, updateHike, deleteHike, addHistory, updateHistory, deleteHistory } from '../../api/hikes.js';
import { fetchRestaurants } from '../../api/restaurants.js';
import { clearToken } from '../../api/auth.js';
import { uploadImage } from '../../api/upload.js';

// Fix Leaflet default marker icons with Vite bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

function MapClickHandler({ onChange }) {
  useMapEvents({ click(e) { onChange(e.latlng.lat, e.latlng.lng); } });
  return null;
}

function FlyTo({ lat, lng }) {
  const map = useMap();
  useEffect(() => { if (lat && lng) map.flyTo([lat, lng], 13, { duration: 1 }); }, [lat, lng, map]);
  return null;
}

function StartMap({ lat, lng, onChange }) {
  const center = lat && lng ? [lat, lng] : [45.5, 25.0];
  const zoom   = lat && lng ? 13 : 7;
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: 320, borderRadius: 12, zIndex: 0 }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
      <MapClickHandler onChange={onChange} />
      <FlyTo lat={lat} lng={lng} />
      {lat && lng && <Marker position={[lat, lng]} />}
    </MapContainer>
  );
}

const EMPTY = {
  name: '', time: null, distance: null, tip: null,
  up: null, down: null, difficulty: null, mountains: null,
  status: 'Not started', completed: null, zone: null, imageUrl: null, description: null,
  startLat: null, startLng: null,
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

const TOOLBAR_COLORS = [
  { label: 'Default',  hex: null },
  { label: 'Purple',   hex: '#7c3aed' },
  { label: 'Blue',     hex: '#2563eb' },
  { label: 'Teal',     hex: '#0d9488' },
  { label: 'Green',    hex: '#16a34a' },
  { label: 'Orange',   hex: '#ea580c' },
  { label: 'Red',      hex: '#dc2626' },
  { label: 'Rose',     hex: '#e11d48' },
  { label: 'Gold',     hex: '#b45309' },
  { label: 'Gray',     hex: '#6b7280' },
];

function TbIcon({ d, size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function DescriptionEditor({ value, onChange }) {
  const ref = useRef(null);
  const [preview, setPreview] = useState(false);
  const words = value ? value.trim().split(/\s+/).filter(Boolean).length : 0;

  function wrap(before, after) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end   = el.selectionEnd;
    const sel   = value.slice(start, end) || 'text';
    const next  = value.slice(0, start) + before + sel + after + value.slice(end);
    onChange(next);
    setTimeout(() => {
      el.focus();
      el.selectionStart = start + before.length;
      el.selectionEnd   = start + before.length + sel.length;
    }, 0);
  }

  function insertPrefix(prefix) {
    const el    = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const ls    = value.lastIndexOf('\n', start - 1) + 1;
    const next  = value.slice(0, ls) + prefix + value.slice(ls);
    onChange(next);
    setTimeout(() => { el.focus(); el.selectionStart = el.selectionEnd = start + prefix.length; }, 0);
  }

  function insertLink() {
    const el  = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end   = el.selectionEnd;
    const sel   = value.slice(start, end) || 'link text';
    const next  = value.slice(0, start) + `[${sel}](url)` + value.slice(end);
    onChange(next);
    setTimeout(() => { el.focus(); el.selectionStart = el.selectionEnd = start + sel.length + 3; }, 0);
  }

  function insertHr() {
    const el    = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const next  = value.slice(0, start) + '\n\n---\n\n' + value.slice(start);
    onChange(next);
    setTimeout(() => { el.focus(); el.selectionStart = el.selectionEnd = start + 7; }, 0);
  }

  return (
    <div className="desc-editor">
      {/* Row 1: text formatting */}
      <div className="desc-toolbar">
        <span className="desc-tb-group">
          <button type="button" className="desc-tb-btn" title="Bold (select text first)"      onClick={() => wrap('**', '**')}><b>B</b></button>
          <button type="button" className="desc-tb-btn desc-tb-italic" title="Italic"          onClick={() => wrap('*', '*')}><i>I</i></button>
          <button type="button" className="desc-tb-btn desc-tb-strike" title="Strikethrough"   onClick={() => wrap('~~', '~~')}><s>S</s></button>
          <button type="button" className="desc-tb-btn desc-tb-code"   title="Inline code"     onClick={() => wrap('`', '`')}>{'<>'}</button>
        </span>
        <span className="desc-tb-sep" />
        <span className="desc-tb-group">
          <button type="button" className="desc-tb-btn" title="Heading 1" onClick={() => insertPrefix('# ')}>H1</button>
          <button type="button" className="desc-tb-btn" title="Heading 2" onClick={() => insertPrefix('## ')}>H2</button>
          <button type="button" className="desc-tb-btn" title="Heading 3" onClick={() => insertPrefix('### ')}>H3</button>
        </span>
        <span className="desc-tb-sep" />
        <span className="desc-tb-group">
          <button type="button" className="desc-tb-btn" title="Bullet list"    onClick={() => insertPrefix('- ')}>
            <TbIcon d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
          </button>
          <button type="button" className="desc-tb-btn" title="Numbered list"  onClick={() => insertPrefix('1. ')}>
            <TbIcon d="M10 6h11M10 12h11M10 18h11M3.5 6l1-1v4M3.5 18h2m-2-2 2 2" />
          </button>
          <button type="button" className="desc-tb-btn" title="Blockquote"     onClick={() => insertPrefix('> ')}>
            <TbIcon d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
          </button>
          <button type="button" className="desc-tb-btn" title="Link"           onClick={insertLink}>
            <TbIcon d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </button>
          <button type="button" className="desc-tb-btn" title="Horizontal rule" onClick={insertHr}>—</button>
        </span>
        <span className="desc-tb-sep" />
        {/* Colors */}
        <span className="desc-tb-group desc-tb-colors">
          {TOOLBAR_COLORS.map((c) =>
            c.hex ? (
              <button key={c.hex} type="button" className="desc-color-btn" title={c.label}
                style={{ background: c.hex }} onClick={() => wrap(`<span style="color:${c.hex}">`, '</span>')} />
            ) : (
              <button key="default" type="button" className="desc-color-btn desc-color-default" title="Default color"
                onClick={() => { /* just insert selected text as-is */ ref.current?.focus(); }} >A</button>
            )
          )}
        </span>
        <span className="desc-tb-sep" />
        <button type="button" className={`desc-tb-btn desc-tb-preview${preview ? ' active' : ''}`}
          onClick={() => setPreview((p) => !p)}>
          {preview ? '✏ Edit' : '👁 Preview'}
        </button>
      </div>

      {preview ? (
        <div className="desc-preview" dangerouslySetInnerHTML={{ __html: marked.parse(value || '') }} />
      ) : (
        <textarea
          ref={ref}
          className="form-textarea desc-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={'Write your trail description here…\n\n**bold**, *italic*, ~~strikethrough~~, `code`\n## Heading, - bullet list, 1. numbered list, > quote'}
          rows={10}
        />
      )}

      <div className="desc-footer">
        <span className="desc-word-count">{words} word{words !== 1 ? 's' : ''}</span>
        <span className="desc-hint">Markdown supported · <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noopener noreferrer">Cheat sheet</a></span>
      </div>
    </div>
  );
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
          <DescriptionEditor
            value={form.description ?? ''}
            onChange={(v) => setForm((f) => ({ ...f, description: v }))}
          />

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

          <div className="form-section-title">Starting point</div>
          <div className="start-map-wrap">
            <p className="start-map-hint">Click on the map to set the trail starting point.</p>
            <StartMap
              lat={form.startLat}
              lng={form.startLng}
              onChange={(lat, lng) => setForm((f) => ({ ...f, startLat: lat, startLng: lng }))}
            />
            {form.startLat && form.startLng && (
              <div className="start-map-coords">
                <span>📍 {form.startLat.toFixed(5)}, {form.startLng.toFixed(5)}</span>
                <button type="button" className="start-map-clear" onClick={() => setForm((f) => ({ ...f, startLat: null, startLng: null }))}>Clear point</button>
              </div>
            )}
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
