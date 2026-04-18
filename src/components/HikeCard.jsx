import t from '../i18n.js';
import useLang from '../hooks/useLang.js';

const GRADIENTS = [
  'linear-gradient(145deg, #0d2318 0%, #2d6a4f 100%)',
  'linear-gradient(145deg, #1e3a5f 0%, #1d4ed8 100%)',
  'linear-gradient(145deg, #3d1a2b 0%, #9d174d 100%)',
  'linear-gradient(145deg, #3d2b1a 0%, #92400e 100%)',
  'linear-gradient(145deg, #1a2d3d 0%, #0e7490 100%)',
  'linear-gradient(145deg, #2d1a3d 0%, #6d28d9 100%)',
  'linear-gradient(145deg, #1a3d1a 0%, #15803d 100%)',
  'linear-gradient(145deg, #3d3a1a 0%, #a16207 100%)',
];

function cardGradient(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return GRADIENTS[Math.abs(h) % GRADIENTS.length];
}

// SVG icons (inline, no dependency)
function IconRoute() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>
    </svg>
  );
}
function IconClock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
function IconMountain() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
    </svg>
  );
}

function fmtDriveDuration(secs) {
  if (secs == null) return null;
  const h = Math.floor(secs / 3600);
  const m = Math.round((secs % 3600) / 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export default function HikeCard({ hike, distance, driveDuration }) {
  useLang();
  const hikeImg = hike.mainPhoto || hike.photos?.[0] || hike.imageUrl;
  const bg = hikeImg ? undefined : cardGradient(hike.name);

  return (
    <article
      className="hike-card"
      onClick={() => { window.location.href = `/hike/${hike.slug || hike._id}`; }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && (window.location.href = `/hike/${hike.slug || hike._id}`)}
    >
      {/* ── Image area ── */}
      <div className="hike-card-media" style={bg ? { background: bg } : {}}>
        {hikeImg
          ? <img src={hikeImg} alt={hike.name} className="hike-card-img" loading="lazy" />
          : <div className="hike-card-no-img"><span>🏔️</span></div>
        }

        {/* Bottom gradient overlay */}
        <div className="hike-card-img-overlay" />

        {/* Badges top-left: difficulty + family */}
        <div className="hike-card-badges">
          {hike.difficulty && (
            <span className={`hike-badge hike-badge-diff-${hike.difficulty}`}>
              {t(`difficulty.${hike.difficulty}`)}
            </span>
          )}
          {hike.familyFriendly && (
            <span className="hike-badge hike-badge-family">
              👨‍👩‍👧 {t('hike.familyFriendly')}
            </span>
          )}
        </div>

        {/* Location overlay bottom-left */}
        {(hike.mountains || hike.zone) && (
          <div className="hike-card-img-location">
            {hike.mountains && <p className="hike-card-img-region">{hike.mountains}</p>}
            {hike.zone && <p className="hike-card-img-zone">{hike.zone}</p>}
          </div>
        )}
      </div>

      {/* ── Card body ── */}
      <div className="hike-card-body">
        <h3 className="hike-card-title">{hike.name}</h3>

        {/* Stats grid — 3 columns */}
        {(hike.distance || hike.time || hike.up) && (
          <div className="hike-card-stats-grid">
            {hike.distance && (
              <div className="hike-card-stat-cell">
                <IconRoute />
                <span className="hike-stat-value">{hike.distance} km</span>
                <span className="hike-stat-lbl">{t('stat.distance')}</span>
              </div>
            )}
            {hike.time && (
              <div className="hike-card-stat-cell">
                <IconClock />
                <span className="hike-stat-value">{hike.time}h</span>
                <span className="hike-stat-lbl">{t('stat.duration')}</span>
              </div>
            )}
            {hike.up && (
              <div className="hike-card-stat-cell">
                <IconMountain />
                <span className="hike-stat-value">{hike.up}m</span>
                <span className="hike-stat-lbl">{t('stat.elevationGain')}</span>
              </div>
            )}
          </div>
        )}

        {/* Trail markers */}
        {hike.trailMarkers && hike.trailMarkers.length > 0 && (
          <div className="hike-card-markers">
            {hike.trailMarkers.map((id) => (
              <img key={id} src={`/hiking_markers/${id}.svg`} alt={id} className="hike-card-marker-img" />
            ))}
          </div>
        )}

        {/* Footer: age badge · trip type · distance · details → */}
        <div className="hike-card-footer">
          <div className="hike-card-footer-left">
            {hike.minAgeRecommended != null && (
              <span className="hike-age-badge">{t('card.agesPlus', { age: hike.minAgeRecommended })}</span>
            )}
            {hike.tip && <span className="hike-card-tip">{t(`tripType.${hike.tip}`)}</span>}
            {distance != null && (
              <span className="hike-card-tip hike-card-stat-distance">
                📍 {distance < 1 ? `${(distance * 1000).toFixed(0)} m` : `${distance.toFixed(0)} km`} {t('card.away')}
                {fmtDriveDuration(driveDuration) && (
                  <span className="hike-card-drive-duration"> ({fmtDriveDuration(driveDuration)} 🚗)</span>
                )}
              </span>
            )}
          </div>
          <span className="hike-card-details-btn">{t('card.details')} →</span>
        </div>
      </div>
    </article>
  );
}
