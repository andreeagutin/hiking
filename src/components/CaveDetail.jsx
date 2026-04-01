import { useState, useEffect, useCallback } from 'react';
import { fetchCave } from '../api/caves.js';
import { fetchHikes } from '../api/hikes.js';
import WeatherForecast from './WeatherForecast.jsx';
import t from '../i18n.js';

function StatCard({ icon, value, label }) {
  if (value == null || value === '') return null;
  return (
    <div className="detail-stat">
      <span className="detail-stat-icon">{icon}</span>
      <span className="detail-stat-value">{value}</span>
      <span className="detail-stat-label">{label}</span>
    </div>
  );
}

function Lightbox({ photos, index, onClose, onPrev, onNext }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onPrev, onNext]);

  return (
    <div className="cave-lightbox" onClick={onClose}>
      <button className="cave-lightbox-close" onClick={onClose}>✕</button>
      {photos.length > 1 && (
        <button className="cave-lightbox-prev" onClick={(e) => { e.stopPropagation(); onPrev(); }}>‹</button>
      )}
      <img
        src={photos[index]}
        alt=""
        className="cave-lightbox-img"
        onClick={(e) => e.stopPropagation()}
      />
      {photos.length > 1 && (
        <button className="cave-lightbox-next" onClick={(e) => { e.stopPropagation(); onNext(); }}>›</button>
      )}
      <div className="cave-lightbox-counter">{index + 1} / {photos.length}</div>
    </div>
  );
}

export default function CaveDetail({ id }) {
  const [cave, setCave]         = useState(null);
  const [hikes, setHikes]       = useState([]);
  const [error, setError]       = useState('');
  const [lightboxIdx, setLightboxIdx] = useState(null);

  useEffect(() => {
    fetchCave(id)
      .then((c) => setCave(c))
      .catch((e) => setError(e.message));

    fetchHikes()
      .then((all) => setHikes(all.filter((h) =>
        (h.caves || []).some((x) => (x._id || x) === id)
      )))
      .catch(() => {});
  }, [id]);

  const photos = cave?.photos?.length ? cave.photos : (cave?.mainPhoto ? [cave.mainPhoto] : []);

  const openLightbox = useCallback((i) => setLightboxIdx(i), []);
  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const prevPhoto = useCallback(() => setLightboxIdx((i) => (i - 1 + photos.length) % photos.length), [photos.length]);
  const nextPhoto = useCallback(() => setLightboxIdx((i) => (i + 1) % photos.length), [photos.length]);

  if (error) return (
    <div className="detail-error-wrap">
      <div className="error-banner">⚠ {error}</div>
      <button className="detail-back-btn" onClick={() => history.back()}>{t('common.back')}</button>
    </div>
  );

  if (!cave) return <div className="detail-loading">{t('common.loading')}</div>;

  const heroImg = cave.mainPhoto || cave.photos?.[0];
  const heroBg = heroImg ? undefined : 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';

  return (
    <div className="detail-page">
      {/* Hero */}
      <div className="detail-hero" style={heroBg ? { background: heroBg } : {}}>
        {heroImg && <img src={heroImg} alt={cave.name} className="detail-hero-img" />}
        <div className="detail-hero-overlay">
          <button className="detail-back-btn" onClick={() => history.back()}>{t('common.back')}</button>
          <div className="detail-hero-content">
            <div className="detail-hero-crumbs">
              {cave.mountains && <span className="detail-crumb">{cave.mountains}</span>}
            </div>
            <h1 className="detail-hero-title">{cave.name}</h1>
            {cave.rockType && (
              <div className="detail-hero-badges">
                <span className="badge diff-easy">{cave.rockType}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="detail-content">

        {/* Stats */}
        <div className="detail-stats-grid">
          <StatCard icon="↔" value={cave.development != null ? `${cave.development} m` : null} label={t('cave.stat.development')} />
          <StatCard icon="↕" value={cave.verticalExtent != null ? `${cave.verticalExtent} m` : null} label={t('cave.stat.verticalExtent')} />
          <StatCard icon="⛰" value={cave.altitude != null ? `${cave.altitude} m` : null} label={t('cave.stat.altitude')} />
          <StatCard icon="🪨" value={cave.rockType || null} label={t('cave.stat.rockType')} />
          <StatCard icon="📍" value={cave.lat != null && cave.lng != null ? `${cave.lat.toFixed(4)}, ${cave.lng.toFixed(4)}` : null} label={t('cave.stat.coordinates')} />
        </div>

        {cave.lat != null && cave.lng != null && (
          <WeatherForecast lat={cave.lat} lng={cave.lng} />
        )}

        {/* Photo gallery */}
        {photos.length > 0 && (
          <div className="cave-gallery-section">
            <div className="cave-gallery-title">Photos</div>
            <div className={`cave-gallery-grid cave-gallery-grid--${Math.min(photos.length, 3)}`}>
              {photos.map((url, i) => (
                <button
                  key={url}
                  className="cave-gallery-item"
                  onClick={() => openLightbox(i)}
                >
                  <img src={url} alt={`${cave.name} ${i + 1}`} />
                  <div className="cave-gallery-item-overlay">
                    <span>🔍</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hikes */}
        {hikes.length > 0 && (
          <div className="detail-restaurants-section">
            <div className="detail-restaurants-title">{t('cave.foundOnTrails')}</div>
            <div className="cave-hikes-list">
              {hikes.map((h) => (
                <a key={h._id} href={`/hike/${h._id}`} className="cave-hike-public-card">
                  {h.imageUrl && <img src={h.imageUrl} alt={h.name} className="cave-hike-thumb" />}
                  <div className="cave-hike-info">
                    <div className="cave-hike-name">{h.name}</div>
                    <div className="cave-hike-meta">
                      {h.mountains && <span>{h.mountains}</span>}
                      {h.distance && <span>{h.distance} km</span>}
                      {h.time && <span>{h.time} h</span>}
                    </div>
                  </div>
                  <span className="cave-hike-arrow">→</span>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <Lightbox
          photos={photos}
          index={lightboxIdx}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
        />
      )}
    </div>
  );
}
