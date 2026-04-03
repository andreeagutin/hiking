import { useState, useEffect, useCallback } from 'react';
import { marked } from 'marked';
import { fetchHike } from '../api/hikes.js';
import WeatherForecast from './WeatherForecast.jsx';
import t from '../i18n.js';
import useLang from '../hooks/useLang.js';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function isSafeUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch { return false; }
}

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

const RISK_COLOR = { low: 'green', medium: 'amber', high: 'red' };
const SIGNAL_COLOR = { good: 'green', partial: 'amber', none: 'red' };
const MARK_HEX = { red: '#dc2626', yellow: '#ca8a04', blue: '#2563eb' };

function TrailMarker({ color, shape }) {
  const c = MARK_HEX[color] || '#374151';
  const base = (
    <>
      <rect width="40" height="28" rx="4" fill="#fff" stroke="#d1d5db" strokeWidth="1.2"/>
    </>
  );
  if (shape === 'stripe') return (
    <svg width="40" height="28" viewBox="0 0 40 28" style={{ flexShrink: 0 }}>
      {base}<rect x="0" y="10" width="40" height="8" fill={c} rx="1"/>
    </svg>
  );
  if (shape === 'cross') return (
    <svg width="40" height="28" viewBox="0 0 40 28" style={{ flexShrink: 0 }}>
      {base}
      <rect x="17" y="3" width="6" height="22" fill={c} rx="1"/>
      <rect x="3" y="11" width="34" height="6" fill={c} rx="1"/>
    </svg>
  );
  if (shape === 'triangle') return (
    <svg width="40" height="28" viewBox="0 0 40 28" style={{ flexShrink: 0 }}>
      {base}<polygon points="20,3 37,25 3,25" fill={c}/>
    </svg>
  );
  if (shape === 'dot') return (
    <svg width="40" height="28" viewBox="0 0 40 28" style={{ flexShrink: 0 }}>
      {base}<circle cx="20" cy="14" r="8" fill={c}/>
    </svg>
  );
  return (
    <svg width="40" height="28" viewBox="0 0 40 28" style={{ flexShrink: 0 }}>
      <rect width="40" height="28" rx="4" fill={c}/>
    </svg>
  );
}

