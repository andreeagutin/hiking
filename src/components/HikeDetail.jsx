import { useState, useEffect } from 'react';
import { fetchHike } from '../api/hikes.js';

function StatItem({ icon, value, label }) {
  if (!value) return null;
  return (
    <div className="detail-stat">
      <span className="detail-stat-icon">{icon}</span>
      <span className="detail-stat-value">{value}</span>
      <span className="detail-stat-label">{label}</span>
    </div>
  );
}

export default function HikeDetail({ id }) {
  const [hike, setHike]   = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHike(id).then(setHike).catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <div className="detail-error-wrap">
        <div className="error-banner">⚠ {error}</div>
        <button className="detail-back-btn" onClick={() => window.location.href = '/'}>← Back to trails</button>
      </div>
    );
  }

  if (!hike) {
    return <div className="detail-loading">Loading…</div>;
  }

  const heroBg = hike.imageUrl ? undefined : 'linear-gradient(145deg, #0d2318 0%, #2d6a4f 100%)';

  return (
    <div className="detail-page">
      {/* Hero */}
      <div className="detail-hero" style={heroBg ? { background: heroBg } : {}}>
        {hike.imageUrl && <img src={hike.imageUrl} alt={hike.name} className="detail-hero-img" />}
        <div className="detail-hero-overlay">
          <button className="detail-back-btn" onClick={() => window.location.href = '/'}>
            ← All trails
          </button>
          <div className="detail-hero-content">
            <div className="detail-hero-crumbs">
              {hike.mountains && <span className="detail-crumb">{hike.mountains}</span>}
              {hike.zone      && <span className="detail-crumb">{hike.zone}</span>}
            </div>
            <h1 className="detail-hero-title">{hike.name}</h1>
            <div className="detail-hero-badges">
              {hike.status && (
                <span className={`badge status-${hike.status.replace(' ', '-')}`}>{hike.status}</span>
              )}
              {hike.difficulty && (
                <span className={`badge diff-${hike.difficulty}`}>{hike.difficulty}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="detail-content">
        <div className="detail-stats-grid">
          <StatItem icon="📏" value={hike.distance ? `${hike.distance} km` : null} label="Distance" />
          <StatItem icon="⏱" value={hike.time ? `${hike.time} h` : null} label="Duration" />
          <StatItem icon="↑" value={hike.up ? `${hike.up} m` : null} label="Elevation gain" />
          <StatItem icon="↓" value={hike.down ? `${hike.down} m` : null} label="Elevation loss" />
          <StatItem icon="🔄" value={hike.tip} label="Trip type" />
          <StatItem icon="✓" value={hike.completed} label="Completed on" />
        </div>
      </div>
    </div>
  );
}
