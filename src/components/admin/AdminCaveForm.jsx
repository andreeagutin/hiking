import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchCave, createCave, updateCave, deleteCave } from '../../api/caves.js';
import { fetchHikes } from '../../api/hikes.js';
import { clearToken } from '../../api/auth.js';
import { uploadImage } from '../../api/upload.js';
import { AdminNavTabs } from './AdminRestaurants.jsx';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

function MapClickHandler({ onClick }) {
  useMapEvents({ click: (e) => onClick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => { if (lat && lng) map.setView([lat, lng], map.getZoom()); }, [lat, lng, map]);
  return null;
}

function CaveMap({ lat, lng, onChange }) {
  const center = lat && lng ? [lat, lng] : [45.9432, 24.9668];
  return (
    <MapContainer center={center} zoom={lat && lng ? 13 : 7} style={{ height: 280, borderRadius: 10 }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapClickHandler onClick={onChange} />
      {lat && lng && <Marker position={[lat, lng]} />}
      {lat && lng && <RecenterMap lat={lat} lng={lng} />}
    </MapContainer>
  );
}

const EMPTY = {
  name: '',
  photos: [],
  mainPhoto: null,
  mountains: null,
  development: null,
  verticalExtent: null,
  altitude: null,
  rockType: null,
  lat: null,
  lng: null,
};

function Field({ label, children, full }) {
  return (
    <div className={`form-field${full ? ' form-field-full' : ''}`}>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

export default function AdminCaveForm({ id }) {
  const isNew = !id;
  const [form, setForm]         = useState(EMPTY);
  const [original, setOriginal] = useState(EMPTY);
  const [loading, setLoading]   = useState(!isNew);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState('');
  const [allHikes, setAllHikes] = useState([]);
  const fileInputRef = useRef(null);

  const isDirty = JSON.stringify(form) !== JSON.stringify(original);

  useEffect(() => {
    fetchHikes({ all: true }).then(setAllHikes).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isNew) {
      fetchCave(id)
        .then((c) => { setForm(c); setOriginal(c); setLoading(false); })
        .catch((e) => { setError(e.message); setLoading(false); });
    }
  }, [id, isNew]);

  function set(key) {
    const NUM = ['development', 'verticalExtent', 'altitude'];
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

  function setNum(key) {
    return (e) => {
      const raw = e.target.value;
      setForm((f) => ({ ...f, [key]: raw === '' ? null : parseFloat(raw) }));
    };
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const { url } = await uploadImage(file);
      setForm((f) => ({
        ...f,
        photos: [...(f.photos || []), url],
        mainPhoto: f.mainPhoto || url,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      // reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleSetMain(url) {
    setForm((f) => ({ ...f, mainPhoto: url }));
  }

  function handleRemovePhoto(url) {
    setForm((f) => {
      const photos = (f.photos || []).filter((p) => p !== url);
      return {
        ...f,
        photos,
        mainPhoto: f.mainPhoto === url ? (photos[0] || null) : f.mainPhoto,
      };
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name) { setError('Name is required'); return; }
    setSaving(true); setError('');
    try {
      if (isNew) await createCave(form);
      else await updateCave(id, form);
      window.location.href = '/admin/caves';
    } catch (err) { setError(err.message); setSaving(false); }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${form.name}"?`)) return;
    try {
      await deleteCave(id);
      window.location.href = '/admin/caves';
    } catch (err) { setError(err.message); }
  }

  function handleBack() {
    if (isDirty && !confirm('You have unsaved changes. Are you sure you want to leave?')) return;
    window.location.href = '/admin/caves';
  }

  function handleLogout() { clearToken(); window.location.href = '/admin'; }

  // Hikes that include this cave
  const linkedHikes = isNew ? [] : allHikes.filter((h) =>
    (h.caves || []).some((x) => (x._id || x) === id)
  );

  if (loading) return <div className="detail-loading">Loading…</div>;

  return (
    <div className="admin-wrap">
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="admin-back-btn" onClick={handleBack}>← Back</button>
          <div>
            <div className="admin-header-title">{isNew ? 'New cave' : 'Edit cave'}</div>
            {!isNew && form.name && <div className="admin-header-sub">{form.name}</div>}
          </div>
        </div>
        <button className="admin-logout" onClick={handleLogout}>Sign out</button>
      </header>

      <div className="admin-form-content">
        {error && <div className="error-banner">⚠ {error}</div>}
        <AdminNavTabs active="caves" />

        <form className="admin-form-card" onSubmit={handleSave}>

          <div className="form-section-title">Details</div>
          <div className="form-grid">
            <Field label="Name *" full>
              <input type="text" value={form.name ?? ''} onChange={set('name')} placeholder="Cave name" required />
            </Field>
            <Field label="Mountains">
              <input type="text" value={form.mountains ?? ''} onChange={set('mountains')} placeholder="e.g. Apuseni" />
            </Field>
            <Field label="Rock type">
              <input type="text" value={form.rockType ?? ''} onChange={set('rockType')} placeholder="e.g. Calcar" />
            </Field>
            <Field label="Development (m)">
              <input type="number" step="any" min="0" value={form.development ?? ''} onChange={setNum('development')} placeholder="0" />
            </Field>
            <Field label="Vertical extent (m)">
              <input type="number" step="any" min="0" value={form.verticalExtent ?? ''} onChange={setNum('verticalExtent')} placeholder="0" />
            </Field>
            <Field label="Altitude (m)">
              <input type="number" step="any" min="0" value={form.altitude ?? ''} onChange={setNum('altitude')} placeholder="0" />
            </Field>
          </div>

          <div className="form-section-title">Photos</div>
          <div className="cave-photos-section">
            {(form.photos || []).length > 0 && (
              <div className="cave-photo-grid">
                {(form.photos || []).map((url) => (
                  <div
                    key={url}
                    className={`cave-photo-thumb${form.mainPhoto === url ? ' cave-photo-main' : ''}`}
                    onClick={() => handleSetMain(url)}
                    title="Click to set as main photo"
                  >
                    <img src={url} alt="" />
                    {form.mainPhoto === url && <div className="cave-photo-main-badge">✓ Main</div>}
                    <button
                      type="button"
                      className="cave-photo-remove"
                      onClick={(e) => { e.stopPropagation(); handleRemovePhoto(url); }}
                      title="Remove photo"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="form-upload-row" style={{ marginTop: (form.photos || []).length > 0 ? 12 : 0 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
              />
              <button
                type="button"
                className="btn btn-upload"
                onClick={() => fileInputRef.current.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading…' : '+ Add photo'}
              </button>
              {(form.photos || []).length > 0 && (
                <span className="upload-filename">{(form.photos || []).length} photo{(form.photos || []).length !== 1 ? 's' : ''} · click a photo to set as main</span>
              )}
            </div>
          </div>

          <div className="form-section-title">Location</div>
          <div className="start-map-wrap">
            <p className="start-map-hint">Click on the map to set the cave entrance location.</p>
            <CaveMap
              lat={form.lat}
              lng={form.lng}
              onChange={(lat, lng) => setForm((f) => ({ ...f, lat, lng }))}
            />
            {form.lat && form.lng && (
              <div className="start-map-coords">
                <span>📍 {form.lat.toFixed(5)}, {form.lng.toFixed(5)}</span>
                <button type="button" className="start-map-clear" onClick={() => setForm((f) => ({ ...f, lat: null, lng: null }))}>Clear point</button>
              </div>
            )}
          </div>

          {!isNew && (
            <>
              <div className="form-section-title">Hikes featuring this cave</div>
              <div className="restaurant-link-list">
                {linkedHikes.length === 0 ? (
                  <p className="restaurant-link-empty">No hikes linked to this cave yet.</p>
                ) : (
                  linkedHikes.map((h) => (
                    <a
                      key={h._id}
                      href={`/admin/hike/${h._id}/edit`}
                      className="cave-hike-link"
                    >
                      <span className="restaurant-link-name">{h.name}</span>
                      {h.mountains && <span className="restaurant-link-zone">{h.mountains}</span>}
                      <span className="cave-hike-link-arrow">→</span>
                    </a>
                  ))
                )}
              </div>
            </>
          )}

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-form-save" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            <button type="button" className="btn btn-form-cancel" onClick={handleBack}>Cancel</button>
            {!isNew && (
              <button type="button" className="btn btn-form-delete" onClick={handleDelete}>Delete</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
