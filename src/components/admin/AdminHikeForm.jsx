import { useState, useEffect, useRef, useCallback } from 'react';
import { marked } from 'marked';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchHikes, fetchHike, createHike, updateHike, deleteHike, addHistory, updateHistory, deleteHistory } from '../../api/hikes.js';
import { fetchPois } from '../../api/poi.js';
import { fetchMountains } from '../../api/mountains.js';
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
  const [query, setQuery]       = useState('');
  const [flyTarget, setFlyTarget] = useState(null);
  const [searching, setSearching] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
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
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
          placeholder="Cauta localitate, munte..."
          className="map-search-input"
        />
        <button type="button" className="map-search-btn" disabled={searching} onClick={handleSearch}>
          {searching ? '...' : 'Cauta'}
        </button>
      </div>
      <MapContainer center={center} zoom={zoom} style={{ height: 320, borderRadius: 12, zIndex: 0 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
        <MapClickHandler onChange={onChange} />
        <FlyTo lat={flyTarget?.[0] ?? lat} lng={flyTarget?.[1] ?? lng} />
        {lat && lng && <Marker position={[lat, lng]} />}
      </MapContainer>
    </div>
  );
}

const ALL_MARKERS = [
  'red_stripe', 'red_circle', 'red_cross', 'red_ring', 'red_triangle',
  'yellow_stripe', 'yellow_circle', 'yellow_cross', 'yellow_ring', 'yellow_triangle',
  'blue_stripe', 'blue_circle', 'blue_cross', 'blue_ring', 'blue_triangle',
];

