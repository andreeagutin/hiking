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

const DIFF_BAR = { easy: { pct: 33, color: '#22c55e' }, medium: { pct: 66, color: '#f59e0b' }, hard: { pct: 100, color: '#ef4444' } };
const BEAR_COLOR = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };

function StatBar({ icon, label, pct, color }) {
  return (
    <div className="hc-overlay-row">
      <span className="hc-overlay-icon">{icon}</span>
      <span className="hc-overlay-label">{label}</span>
      <div className="hc-overlay-track">
        <div className="hc-overlay-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function HikeCard({ hike, distance }) {
  useLang();
  const hikeImg = hike.mainPhoto || hike.photos?.[0] || hike.imageUrl;
  const bg = hikeImg ? undefined : cardGradient(hike.name);

  const diffBar = hike.difficulty ? DIFF_BAR[hike.difficulty] : null;
  const distPct = hike.distance ? Math.min(hike.distance / 30 * 100, 100) : null;
  const timePct = hike.time ? Math.min(hike.time / 10 * 100, 100) : null;
  const upPct   = hike.up   ? Math.min(hike.up / 2000 * 100, 100) : null;

  return (
    <article
      className="hike-card"
      onClick={() => { window.location.href = `/hike/${hike._id}`; }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && (window.location.href = `/hike/${hike._id}`)}
    >
      <div className="hike-card-media" style={bg ? { background: bg } : {}}>
        {hikeImg
          ? <img src={hikeImg} alt={hike.name} className="hike-card-img" loading="lazy" />
          : <div className="hike-card-no-img"><span>🏔️</span></div>
        }
        <div className="hike-card-media-top">
          {hike.status && (
            <span className={`badge status-${hike.status.replace(' ', '-')}`}>{hike.status}</span>
          )}
        </div>

        {/* Hover overlay */}
        <div className="hc-overlay">
          {diffBar  && <StatBar icon="💪" label={t(`difficulty.${hike.difficulty}`)} pct={diffBar.pct} color={diffBar.color} />}
          {distPct  != null && <StatBar icon="📏" label={`${hike.distance} km`} pct={distPct} color="#818cf8" />}
          {timePct  != null && <StatBar icon="⏱" label={`${hike.time} h`} pct={timePct} color="#38bdf8" />}
          {upPct    != null && <StatBar icon="↑" label={`${hike.up} m`} pct={upPct} color="#fb923c" />}
          <div className="hc-overlay-chips">
            {hike.familyFriendly && <span className="hc-chip hc-chip-green">👨‍👩‍👧 {t('hike.familyFriendly')}</span>}
            {hike.bearRisk && <span className="hc-chip" style={{ background: BEAR_COLOR[hike.bearRisk] + '33', color: BEAR_COLOR[hike.bearRisk], border: `1px solid ${BEAR_COLOR[hike.bearRisk]}55` }}>🐻 {hike.bearRisk}</span>}
          </div>
        </div>
      </div>

      <div className="hike-card-body">
        <div className="hike-card-location">
          {hike.mountains && <span className="hike-card-tag">{hike.mountains}</span>}
          {hike.zone      && <span className="hike-card-tag hike-card-tag-zone">{hike.zone}</span>}
        </div>

        <h3 className="hike-card-title">{hike.name}</h3>

        <div className="hike-card-stats">
          {hike.distance  && <span className="hike-card-stat"><span className="hike-stat-icon">📏</span>{hike.distance} km</span>}
          {hike.time      && <span className="hike-card-stat"><span className="hike-stat-icon">⏱</span>{hike.time} h</span>}
          {hike.up        && <span className="hike-card-stat"><span className="hike-stat-icon">↑</span>{hike.up} m</span>}
          {distance != null && (
            <span className="hike-card-stat hike-card-stat-distance">
              <span className="hike-stat-icon">📍</span>{distance < 1 ? `${(distance * 1000).toFixed(0)} m` : `${distance.toFixed(0)} km`} {t('card.away')}
            </span>
          )}
        </div>

        {hike.difficulty && (
          <div className="hike-card-footer">
            <span className={`badge diff-${hike.difficulty}`}>{t(`difficulty.${hike.difficulty}`)}</span>
            {hike.tip && <span className="hike-card-tip">{t(`tripType.${hike.tip}`)}</span>}
          </div>
        )}
      </div>
    </article>
  );
}
