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

export default function HikeCard({ hike, distance }) {
  useLang();
  const bg = hike.imageUrl ? undefined : cardGradient(hike.name);

  return (
    <article
      className="hike-card"
      onClick={() => { window.location.href = `/hike/${hike._id}`; }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && (window.location.href = `/hike/${hike._id}`)}
    >
      <div className="hike-card-media" style={bg ? { background: bg } : {}}>
        {hike.imageUrl
          ? <img src={hike.imageUrl} alt={hike.name} className="hike-card-img" loading="lazy" />
          : <div className="hike-card-no-img"><span>🏔️</span></div>
        }
        <div className="hike-card-media-top">
          {hike.status && (
            <span className={`badge status-${hike.status.replace(' ', '-')}`}>{hike.status}</span>
          )}
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