function MarkerPicker({ value, onChange }) {
  function toggle(id) {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  }
  function moveUp(i) {
    if (i === 0) return;
    const next = [...value];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    onChange(next);
  }
  function moveDown(i) {
    if (i === value.length - 1) return;
    const next = [...value];
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    onChange(next);
  }
  return (
    <div className="marker-picker">
      <div className="marker-picker-grid">
        {ALL_MARKERS.map((id) => (
          <button
            key={id}
            type="button"
            className={`marker-picker-btn${value.includes(id) ? ' selected' : ''}`}
            onClick={() => toggle(id)}
            title={id.replace('_', ' ')}
          >
            <img src={`/hiking_markers/${id}.svg`} alt={id} />
            {value.includes(id) && (
              <span className="marker-picker-num">{value.indexOf(id) + 1}</span>
            )}
          </button>
        ))}
      </div>
      {value.length > 0 && (
        <div className="marker-picker-selected">
          {value.map((id, i) => (
            <div key={id} className="marker-picker-row">
              <span className="marker-picker-order">{i + 1}</span>
              <img src={`/hiking_markers/${id}.svg`} alt={id} className="marker-picker-row-img" />
              <span className="marker-picker-label">{id.replace('_', ' ')}</span>
              <div className="marker-picker-actions">
                <button type="button" onClick={() => moveUp(i)} disabled={i === 0}>↑</button>
                <button type="button" onClick={() => moveDown(i)} disabled={i === value.length - 1}>↓</button>
                <button type="button" className="marker-picker-remove" onClick={() => toggle(id)}>×</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TagMultiSelect({ options, value, onChange, getLabel, getId, placeholder = 'Select…' }) {
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
        {value.length > 0 && (
          <button type="button" className="tag-ms-clear" onClick={(e) => { e.stopPropagation(); onChange([]); }}>×</button>
        )}
      </div>
      {open && (
        <div className="tag-ms-dropdown">
          {options.map((opt) => {
            const id = getId(opt);
            return (
              <div key={id} className={`tag-ms-option${value.includes(id) ? ' selected' : ''}`}
                onMouseDown={(e) => { e.preventDefault(); toggle(id); }}>
                {getLabel(opt)}
              </div>
            );
          })}
          {options.length === 0 && <div className="tag-ms-empty">No options</div>}
        </div>
      )}
    </div>
  );
}

const EMPTY = {
  name: '', time: null, distance: null, tip: null,
  up: null, difficulty: null, mountains: null,
  zone: null, imageUrl: null,
  photos: [], mainPhoto: null, description: null,
  startLat: null, startLng: null, mapUrl: null, pois: [],
  familyFriendly: false, minAgeRecommended: null, strollerAccessible: false, toddlerFriendly: false,
  kidEngagementScore: null, highlights: [],
  hasRestAreas: false, restAreaCount: null, hasBathrooms: false, bathroomType: null,
  hasPicknicArea: false, nearbyPlayground: false,
  bearRisk: null, sheepdogWarning: false, safeWaterSource: false, mobileSignal: null,
  trailMarkColor: null, trailMarkShape: null, trailMarkers: [], salvamontPoint: null,
  keywords: [],
};

const NUMERIC_FIELDS = ['time', 'distance', 'up', 'minAgeRecommended', 'restAreaCount', 'kidEngagementScore'];
const FAMILY_SAFETY_BOOL_FIELDS = [
  'familyFriendly',
  'strollerAccessible',
  'toddlerFriendly',
  'hasRestAreas',
  'hasBathrooms',
  'hasPicknicArea',
  'nearbyPlayground',
  'sheepdogWarning',
  'safeWaterSource',
];

function normalizeHikeForm(data = {}) {
  const photos = Array.isArray(data.photos) && data.photos.length > 0
    ? data.photos
    : (data.imageUrl ? [data.imageUrl] : []);
  const mainPhoto = data.mainPhoto || photos[0] || null;
  return {
    ...EMPTY,
    ...data,
    photos,
    mainPhoto,
    pois: Array.isArray(data.pois) ? data.pois : [],
    highlights: Array.isArray(data.highlights) ? data.highlights.filter(Boolean) : [],
    keywords: Array.isArray(data.keywords) ? data.keywords.filter(Boolean) : [],
    trailMarkers: Array.isArray(data.trailMarkers) ? data.trailMarkers.filter(Boolean) : [],
    history: Array.isArray(data.history) ? data.history : [],
  };
}

function hasFamilySafetyData(form) {
  return FAMILY_SAFETY_BOOL_FIELDS.some((key) => !!form[key])
    || form.minAgeRecommended != null
    || form.kidEngagementScore != null
    || (form.highlights || []).length > 0
    || form.restAreaCount != null
    || form.bathroomType != null
    || form.bearRisk != null
    || form.mobileSignal != null
    || form.trailMarkColor != null
    || form.trailMarkShape != null
    || (form.trailMarkers || []).length > 0
    || !!form.salvamontPoint;
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
  const [allPois, setAllPois] = useState([]);
  const [allMountains, setAllMountains] = useState([]);
  const fileInputRef = useRef(null);

  const EMPTY_HISTORY = { time: '', is_hike: true, distance: '', up: '', down: '', updatedAt: new Date().toISOString().slice(0, 10) };

  const isDirty = JSON.stringify(form) !== JSON.stringify(original);

  useEffect(() => {
    fetchHikes().then(setAllHikes).catch(() => {});
    fetchPois().then(setAllPois).catch(() => {});
    fetchMountains().then(setAllMountains).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isNew) {
      fetchHike(id)
        .then((h) => {
          const normalized = normalizeHikeForm(h);
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
    if (isDirty && !confirm('You have unsaved changes. Are you sure you want to leave?')) return;
    window.location.href = `/admin/hike/${hike._id}/edit`;
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
        imageUrl: f.imageUrl || url,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleSetMain(url) {
    setForm((f) => ({ ...f, mainPhoto: url, imageUrl: url }));
  }

  function handleRemovePhoto(url) {
    setForm((f) => {
      const photos = (f.photos || []).filter((p) => p !== url);
      const mainPhoto = f.mainPhoto === url ? (photos[0] || null) : f.mainPhoto;
      return { ...f, photos, mainPhoto, imageUrl: mainPhoto };
    });
  }

  function set(key) {
    return (e) => {
      const raw = e.target.value;
      setForm((f) => ({
        ...f,
        [key]: NUMERIC_FIELDS.includes(key)
          ? (raw === '' ? null : parseFloat(raw))
          : (raw === '' ? null : raw),
      }));
    };
  }

  function setCheckbox(key) {
    return (e) => {
      setForm((f) => ({ ...f, [key]: e.target.checked }));
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
    if (isDirty && !confirm('You have unsaved changes. Are you sure you want to leave?')) return;
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

          <Field label="Name *" full>
            <input type="text" value={form.name ?? ''} onChange={set('name')} placeholder="Trail name" required className="admin-name-input" />
          </Field>

          <div className="form-section-title">Trail markers</div>
          <MarkerPicker
            value={form.trailMarkers || []}
            onChange={(v) => setForm((f) => ({ ...f, trailMarkers: v }))}
          />

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
                    >✕</button>
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

          <div className="form-section-title">Description</div>
          <DescriptionEditor
            value={form.description ?? ''}
            onChange={(v) => setForm((f) => ({ ...f, description: v }))}
          />

          <div className="form-section-title">Basic info</div>
          <div className="form-grid">
            <Field label="Mountains">
              <input type="text" list="mountains-list" value={form.mountains ?? ''} onChange={set('mountains')} placeholder="e.g. Munții Bucegi" />
              <datalist id="mountains-list">
                {[...new Set([
                  ...allMountains,
                  ...allHikes.map(h => h.mountains).filter(Boolean),
                ])].sort().map(m => <option key={m} value={m} />)}
              </datalist>
            </Field>
            <Field label="Zone">
              <input type="text" list="zones-list" value={form.zone ?? ''} onChange={set('zone')} placeholder="e.g. Prahova" />
              <datalist id="zones-list">
                {[...new Set(allHikes.map(h => h.zone).filter(Boolean))].sort().map(z => <option key={z} value={z} />)}
              </datalist>
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
            <Field label="Elevation (m)">
              <input type="number" min="0" value={form.up ?? ''} onChange={set('up')} placeholder="0" />
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
          </div>

          <details className="form-collapsible" open={hasFamilySafetyData(form)}>
            <summary className="form-collapsible-summary">Family &amp; Safety</summary>
            <div className="form-collapsible-body">
              <div className="form-grid">
                <Field label="Family suitability" full>
                  <div className="form-checkbox-grid">
                    <label className="form-checkbox-item">
                      <input type="checkbox" checked={!!form.familyFriendly} onChange={setCheckbox('familyFriendly')} />
                      <span>Family-friendly</span>
                    </label>
                    <label className="form-checkbox-item">
                      <input type="checkbox" checked={!!form.strollerAccessible} onChange={setCheckbox('strollerAccessible')} />
                      <span>Stroller accessible</span>
                    </label>
                    <label className="form-checkbox-item">
                      <input type="checkbox" checked={!!form.toddlerFriendly} onChange={setCheckbox('toddlerFriendly')} />
                      <span>Toddler-friendly</span>
                    </label>
                  </div>
                </Field>

                <Field label="Minimum age recommended">
                  <input type="number" min="0" value={form.minAgeRecommended ?? ''} onChange={set('minAgeRecommended')} placeholder="e.g. 5" />
                </Field>
                <Field label="Kid engagement score (1-5)">
                  <input type="number" min="1" max="5" step="1" value={form.kidEngagementScore ?? ''} onChange={set('kidEngagementScore')} placeholder="1-5" />
                </Field>

                <Field label="Amenities" full>
                  <div className="form-checkbox-grid">
                    <label className="form-checkbox-item">
                      <input type="checkbox" checked={!!form.hasRestAreas} onChange={setCheckbox('hasRestAreas')} />
                      <span>Rest areas on trail</span>
                    </label>
                    <label className="form-checkbox-item">
                      <input type="checkbox" checked={!!form.hasBathrooms} onChange={setCheckbox('hasBathrooms')} />
                      <span>Bathrooms nearby</span>
                    </label>
                    <label className="form-checkbox-item">
                      <input type="checkbox" checked={!!form.hasPicknicArea} onChange={setCheckbox('hasPicknicArea')} />
                      <span>Picnic area</span>
                    </label>
                    <label className="form-checkbox-item">
                      <input type="checkbox" checked={!!form.nearbyPlayground} onChange={setCheckbox('nearbyPlayground')} />
                      <span>Playground near trailhead</span>
                    </label>
                    <label className="form-checkbox-item">
                      <input type="checkbox" checked={!!form.safeWaterSource} onChange={setCheckbox('safeWaterSource')} />
                      <span>Safe water source</span>
                    </label>
                  </div>
                </Field>

                <Field label="Rest area count">
                  <input type="number" min="0" value={form.restAreaCount ?? ''} onChange={set('restAreaCount')} placeholder="Approximate count" />
                </Field>
                <Field label="Bathroom type">
                  <select value={form.bathroomType ?? ''} onChange={set('bathroomType')}>
                    <option value="">—</option>
                    <option value="flush">flush</option>
                    <option value="pit">pit</option>
                    <option value="none">none</option>
                  </select>
                </Field>

                <Field label="Safety flags" full>
                  <div className="form-checkbox-grid">
                    <label className="form-checkbox-item">
                      <input type="checkbox" checked={!!form.sheepdogWarning} onChange={setCheckbox('sheepdogWarning')} />
                      <span>Seasonal sheepdog warning</span>
                    </label>
                  </div>
                </Field>

                <Field label="Bear risk">
                  <select value={form.bearRisk ?? ''} onChange={set('bearRisk')}>
                    <option value="">—</option>
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                  </select>
                </Field>
                <Field label="Mobile signal">
                  <select value={form.mobileSignal ?? ''} onChange={set('mobileSignal')}>
                    <option value="">—</option>
                    <option value="good">good</option>
                    <option value="partial">partial</option>
                    <option value="none">none</option>
                  </select>
                </Field>
                <Field label="Salvamont point" full>
                  <input type="text" value={form.salvamontPoint ?? ''} onChange={set('salvamontPoint')} placeholder="Nearest Salvamont post or phone" />
                </Field>
                <Field label="Highlights" full>
                  <input
                    type="text"
                    value={(form.highlights || []).join(', ')}
                    onChange={(e) => {
                      const highlights = e.target.value
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean);
                      setForm((f) => ({ ...f, highlights }));
                    }}
                    placeholder="waterfall, stream crossing, rock scramble, marmots"
                  />
                  <div className="form-input-hint">Comma-separated tags shown to families.</div>
                </Field>
              </div>
            </div>
          </details>

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

          <div className="form-section-title">SEO Keywords</div>
          <Field label="Keywords" full>
            <input
              type="text"
              value={(form.keywords || []).join(', ')}
              onChange={(e) => {
                const keywords = e.target.value
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean);
                setForm((f) => ({ ...f, keywords }));
              }}
              placeholder="e.g. hiking Romania, Bucegi, waterfall, family trail"
            />
            <div className="form-input-hint">Comma-separated keywords used in search engines. Add trail name, mountain, POI types, and activities.</div>
          </Field>

          <div className="form-section-title">Trail map (Mapy.cz)</div>
          <Field label="Paste iframe code from Mapy.cz">
            <textarea
              rows={3}
              placeholder={'<iframe style="border:none" src="https://mapy.com/s/..." width="500" height="333" frameborder="0"></iframe>'}
              value={form.mapUrl ?? ''}
              onChange={(e) => {
                const val = e.target.value.trim();
                if (!val) { setForm((f) => ({ ...f, mapUrl: null })); return; }
                const match = val.match(/src="([^"]+)"/);
                setForm((f) => ({ ...f, mapUrl: match ? match[1] : val }));
              }}
            />
            {form.mapUrl && <div className="map-url-preview">✓ {form.mapUrl}</div>}
          </Field>

          {!isNew && (
            <>
              <div className="form-section-title">Puncte de interes</div>
              {allPois.length === 0 ? (
                <p className="restaurant-link-empty">Niciun punct de interes încă. <a href="/admin/poi">Adaugă →</a></p>
              ) : (
                <TagMultiSelect
                  options={allPois}
                  value={(form.pois || []).map((x) => x._id || x)}
                  onChange={(ids) => setForm((f) => ({ ...f, pois: ids }))}
                  getId={(p) => p._id}
                  getLabel={(p) => `${p.name}${p.poiType ? ` · ${p.poiType}` : ''}${p.mountains ? ` · ${p.mountains}` : ''}`}
                  placeholder="Selectează puncte de interes…"
                />
              )}

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
                      <label>Date<input type="date" value={historyForm.updatedAt || ''} onChange={(e) => setHistoryForm((f) => ({ ...f, updatedAt: e.target.value }))} /></label>
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
