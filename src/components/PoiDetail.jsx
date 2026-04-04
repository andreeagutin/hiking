import { useState, useEffect, useCallback } from 'react';
import { fetchPoi } from '../api/poi.js';
import { fetchHikes } from '../api/hikes.js';
import WeatherForecast from './WeatherForecast.jsx';
import t from '../i18n.js';
import useLang from '../hooks/useLang.js';

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

export default function PoiDetail({ id }) {
  useLang();
  const [poi, setPoi]               = useState(null);
  const [hikes, setHikes]           = useState([]);
  const [error, setError]           = useState('');
  const [lightboxIdx, setLightboxIdx] = useState(null);

  useEffect(() => {
    fetchPoi(id)
      .then((p) => setPoi(p))
      .catch((e) => setError(e.message));

    fetchHikes()
      .then((all) => setHikes(all.filter((h) =>
        (h.pois || []).some((x) => (x._id || x) === id)
      )))
      .catch(() => {});
  }, [id]);

  const photos = poi?.photos?.length ? poi.photos : (poi?.mainPhoto ? [poi.mainPhoto] : []);

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

  if (!poi) return <div className="detail-loading">{t('common.loading')}</div>;

  const heroImg = poi.mainPhoto || poi.photos?.[0];
  const heroBg = heroImg ? undefined : 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';

  return (
    <div className="detail-page">
      {/* Hero */}
      <div className="detail-hero" style={heroBg ? { background: heroBg } : {}}>
        {heroImg && <img src={heroImg} alt={poi.name} className="detail-hero-img" />}
        <div className="detail-hero-overlay">
          <button className="detail-back-btn" onClick={() => history.back()}>{t('common.back')}</button>
          <div className="detail-hero-content">
            <div className="detail-hero-crumbs">
              {poi.mountains && <span className="detail-crumb">{poi.mountains}</span>}
            </div>
            <h1 className="detail-hero-title">{poi.name}</h1>
            {(poi.poiType || poi.rockType) && (
              <div className="detail-hero-badges">
                {poi.poiType && <span className="badge status-Done">{poi.poiType}</span>}
                {poi.rockType && <span className="badge diff-easy">{poi.rockType}</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="detail-content">

        {/* Stats */}
        <div className="detail-stats-grid">
          <StatCard icon="↔" value={poi.development != null ? `${poi.development} m` : null} label={t('poi.stat.development')} />
          <StatCard icon="↕" value={poi.verticalExtent != null ? `${poi.verticalExtent} m` : null} label={t('poi.stat.verticalExtent')} />
          <StatCard icon="⛰" value={poi.altitude != null ? `${poi.altitude} m` : null} label={t('poi.stat.altitude')} />
          <StatCard icon="🪨" value={poi.rockType || null} label={t('poi.stat.rockType')} />
          <StatCard icon="📍" value={poi.lat != null && poi.lng != null ? `${poi.lat.toFixed(4)}, ${poi.lng.toFixed(4)}` : null} label={t('poi.stat.coordinates')} />
        </div>

        {poi.lat != null && poi.lng != null && (
          <WeatherForecast lat={poi.lat} lng={poi.lng} />
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
                  <img src={url} alt={`${poi.name} ${i + 1}`} />
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
            <div className="detail-restaurants-title">{t('poi.foundOnTrails')}</div>
            <div className="cave-hikes-list">
              {hikes.map((h) => (
                <a key={h._id} href={`/hike/${h.slug || h._id}`} className="cave-hike-public-card">
                  {(h.mainPhoto || h.photos?.[0] || h.imageUrl) && <img src={h.mainPhoto || h.photos?.[0] || h.imageUrl} alt={h.name} className="cave-hike-thumb" />}
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
