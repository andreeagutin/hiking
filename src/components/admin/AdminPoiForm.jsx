import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchPoi, createPoi, updatePoi, deletePoi } from '../../api/poi.js';
import { fetchHikes, updateHike } from '../../api/hikes.js';
import { fetchMountains } from '../../api/mountains.js';
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

function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => { if (target) map.flyTo(target, 14); }, [target, map]);
  return null;
}

function PoiMap({ lat, lng, onChange }) {
  const center = lat && lng ? [lat, lng] : [45.9432, 24.9668];
  const [query, setQuery] = useState('');
  const [flyTarget, setFlyTarget] = useState(null);
  const [searching, setSearching] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
      const data = await res.json();
      if (data.length > 0) setFlyTarget([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div>
      <div className="map-search-form">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
          placeholder="Cauta localitate, munte..."
          className="map-search-input"
        />
        <button type="button" className="map-search-btn" disabled={searching} onClick={handleSearch}>
          {searching ? '...' : 'Cauta'}
        </button>
      </div>
      <MapContainer center={center} zoom={lat && lng ? 13 : 7} style={{ height: 320, borderRadius: 10 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickHandler onClick={onChange} />
        {lat && lng && <Marker position={[lat, lng]} />}
        {flyTarget && <FlyTo target={flyTarget} />}
      </MapContainer>
    </div>
  );
}

function TagMultiSelect({ options, value, onChange, getLabel, getId, placeholder = 'Selectează…' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function toggle(id) {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  }

  return (
    <div className="tag-ms" ref={ref}>
      <div className="tag-ms-control" onClick={() => setOpen((o) => !o)}>
        <div className="tag-ms-tags">
          {value.length === 0 && <span className="tag-ms-placeholder">{placeholder}</span>}
          {value.map((id) => {
            const opt = options.find((o) => getId(o) === id);
            if (!opt) return null;
            return (
              <span key={id} className="tag-ms-tag">
                {getLabel(opt)}
                <button type="button" className="tag-ms-remove" onClick={(e) => { e.stopPropagation(); toggle(id); }}>×</button>
              </span>
            );
          })}
        </div>
        <span className="tag-ms-arrow">{open ? '▴' : '▾'}</span>
      </div>
      {open && (
        <div className="tag-ms-dropdown">
          {options.length === 0 && <div className="tag-ms-empty">Nicio opțiune</div>}
          {options.map((opt) => {
            const id = getId(opt);
            const selected = value.includes(id);
            return (
              <div
                key={id}
                className={`tag-ms-option${selected ? ' tag-ms-option-selected' : ''}`}
                onClick={() => toggle(id)}
              >
                {selected && <span className="tag-ms-check">✓ </span>}
                {getLabel(opt)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const POI_TYPES = ['restaurant', 'cave', 'waterfall', 'viewpoint', 'lake', 'peak', 'summit', 'spring', 'gorge'];

const EMPTY = {
  name: '',
  poiType: null,
  photos: [],
  mainPhoto: null,
  mountains: null,
  zone: null,
  address: null,
  link: null,
  notes: null,
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

export default function AdminPoiForm({ id }) {
  const isNew = !id;
  const [form, setForm]           = useState(EMPTY);
  const [original, setOriginal]   = useState(EMPTY);
  const [loading, setLoading]     = useState(!isNew);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');
  const [allHikes, setAllHikes]       = useState([]);
  const [allMountains, setAllMountains] = useState([]);
  const [linkedHikeIds, setLinkedHikeIds]         = useState([]);
  const [originalLinkedHikeIds, setOriginalLinkedHikeIds] = useState([]);
  const fileInputRef = useRef(null);

  const isDirty =
    JSON.stringify(form) !== JSON.stringify(original) ||
    JSON.stringify([...linkedHikeIds].sort()) !== JSON.stringify([...originalLinkedHikeIds].sort());

  useEffect(() => {
    fetchHikes({ all: true }).then(setAllHikes).catch(() => {});
    fetchMountains().then(setAllMountains).catch(() => {});
  }, []);

  // Initialize linked hike IDs once allHikes is loaded (for existing POI)
  useEffect(() => {
    if (!isNew && id && allHikes.length > 0) {
      const ids = allHikes
        .filter((h) => (h.pois || []).some((x) => (x._id || x) === id))
        .map((h) => h._id);
      setLinkedHikeIds(ids);
      setOriginalLinkedHikeIds(ids);
    }
  }, [allHikes, id, isNew]);

  useEffect(() => {
    if (!isNew) {
      fetchPoi(id)
        .then((p) => { setForm(p); setOriginal(p); setLoading(false); })
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
    if (!form.name) { setError('Numele este obligatoriu'); return; }
    setSaving(true); setError('');
    try {
      let poiId = id;
      if (isNew) {
        const created = await createPoi(form);
        poiId = created._id;
      } else {
        await updatePoi(id, form);
      }

      // Sync hike-poi relationships
      const added   = linkedHikeIds.filter((hid) => !originalLinkedHikeIds.includes(hid));
      const removed = originalLinkedHikeIds.filter((hid) => !linkedHikeIds.includes(hid));

      await Promise.all([
        ...added.map((hikeId) => {
          const hike = allHikes.find((h) => h._id === hikeId);
          const currentPois = (hike?.pois || []).map((p) => p._id || p);
          if (currentPois.includes(poiId)) return Promise.resolve();
          return updateHike(hikeId, { pois: [...currentPois, poiId] });
        }),
        ...removed.map((hikeId) => {
          const hike = allHikes.find((h) => h._id === hikeId);
          const currentPois = (hike?.pois || []).map((p) => p._id || p).filter((p) => p !== poiId);
          return updateHike(hikeId, { pois: currentPois });
        }),
      ]);

      window.location.href = '/admin/poi';
    } catch (err) { setError(err.message); setSaving(false); }
  }

  async function handleDelete() {
    if (!confirm(`Ștergi "${form.name}"?`)) return;
    try {
      await deletePoi(id);
      window.location.href = '/admin/poi';
    } catch (err) { setError(err.message); }
  }

  function handleBack() {
    if (isDirty && !confirm('Ai modificări nesalvate. Ești sigur că vrei să pleci?')) return;
    window.location.href = '/admin/poi';
  }

  function handleLogout() { clearToken(); window.location.href = '/admin'; }

  if (loading) return <div className="detail-loading">Se încarcă…</div>;

  return (
    <div className="admin-wrap">
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="admin-back-btn" onClick={handleBack}>← Înapoi</button>
          <div>
            <div className="admin-header-title">{isNew ? 'Punct nou' : 'Editează punct'}</div>
            {!isNew && form.name && <div className="admin-header-sub">{form.name}</div>}
          </div>
        </div>
        <button className="admin-logout" onClick={handleLogout}>Sign out</button>
      </header>

      <div className="admin-form-content">
        {error && <div className="error-banner">⚠ {error}</div>}
        <AdminNavTabs active="poi" />

        <form className="admin-form-card" onSubmit={handleSave}>

          <div className="form-section-title">Detalii</div>
          <div className="form-grid">
            <Field label="Nume *" full>
              <input type="text" value={form.name ?? ''} onChange={set('name')} placeholder="Numele punctului de interes" required />
            </Field>
            <Field label="Tip">
              <select value={form.poiType ?? ''} onChange={set('poiType')}>
                <option value="">—</option>
                {POI_TYPES.map((tp) => <option key={tp} value={tp}>{tp}</option>)}
              </select>
            </Field>
            <Field label="Munți">
              <input type="text" list="poi-mountains-list" value={form.mountains ?? ''} onChange={set('mountains')} placeholder="ex. Munții Apuseni" />
              <datalist id="poi-mountains-list">
                {allMountains.map(m => <option key={m} value={m} />)}
              </datalist>
            </Field>
            <Field label="Zonă">
              <input type="text" value={form.zone ?? ''} onChange={set('zone')} placeholder="ex. Aleșd" />
            </Field>
            <Field label="Adresă" full>
              <input type="text" value={form.address ?? ''} onChange={set('address')} placeholder="Adresă sau indicații" />
            </Field>
            <Field label="Link" full>
              <input type="url" value={form.link ?? ''} onChange={set('link')} placeholder="https://..." />
            </Field>
            <Field label="Notițe" full>
              <input type="text" value={form.notes ?? ''} onChange={set('notes')} placeholder="Informații suplimentare" />
            </Field>
            {form.poiType === 'cave' && (
              <>
                <Field label="Tip rocă">
                  <input type="text" value={form.rockType ?? ''} onChange={set('rockType')} placeholder="ex. Calcar" />
                </Field>
                <Field label="Dezvoltare (m)">
                  <input type="number" step="any" min="0" value={form.development ?? ''} onChange={setNum('development')} placeholder="0" />
                </Field>
                <Field label="Denivelarea (m)">
                  <input type="number" step="any" min="0" value={form.verticalExtent ?? ''} onChange={setNum('verticalExtent')} placeholder="0" />
                </Field>
                <Field label="Altitudine (m)">
                  <input type="number" step="any" min="0" value={form.altitude ?? ''} onChange={setNum('altitude')} placeholder="0" />
                </Field>
              </>
            )}
          </div>

          <div className="form-section-title">Poze</div>
          <div className="cave-photos-section">
            {(form.photos || []).length > 0 && (
              <div className="cave-photo-grid">
                {(form.photos || []).map((url) => (
                  <div
                    key={url}
                    className={`cave-photo-thumb${form.mainPhoto === url ? ' cave-photo-main' : ''}`}
                    onClick={() => handleSetMain(url)}
                    title="Apasă pentru a seta ca poză principală"
                  >
                    <img src={url} alt="" />
                    {form.mainPhoto === url && <div className="cave-photo-main-badge">✓ Main</div>}
                    <button
                      type="button"
                      className="cave-photo-remove"
                      onClick={(e) => { e.stopPropagation(); handleRemovePhoto(url); }}
                      title="Elimină poza"
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
                {uploading ? 'Se încarcă…' : '+ Adaugă poză'}
              </button>
              {(form.photos || []).length > 0 && (
                <span className="upload-filename">{(form.photos || []).length} poze · apasă o poză pentru a o seta ca principală</span>
              )}
            </div>
          </div>

          <div className="form-section-title">Locație</div>
          <div className="start-map-wrap">
            <p className="start-map-hint">Apasă pe hartă pentru a seta locația.</p>
            <PoiMap
              lat={form.lat}
              lng={form.lng}
              onChange={(lat, lng) => setForm((f) => ({ ...f, lat, lng }))}
            />
            {form.lat && form.lng && (
              <div className="start-map-coords">
                <span>📍 {form.lat.toFixed(5)}, {form.lng.toFixed(5)}</span>
                <button type="button" className="start-map-clear" onClick={() => setForm((f) => ({ ...f, lat: null, lng: null }))}>Șterge punct</button>
              </div>
            )}
          </div>

          <div className="form-section-title">Trasee care includ acest punct</div>
          <div className="form-grid">
            <Field label="Trasee" full>
              <TagMultiSelect
                options={allHikes}
                value={linkedHikeIds}
                onChange={setLinkedHikeIds}
                getId={(h) => h._id}
                getLabel={(h) => h.name + (h.mountains ? ` · ${h.mountains}` : '')}
                placeholder="Selectează trasee..."
              />
            </Field>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-form-save" disabled={saving}>{saving ? 'Se salvează…' : 'Salvează'}</button>
            <button type="button" className="btn btn-form-cancel" onClick={handleBack}>Anulează</button>
            {!isNew && (
              <button type="button" className="btn btn-form-delete" onClick={handleDelete}>Șterge</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
