import { useState, useEffect } from 'react';
import { fetchHike } from '../api/hikes.js';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDate(val) {
  if (!val) return null;
  let date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    date = new Date(val + 'T00:00:00');
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
    const [d, m, y] = val.split('/');
    date = new Date(`${y}-${m}-${d}T00:00:00`);
  } else {
    return val;
  }
  return `${String(date.getDate()).padStart(2,'0')}-${MONTHS[date.getMonth()]}-${date.getFullYear()}`;
}

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
          <StatItem icon="✓" value={formatDate(hike.completed)} label="Completed on" />
        </div>
        {hike.description && (
          <div className="detail-description-section">
            <div className="detail-description-label">About this trail</div>
            <p className="detail-description">{hike.description}</p>
          </div>
        )}

        {hike.history && hike.history.length > 0 && (
          <div className="detail-history-section">
            <div className="detail-history-title">History</div>
            <div className="detail-history-list">
              {[...hike.history].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).map((h) => (
                <div key={h._id} className={`detail-history-entry${h.is_hike ? ' is-hike' : ''}`}>
                  <div className="detail-history-date">
                    {h.updatedAt ? new Date(h.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') : '—'}
                  </div>
                  <div className="detail-history-badge">{h.is_hike ? 'Hike' : 'Recon'}</div>
                  <div className="detail-history-stats">
                    {h.distance != null && <span><strong>{h.distance} km</strong> dist.</span>}
                    {h.time != null && <span><strong>{h.time} h</strong> time</span>}
                    {h.up != null && <span><strong>↑{h.up}m</strong></span>}
                    {h.down != null && <span><strong>↓{h.down}m</strong></span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hike.restaurants && hike.restaurants.length > 0 && (
          <div className="detail-restaurants-section">
            <div className="detail-restaurants-title">Nearby restaurants</div>
            <div className="detail-restaurants-list">
              {hike.restaurants.map((r) => (
                <div key={r._id} className="detail-restaurant-card">
                  <div className="detail-restaurant-top">
                    <span className="detail-restaurant-name">{r.name}</span>
                    {r.type && <span className="detail-restaurant-type">{r.type}</span>}
                  </div>
                  {(r.zone || r.mountains) && (
                    <div className="detail-restaurant-meta">
                      {r.mountains && <span>{r.mountains}</span>}
                      {r.zone && <span>{r.zone}</span>}
                    </div>
                  )}
                  {r.address && <div className="detail-restaurant-address">{r.address}</div>}
                  {r.notes && <div className="detail-restaurant-notes">{r.notes}</div>}
                  {r.link && <a href={r.link} target="_blank" rel="noopener noreferrer" className="detail-restaurant-link">View →</a>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
