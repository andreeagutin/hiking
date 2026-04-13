import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import { Capacitor, registerPlugin } from '@capacitor/core';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { t } from '../i18n.js';
import useLang from '../hooks/useLang.js';
import { fetchHikes } from '../api/hikes.js';
import { saveTrack, fetchTracks, deleteTrack, gpxDownloadUrl } from '../api/trackedHikes.js';

// Fix Leaflet default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

// ── Haversine distance in meters ────────────────────────────────────────────
function haversineDistance(p1, p2) {
  const R = 6371000;
  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLng = (p2.lng - p1.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Elevation gain/loss from points array ────────────────────────────────────
function calcElevation(points) {
  let gain = 0, loss = 0;
  for (let i = 1; i < points.length; i++) {
    const diff = (points[i].ele ?? 0) - (points[i - 1].ele ?? 0);
    if (diff > 0) gain += diff;
    else loss += Math.abs(diff);
  }
  return { gain, loss };
}

// ── GPX generator (client-side, for web export) ─────────────────────────────
function generateGPX(points, hikeName = 'My Hike') {
  const now = new Date().toISOString();
  const dateLabel = new Date().toLocaleDateString();

  const header = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Hike'n'Seek"
     xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${hikeName} — ${dateLabel}</name>
    <desc>Recorded with Hike'n'Seek</desc>
    <time>${now}</time>
  </metadata>
  <trk>
    <name>${hikeName}</name>
    <trkseg>`;

  const trkpts = points.map(p => `
      <trkpt lat="${p.lat.toFixed(7)}" lon="${p.lng.toFixed(7)}">
        <ele>${(p.ele ?? 0).toFixed(1)}</ele>
        <time>${p.time || now}</time>
      </trkpt>`).join('');

  return header + trkpts + `
    </trkseg>
  </trk>
</gpx>`;
}

// ── Format helpers ───────────────────────────────────────────────────────────
function fmtTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function fmtDist(metres) {
  if (metres < 1000) return `${Math.round(metres)} m`;
  return `${(metres / 1000).toFixed(2)} km`;
}

function userToken() {
  return localStorage.getItem('user_token');
}

// ── Map auto-pan to current position ────────────────────────────────────────
function MapFollower({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
}

// ── Capacitor / Web geolocation abstraction ──────────────────────────────────
let CapGeo = null;
let CapBgGeo = null;
const BackgroundGeolocationPlugin = registerPlugin('BackgroundGeolocation');

async function loadCapacitorPlugins() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { Geolocation } = await import('@capacitor/geolocation');
    CapGeo = Geolocation;
  } catch { /* not available */ }

  if (Capacitor.isPluginAvailable('BackgroundGeolocation')) {
    CapBgGeo = BackgroundGeolocationPlugin;
  }
}

loadCapacitorPlugins();

// ── Screen 1: Tracker Home ───────────────────────────────────────────────────
function TrackerHome({ onStart, onViewTrack }) {
  useLang();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isLoggedIn = !!userToken();

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    fetchTracks()
      .then(setTracks)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!window.confirm(t('track.detail.confirmDelete'))) return;
    try {
      await deleteTrack(id);
      setTracks(prev => prev.filter(tr => tr._id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="tracker-home">
      <div className="tracker-header">
        <button className="detail-back-btn" onClick={() => window.location.href = '/'}>
          {t('common.backToTrails')}
        </button>
        <h1 className="tracker-title">{t('track.title')}</h1>
      </div>

      <div className="tracker-start-wrap">
        <button className="tracker-start-btn" onClick={onStart}>
          <span className="tracker-start-icon">▶</span>
          {t('track.startNew')}
        </button>
      </div>

      {!isLoggedIn && (
        <div className="tracker-info-banner">{t('track.loginRequired')}</div>
      )}

      {loading && <div className="tracker-loading">{t('common.loading')}</div>}
      {error && <div className="error-banner">{error}</div>}

      {!loading && isLoggedIn && tracks.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🥾</div>
          <div className="empty-state-text">{t('track.noTracks')}</div>
        </div>
      )}

      {tracks.length > 0 && (
        <div className="tracker-list">
          {tracks.map(tr => (
            <div key={tr._id} className="tracker-list-item" onClick={() => onViewTrack(tr._id)}>
              <div className="tracker-list-name">{tr.name || 'Unnamed Track'}</div>
              <div className="tracker-list-meta">
                {tr.startedAt ? new Date(tr.startedAt).toLocaleDateString() : '—'}
                {tr.distanceM != null && ` · ${fmtDist(tr.distanceM)}`}
                {tr.durationSec != null && ` · ${fmtTime(tr.durationSec)}`}
                {tr.elevationGainM != null && ` · ↑${Math.round(tr.elevationGainM)}m`}
              </div>
              <button
                className="tracker-list-delete"
                onClick={e => handleDelete(tr._id, e)}
                title={t('track.detail.delete')}
              >✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Screen 2: Active Tracking ────────────────────────────────────────────────
function ActiveTracking({ onStop, onCancel }) {
  useLang();
  const [tracking, setTracking]     = useState(false);
  const [paused, setPaused]         = useState(false);
  const [trackPoints, setTrackPoints] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distanceM, setDistanceM]   = useState(0);
  const [currentPos, setCurrentPos] = useState(null);
  const [accuracy, setAccuracy]     = useState(null);
  const [currentAlt, setCurrentAlt] = useState(null);
  const [speed, setSpeed]           = useState(null);
  const [error, setError]           = useState('');
  const [waitingGps, setWaitingGps] = useState(true);

  const watchIdRef   = useRef(null);
  const timerRef     = useRef(null);
  const pausedRef    = useRef(false);
  const lastPointRef = useRef(null);
  const startedAtRef = useRef(null);

  // Start timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (!pausedRef.current) setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Start GPS tracking on mount
  useEffect(() => {
    startTracking();
    return () => stopWatcher();
  }, []);

  async function startTracking() {
    setError('');
    startedAtRef.current = new Date().toISOString();

    if (CapBgGeo) {
      // Native background geolocation
      try {
        const id = await CapBgGeo.addWatcher(
          {
            backgroundMessage: "Recording your hike...",
            backgroundTitle:   "Hike'n'Seek",
            requestPermissions: true,
            stale:             false,
            distanceFilter:    10,
          },
          (location, err) => {
            if (err) return;
            handleNewPoint({
              lat:      location.latitude,
              lng:      location.longitude,
              ele:      location.altitude ?? 0,
              time:     new Date().toISOString(),
              speed:    location.speed,
              accuracy: location.accuracy,
            });
          }
        );
        watchIdRef.current = id;
        setTracking(true);
      } catch (err) {
        setError(t('track.error.noLocation'));
      }
    } else if (CapGeo) {
      // Native foreground geolocation
      try {
        await CapGeo.requestPermissions({ permissions: ['location'] });
        const id = await CapGeo.watchPosition(
          { enableHighAccuracy: true, timeout: 10000 },
          (pos, err) => {
            if (err) return;
            handleNewPoint({
              lat:      pos.coords.latitude,
              lng:      pos.coords.longitude,
              ele:      pos.coords.altitude ?? 0,
              time:     new Date().toISOString(),
              speed:    pos.coords.speed,
              accuracy: pos.coords.accuracy,
            });
          }
        );
        watchIdRef.current = id;
        setTracking(true);
      } catch (err) {
        setError(t('track.permissionDenied'));
      }
    } else if (navigator.geolocation) {
      // Web browser fallback
      const id = navigator.geolocation.watchPosition(
        pos => {
          handleNewPoint({
            lat:      pos.coords.latitude,
            lng:      pos.coords.longitude,
            ele:      pos.coords.altitude ?? 0,
            time:     new Date().toISOString(),
            speed:    pos.coords.speed,
            accuracy: pos.coords.accuracy,
          });
        },
        err => setError(t('track.error.noLocation')),
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
      watchIdRef.current = id;
      setTracking(true);
    } else {
      setError(t('track.error.noLocation'));
    }
  }

  function handleNewPoint(point) {
    if (pausedRef.current) return;
    setWaitingGps(false);
    setCurrentPos([point.lat, point.lng]);
    setAccuracy(point.accuracy);
    setCurrentAlt(point.ele);
    setSpeed(point.speed);

    setTrackPoints(prev => {
      const newPoints = [...prev, point];
      if (lastPointRef.current) {
        const d = haversineDistance(lastPointRef.current, point);
        setDistanceM(dm => dm + d);
      }
      lastPointRef.current = point;
      return newPoints;
    });
  }

  async function stopWatcher() {
    if (watchIdRef.current == null) return;
    if (CapBgGeo) {
      await CapBgGeo.removeWatcher({ id: watchIdRef.current }).catch(() => {});
    } else if (CapGeo) {
      await CapGeo.clearWatch({ id: watchIdRef.current }).catch(() => {});
    } else if (navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    watchIdRef.current = null;
  }

  function togglePause() {
    pausedRef.current = !pausedRef.current;
    setPaused(p => !p);
  }

  async function handleStop() {
    await stopWatcher();
    clearInterval(timerRef.current);
    const { gain, loss } = calcElevation(trackPoints);
    onStop({
      points:         trackPoints,
      durationSec:    elapsedTime,
      distanceM,
      elevationGainM: gain,
      elevationLossM: loss,
      startedAt:      startedAtRef.current,
      endedAt:        new Date().toISOString(),
    });
  }

  const mapCenter = currentPos || [45.9432, 24.9668];
  const polyline  = trackPoints.map(p => [p.lat, p.lng]);
  const poorGps   = accuracy != null && accuracy > 20;

  return (
    <div className="tracker-active">
      <div className="tracker-header">
        <button className="detail-back-btn" onClick={onCancel}>{t('common.cancel')}</button>
        <h2 className="tracker-title">{t('track.active.title')}</h2>
        <span className={`tracker-status-badge ${paused ? 'paused' : 'recording'}`}>
          {paused ? t('track.active.paused') : t('track.active.recording')}
        </span>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {waitingGps && !error && (
        <div className="tracker-gps-wait">{t('track.active.waitingGps')}</div>
      )}
      {poorGps && (
        <div className="tracker-accuracy-warn">{t('track.active.poorGps')}</div>
      )}

      {/* Live map */}
      <div className="tracker-map-wrap">
        <MapContainer center={mapCenter} zoom={15} style={{ height: 320, width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {polyline.length > 1 && <Polyline positions={polyline} color="#7c3aed" weight={4} />}
          {currentPos && <Marker position={currentPos} />}
          {currentPos && <MapFollower position={currentPos} />}
        </MapContainer>
      </div>

      {/* Stats bar */}
      <div className="tracker-stats-bar">
        <div className="tracker-stat">
          <span className="tracker-stat-label">{t('track.active.elapsed')}</span>
          <span className="tracker-stat-value">{fmtTime(elapsedTime)}</span>
        </div>
        <div className="tracker-stat">
          <span className="tracker-stat-label">{t('track.active.distance')}</span>
          <span className="tracker-stat-value">{fmtDist(distanceM)}</span>
        </div>
        <div className="tracker-stat">
          <span className="tracker-stat-label">{t('track.active.elevation')}</span>
          <span className="tracker-stat-value">
            {currentAlt != null ? `${Math.round(currentAlt)}m` : '—'}
          </span>
        </div>
        <div className="tracker-stat">
          <span className="tracker-stat-label">{t('track.active.speed')}</span>
          <span className="tracker-stat-value">
            {speed != null ? `${(speed * 3.6).toFixed(1)} km/h` : '—'}
          </span>
        </div>
      </div>

      {accuracy != null && (
        <div className="tracker-accuracy-bar">
          {t('track.active.accuracy')}: {Math.round(accuracy)}m
        </div>
      )}

      {/* Controls */}
      <div className="tracker-controls">
        <button className="tracker-pause-btn" onClick={togglePause}>
          {paused ? t('track.active.resume') : t('track.active.pause')}
        </button>
        <button
          className="tracker-stop-btn"
          onClick={handleStop}
          disabled={trackPoints.length === 0}
        >
          {t('track.active.stop')}
        </button>
      </div>
    </div>
  );
}

// ── Screen 3: Save Track ─────────────────────────────────────────────────────
function SaveTrack({ trackData, onSaved, onDiscard }) {
  useLang();
  const [name, setName]           = useState('');
  const [notes, setNotes]         = useState('');
  const [linkedHike, setLinkedHike] = useState('');
  const [hikes, setHikes]         = useState([]);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    fetchHikes().then(setHikes).catch(() => {});
  }, []);

  const polyline = (trackData.points || []).map(p => [p.lat, p.lng]);
  const mapCenter = polyline.length > 0
    ? polyline[Math.floor(polyline.length / 2)]
    : [45.9432, 24.9668];

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      await saveTrack({
        name:           name || 'My Hike',
        notes,
        linkedHike:     linkedHike || null,
        startedAt:      trackData.startedAt,
        endedAt:        trackData.endedAt,
        durationSec:    trackData.durationSec,
        distanceM:      trackData.distanceM,
        elevationGainM: trackData.elevationGainM,
        elevationLossM: trackData.elevationLossM,
        points:         trackData.points,
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleExportGpx() {
    const gpx  = generateGPX(trackData.points, name || 'My Hike');
    const blob  = new Blob([gpx], { type: 'application/gpx+xml' });
    const url   = URL.createObjectURL(blob);
    const a     = document.createElement('a');
    a.href      = url;
    a.download  = `${(name || 'hike').replace(/\s+/g, '_')}_${Date.now()}.gpx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="tracker-save">
      <div className="tracker-header">
        <h2 className="tracker-title">{t('track.save.title')}</h2>
      </div>

      {/* Summary */}
      <div className="tracker-stats-bar">
        <div className="tracker-stat">
          <span className="tracker-stat-label">{t('track.active.distance')}</span>
          <span className="tracker-stat-value">{fmtDist(trackData.distanceM || 0)}</span>
        </div>
        <div className="tracker-stat">
          <span className="tracker-stat-label">{t('track.active.elapsed')}</span>
          <span className="tracker-stat-value">{fmtTime(trackData.durationSec || 0)}</span>
        </div>
        <div className="tracker-stat">
          <span className="tracker-stat-label">{t('track.detail.elevGain')}</span>
          <span className="tracker-stat-value">↑{Math.round(trackData.elevationGainM || 0)}m</span>
        </div>
        <div className="tracker-stat">
          <span className="tracker-stat-label">{t('track.points')}</span>
          <span className="tracker-stat-value">{t('track.points', { n: trackData.points?.length || 0 })}</span>
        </div>
      </div>

      {/* Preview map */}
      {polyline.length > 0 && (
        <div className="tracker-map-wrap">
          <p className="tracker-map-label">{t('track.save.preview')}</p>
          <MapContainer center={mapCenter} zoom={13} style={{ height: 220, width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {polyline.length > 1 && <Polyline positions={polyline} color="#7c3aed" weight={4} />}
          </MapContainer>
        </div>
      )}

      {/* Form */}
      <div className="tracker-save-form">
        <label className="tracker-label">
          {t('track.save.name')}
          <input
            className="tracker-input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('track.save.namePlaceholder')}
          />
        </label>

        <label className="tracker-label">
          {t('track.save.linkHike')}
          <select
            className="tracker-input"
            value={linkedHike}
            onChange={e => setLinkedHike(e.target.value)}
          >
            <option value="">{t('track.save.linkNone')}</option>
            {hikes.map(h => (
              <option key={h._id} value={h._id}>{h.name}</option>
            ))}
          </select>
        </label>

        <label className="tracker-label">
          {t('track.save.notes')}
          <textarea
            className="tracker-input tracker-textarea"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={t('track.save.notesPlaceholder')}
            rows={3}
          />
        </label>

        {error && <div className="error-banner">{error}</div>}

        <div className="tracker-save-actions">
          <button
            className="tracker-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? t('track.save.saving') : t('track.save.saveProfile')}
          </button>
          <button className="tracker-gpx-btn" onClick={handleExportGpx}>
            {t('track.save.exportGpx')}
          </button>
          <button className="tracker-discard-btn" onClick={onDiscard}>
            {t('track.save.discard')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main HikeTracker component (manages view state) ──────────────────────────
const VIEWS = { HOME: 'home', ACTIVE: 'active', SAVE: 'save' };

export default function HikeTracker() {
  const pathname = window.location.pathname;
  const initialView = pathname.includes('/track/active') ? VIEWS.ACTIVE
    : pathname.includes('/track/save')   ? VIEWS.SAVE
    : VIEWS.HOME;

  const [view, setView]           = useState(initialView);
  const [trackData, setTrackData] = useState(null);

  // Sync URL to view
  useEffect(() => {
    const url = view === VIEWS.ACTIVE ? '/track/active'
      : view === VIEWS.SAVE   ? '/track/save'
      : '/track';
    if (window.location.pathname !== url) {
      window.history.pushState({}, '', url);
    }
  }, [view]);

  function handleStart() {
    setTrackData(null);
    setView(VIEWS.ACTIVE);
  }

  function handleStopTracking(data) {
    if (!data.points || data.points.length === 0) {
      setView(VIEWS.HOME);
      return;
    }
    setTrackData(data);
    setView(VIEWS.SAVE);
  }

  function handleSaved() {
    setTrackData(null);
    setView(VIEWS.HOME);
  }

  function handleDiscard() {
    if (window.confirm(t('track.save.discard') + '?')) {
      setTrackData(null);
      setView(VIEWS.HOME);
    }
  }

  if (view === VIEWS.ACTIVE) {
    return (
      <ActiveTracking
        onStop={handleStopTracking}
        onCancel={() => setView(VIEWS.HOME)}
      />
    );
  }

  if (view === VIEWS.SAVE && trackData) {
    return (
      <SaveTrack
        trackData={trackData}
        onSaved={handleSaved}
        onDiscard={handleDiscard}
      />
    );
  }

  return (
    <TrackerHome
      onStart={handleStart}
      onViewTrack={id => window.location.href = `/track/${id}`}
    />
  );
}
