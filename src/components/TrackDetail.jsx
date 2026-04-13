import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { t } from '../i18n.js';
import useLang from '../hooks/useLang.js';
import { fetchTrack, deleteTrack, gpxDownloadUrl } from '../api/trackedHikes.js';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

function fmtTime(secs) {
  if (secs == null) return '—';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function fmtDist(metres) {
  if (metres == null) return '—';
  if (metres < 1000) return `${Math.round(metres)} m`;
  return `${(metres / 1000).toFixed(2)} km`;
}

function fmtPace(distM, durationSec) {
  if (!distM || !durationSec) return '—';
  const distKm  = distM / 1000;
  const paceSecPerKm = durationSec / distKm;
  const pm = Math.floor(paceSecPerKm / 60);
  const ps = Math.round(paceSecPerKm % 60);
  return `${pm}:${String(ps).padStart(2, '0')} min/km`;
}

function buildElevationChartData(points) {
  if (!points || points.length === 0) return [];
  const step = Math.max(1, Math.floor(points.length / 200)); // max ~200 data points
  const data = [];
  let cumDist = 0;

  for (let i = 0; i < points.length; i += step) {
    if (i > 0) {
      const p1 = points[i - step];
      const p2 = points[i];
      const R  = 6371000;
      const dLat = (p2.lat - p1.lat) * Math.PI / 180;
      const dLng = (p2.lng - p1.lng) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
      cumDist += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    data.push({
      dist: +(cumDist / 1000).toFixed(3),
      ele:  Math.round(points[i].ele ?? 0),
    });
  }
  return data;
}

export default function TrackDetail({ id }) {
  useLang();
  const [track, setTrack]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (!id) return;
    fetchTrack(id)
      .then(setTrack)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!window.confirm(t('track.detail.confirmDelete'))) return;
    try {
      await deleteTrack(id);
      window.location.href = '/track';
    } catch (err) {
      alert(err.message);
    }
  }

  function handleGpxDownload() {
    const token = localStorage.getItem('user_token');
    // Fetch with auth and trigger download
    fetch(gpxDownloadUrl(id), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href    = url;
        a.download = `${(track?.name || 'hike').replace(/\s+/g, '_')}.gpx`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => alert('Failed to download GPX'));
  }

  if (loading) return <div className="tracker-home"><div className="tracker-loading">{t('common.loading')}</div></div>;
  if (error)   return (
    <div className="detail-error-wrap">
      <div className="error-banner">{error}</div>
      <button className="detail-back-btn" onClick={() => window.location.href = '/track'}>
        {t('common.back')}
      </button>
    </div>
  );
  if (!track) return null;

  const points    = track.points || [];
  const polyline  = points.map(p => [p.lat, p.lng]);
  const mapCenter = polyline.length > 0
    ? polyline[Math.floor(polyline.length / 2)]
    : [45.9432, 24.9668];

  const chartData = buildElevationChartData(points);
  const eleMin    = chartData.reduce((m, d) => Math.min(m, d.ele), Infinity);
  const eleMax    = chartData.reduce((m, d) => Math.max(m, d.ele), -Infinity);
  const elePadding = Math.max(20, Math.round((eleMax - eleMin) * 0.1));

  return (
    <div className="tracker-detail">
      <div className="tracker-header">
        <button className="detail-back-btn" onClick={() => window.location.href = '/track'}>
          {t('common.back')}
        </button>
        <h1 className="tracker-title">{track.name || 'Track'}</h1>
        {track.startedAt && (
          <span className="tracker-date">{new Date(track.startedAt).toLocaleDateString()}</span>
        )}
      </div>

      {/* Stats grid */}
      <div className="tracker-stats-bar tracker-stats-grid">
        <div className="tracker-stat">
          <span className="tracker-stat-label">{t('track.detail.totalDist')}</span>
          <span className="tracker-stat-value">{fmtDist(track.distanceM)}</span>
        </div>
        <div className="tracker-stat">
          <span className="tracker-stat-label">{t('track.detail.duration')}</span>
          <span className="tracker-stat-value">{fmtTime(track.durationSec)}</span>
        </div>
        <div className="tracker-stat">
          <span className="tracker-stat-label">{t('track.detail.elevGain')}</span>
          <span className="tracker-stat-value">
            {track.elevationGainM != null ? `↑${Math.round(track.elevationGainM)}m` : '—'}
          </span>
        </div>
        <div className="tracker-stat">
          <span className="tracker-stat-label">{t('track.detail.elevLoss')}</span>
          <span className="tracker-stat-value">
            {track.elevationLossM != null ? `↓${Math.round(track.elevationLossM)}m` : '—'}
          </span>
        </div>
        <div className="tracker-stat">
          <span className="tracker-stat-label">{t('track.detail.pace')}</span>
          <span className="tracker-stat-value">{fmtPace(track.distanceM, track.durationSec)}</span>
        </div>
        <div className="tracker-stat">
          <span className="tracker-stat-label">{t('track.points', { n: points.length })}</span>
          <span className="tracker-stat-value">{points.length}</span>
        </div>
      </div>

      {/* Linked hike */}
      {track.linkedHike && (
        <div className="tracker-linked-hike">
          <a href={`/hike/${track.linkedHike.slug || track.linkedHike._id}`}>
            {t('track.detail.compareRoute')}: {track.linkedHike.name}
          </a>
        </div>
      )}

      {/* Notes */}
      {track.notes && (
        <div className="tracker-notes">{track.notes}</div>
      )}

      {/* Full-route map */}
      {polyline.length > 0 && (
        <div className="tracker-map-wrap">
          <MapContainer center={mapCenter} zoom={13} style={{ height: 340, width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {polyline.length > 1 && <Polyline positions={polyline} color="#7c3aed" weight={4} />}
            {polyline.length > 0 && <Marker position={polyline[0]} />}
            {polyline.length > 1 && <Marker position={polyline[polyline.length - 1]} />}
          </MapContainer>
        </div>
      )}

      {/* Elevation profile */}
      {chartData.length > 1 && (
        <div className="tracker-elev-section">
          <h3 className="tracker-section-title">{t('track.detail.elevProfile')}</h3>
          <div className="tracker-elev-chart">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="dist"
                  tickFormatter={v => `${v} km`}
                  tick={{ fontSize: 11 }}
                  stroke="#9ca3af"
                />
                <YAxis
                  domain={[eleMin - elePadding, eleMax + elePadding]}
                  tickFormatter={v => `${v}m`}
                  tick={{ fontSize: 11 }}
                  stroke="#9ca3af"
                  width={48}
                />
                <Tooltip
                  formatter={(v) => [`${v} m`, 'Elevation']}
                  labelFormatter={(l) => `${l} km`}
                  contentStyle={{ fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="ele"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  fill="url(#elevGrad)"
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="tracker-detail-actions">
        <button className="tracker-gpx-btn" onClick={handleGpxDownload}>
          {t('track.detail.exportGpx')}
        </button>
        <button className="tracker-discard-btn" onClick={handleDelete}>
          {t('track.detail.delete')}
        </button>
      </div>
    </div>
  );
}