export default function HikeDetail({ id }) {
  useLang();
  const [hike, setHike]         = useState(null);
  const [error, setError]       = useState('');
  const [lightbox, setLightbox] = useState(null);

  const closeLightbox = useCallback(() => setLightbox(null), []);
  useEffect(() => {
    if (!lightbox) return;
    function onKey(e) { if (e.key === 'Escape') closeLightbox(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, closeLightbox]);

  useEffect(() => {
    fetchHike(id).then(setHike).catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <div className="detail-error-wrap">
        <div className="error-banner">⚠ {error}</div>
        <button className="detail-back-btn" onClick={() => window.location.href = '/'}>{t('common.backToError')}</button>
      </div>
    );
  }

  if (!hike) return <div className="detail-loading">{t('common.loading')}</div>;

  const hikeImg = hike.mainPhoto || hike.photos?.[0] || hike.imageUrl;
  const heroBg = hikeImg ? undefined : 'linear-gradient(145deg, #1e1b4b 0%, #2e1065 50%, #3b0764 100%)';

  return (
    <div className="detail-page">
      {/* Hero */}
      <div className="detail-hero" style={heroBg ? { background: heroBg } : {}}>
        {hikeImg && <img src={hikeImg} alt={hike.name} className="detail-hero-img" />}
        <div className="detail-hero-overlay">
          <button className="detail-back-btn" onClick={() => window.location.href = '/'}>
            {t('common.backToTrails')}
          </button>
          <div className="detail-hero-content">
            <div className="detail-hero-crumbs">
              {hike.mountains && <span className="detail-crumb">{hike.mountains}</span>}
              {hike.zone      && <span className="detail-crumb">{hike.zone}</span>}
            </div>
            <h1 className="detail-hero-title">{hike.name}</h1>
            <div className="detail-hero-badges">
              {hike.status && (
                <span className={`badge status-${hike.status.replace(' ', '-')}`}>{t(`status.${hike.status}`)}</span>
              )}
              {hike.difficulty && (
                <span className={`badge diff-${hike.difficulty}`}>{t(`difficulty.${hike.difficulty}`)}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="cave-lightbox" onClick={closeLightbox}>
          <button className="cave-lightbox-close" onClick={closeLightbox}>✕</button>
          <img src={lightbox} alt="" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Content */}
      <div className="detail-content">

        {/* Photo gallery */}
        {hike.photos && hike.photos.length > 1 && (
          <div className="detail-photo-gallery">
            <div className="detail-section-label">{t('hike.photos')}</div>
            <div className="detail-photo-grid">
              {hike.photos.map((url, i) => (
                <div key={url} className="detail-photo-thumb" onClick={() => setLightbox(url)}>
                  <img src={url} alt={`${hike.name} ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="detail-stats-grid">
          {hike.trailMarkers && hike.trailMarkers.length > 0 && (
            <div className="detail-stat detail-stat--markers">
              {hike.trailMarkers.map((id) => (
                <img key={id} src={`/hiking_markers/${id}.svg`} alt={id} title={id.replace('_', ' ')} className="detail-stat-marker-img" />
              ))}
            </div>
          )}
          <StatItem icon="📏" value={hike.distance ? `${hike.distance} km` : null} label={t('stat.distance')} />
          <StatItem icon="⏱"  value={hike.time     ? `${hike.time} h`     : null} label={t('stat.duration')} />
          <StatItem icon="↑"  value={hike.up        ? `${hike.up} m`       : null} label={t('stat.elevationGain')} />
          <StatItem icon="↓"  value={hike.down      ? `${hike.down} m`     : null} label={t('stat.elevationLoss')} />
          <StatItem icon="🔄" value={hike.tip ? t(`tripType.${hike.tip}`) : null} label={t('stat.tripType')} />
          <StatItem icon="✓"  value={formatDate(hike.completed)} label={t('stat.completedOn')} />
        </div>

        {/* Family & Safety */}
        {(hike.familyFriendly || hike.strollerAccessible || hike.toddlerFriendly ||
          hike.minAgeRecommended != null || hike.kidEngagementScore != null ||
          (hike.highlights && hike.highlights.length > 0) ||
          hike.hasRestAreas || hike.hasBathrooms || hike.hasPicknicArea ||
          hike.nearbyPlayground || hike.safeWaterSource ||
          hike.bearRisk || hike.sheepdogWarning || hike.mobileSignal ||
          hike.trailMarkColor || (hike.trailMarkers && hike.trailMarkers.length > 0) ||
          hike.salvamontPoint) && (
          <div className="detail-family-card">
            <div className="detail-family-header">
              <div className="detail-family-title">{t('hike.familySafety')}</div>
              {hike.trailMarkers && hike.trailMarkers.length > 0 && (
                <div className="detail-family-markers">
                  {hike.trailMarkers.map((id) => (
                    <img key={id} src={`/hiking_markers/${id}.svg`} alt={id} title={id.replace('_', ' ')} className="detail-marker-img" />
                  ))}
                </div>
              )}
            </div>

            {/* Suitability chips */}
            {(hike.familyFriendly || hike.strollerAccessible || hike.toddlerFriendly ||
              hike.minAgeRecommended != null || hike.kidEngagementScore != null) && (
              <div className="detail-family-section">
                <div className="detail-family-sub">{t('hike.familySuitability')}</div>
                <div className="detail-family-chips">
                  {hike.familyFriendly    && <span className="detail-chip detail-chip--yes">👨‍👩‍👧 {t('hike.familyFriendly')}</span>}
                  {hike.toddlerFriendly   && <span className="detail-chip detail-chip--yes">🧒 {t('hike.toddlerFriendly')}</span>}
                  {hike.strollerAccessible && <span className="detail-chip detail-chip--yes">🛒 {t('hike.strollerAccessible')}</span>}
                  {hike.minAgeRecommended != null && (
                    <span className="detail-chip">🔢 {t('hike.minAge')}: {hike.minAgeRecommended}+</span>
                  )}
                  {hike.kidEngagementScore != null && (
                    <span className="detail-chip">⭐ {t('hike.kidScore')}: {hike.kidEngagementScore}/5</span>
                  )}
                </div>
              </div>
            )}

            {/* Highlights */}
            {hike.highlights && hike.highlights.length > 0 && (
              <div className="detail-family-section">
                <div className="detail-family-sub">{t('hike.highlights')}</div>
                <div className="detail-family-chips">
                  {hike.highlights.map((h) => (
                    <span key={h} className="detail-chip detail-chip--highlight">{h}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {(hike.hasRestAreas || hike.hasBathrooms || hike.hasPicknicArea ||
              hike.nearbyPlayground || hike.safeWaterSource) && (
              <div className="detail-family-section">
                <div className="detail-family-sub">{t('hike.amenities')}</div>
                <div className="detail-family-chips">
                  {hike.hasRestAreas && (
                    <span className="detail-chip detail-chip--yes">
                      🏕 {t('hike.restAreas')}{hike.restAreaCount != null ? ` (${hike.restAreaCount})` : ''}
                      {hike.bathroomType && hike.hasBathrooms ? '' : ''}
                    </span>
                  )}
                  {hike.hasBathrooms && (
                    <span className="detail-chip detail-chip--yes">
                      🚻 {t('hike.bathrooms')}{hike.bathroomType ? ` · ${hike.bathroomType}` : ''}
                    </span>
                  )}
                  {hike.hasPicknicArea  && <span className="detail-chip detail-chip--yes">🧺 {t('hike.picnicArea')}</span>}
                  {hike.nearbyPlayground && <span className="detail-chip detail-chip--yes">🛝 {t('hike.playground')}</span>}
                  {hike.safeWaterSource  && <span className="detail-chip detail-chip--yes">💧 {t('hike.safeWater')}</span>}
                </div>
              </div>
            )}

            {/* Safety */}
            {(hike.bearRisk || hike.sheepdogWarning || hike.mobileSignal || hike.salvamontPoint) && (
              <div className="detail-family-section">
                <div className="detail-family-sub">{t('hike.safety')}</div>
                <div className="detail-family-chips">
                  {hike.bearRisk && (
                    <span className={`detail-chip detail-chip--${RISK_COLOR[hike.bearRisk] || 'neutral'}`}>
                      🐻 {t('hike.bearRisk')}: {hike.bearRisk}
                    </span>
                  )}
                  {hike.sheepdogWarning && (
                    <span className="detail-chip detail-chip--amber">🐕 {t('hike.sheepdogWarning')}</span>
                  )}
                  {hike.mobileSignal && (
                    <span className={`detail-chip detail-chip--${SIGNAL_COLOR[hike.mobileSignal] || 'neutral'}`}>
                      📶 {t('hike.mobileSignal')}: {hike.mobileSignal}
                    </span>
                  )}
                  {hike.salvamontPoint && (
                    <span className="detail-chip">🆘 {t('hike.salvamontPoint')}: {hike.salvamontPoint}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {hike.startLat != null && hike.startLng != null && (
          <WeatherForecast lat={hike.startLat} lng={hike.startLng} />
        )}

        {hike.mapUrl && (
          <div className="detail-map-section">
            <iframe
              src={hike.mapUrl.replace(/^https?:\/\/(www\.|en\.)?mapy\.(cz|com)/, 'https://frame.mapy.cz')}
              className="detail-map-iframe"
              title="Trail map"
              style={{ border: 'none' }}
              allowFullScreen
            />
          </div>
        )}

        {hike.description && (
          <div className="detail-description-section">
            <div className="detail-description-label">{t('hike.aboutTrail')}</div>
            <div className="detail-description" dangerouslySetInnerHTML={{ __html: marked.parse(hike.description) }} />
          </div>
        )}

        {hike.history && hike.history.length > 0 && (
          <div className="detail-history-section">
            <div className="detail-history-title">{t('hike.history')}</div>
            <div className="detail-history-list">
              {[...hike.history].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).map((h) => (
                <div key={h._id} className={`detail-history-entry${h.is_hike ? ' is-hike' : ''}`}>
                  <div className="detail-history-date">
                    {h.updatedAt ? new Date(h.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') : '—'}
                  </div>
                  <div className="detail-history-badge">{h.is_hike ? t('history.hike') : t('history.recon')}</div>
                  <div className="detail-history-stats">
                    {h.distance != null && <span><strong>{h.distance} km</strong> {t('history.dist')}</span>}
                    {h.time     != null && <span><strong>{h.time} h</strong> {t('history.time')}</span>}
                    {h.up       != null && <span><strong>↑{h.up}m</strong></span>}
                    {h.down     != null && <span><strong>↓{h.down}m</strong></span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hike.restaurants && hike.restaurants.length > 0 && (
          <div className="detail-restaurants-section">
            <div className="detail-restaurants-title">{t('hike.nearbyRestaurants')}</div>
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
                  {r.link && isSafeUrl(r.link) && <a href={r.link} target="_blank" rel="noopener noreferrer" className="detail-restaurant-link">{t('common.view')}</a>}
                </div>
              ))}
            </div>
          </div>
        )}

        {hike.caves && hike.caves.length > 0 && (
          <div className="detail-caves-section">
            <div className="detail-caves-title">{t('hike.nearbyCaves')}</div>
            <div className="detail-caves-list">
              {hike.caves.map((c) => (
                <a key={c._id} href={`/cave/${c._id}`} className="detail-cave-card">
                  {c.mainPhoto && (
                    <div className="detail-cave-thumb">
                      <img src={c.mainPhoto} alt={c.name} />
                    </div>
                  )}
                  <div className="detail-cave-body">
                    <div className="detail-cave-top">
                      <span className="detail-cave-name">{c.name}</span>
                      <span className="detail-cave-icon">🦇</span>
                    </div>
                    {c.mountains && <div className="detail-cave-mountains">{c.mountains}</div>}
                    <div className="detail-cave-stats">
                      {c.development != null && <span>↔ {c.development} m</span>}
                      {c.verticalExtent != null && <span>↕ {c.verticalExtent} m</span>}
                      {c.altitude != null && <span>⛰ {c.altitude} m</span>}
                      {c.rockType && <span>{c.rockType}</span>}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
