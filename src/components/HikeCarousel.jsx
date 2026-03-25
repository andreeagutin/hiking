import { useState, useEffect, useCallback } from 'react';

const GRADIENTS = [
  'linear-gradient(135deg, #0d2318 0%, #2d6a4f 100%)',
  'linear-gradient(135deg, #1a3d2b 0%, #40916c 100%)',
  'linear-gradient(135deg, #245235 0%, #74c69d 60%, #40916c 100%)',
  'linear-gradient(135deg, #0d2318 0%, #245235 50%, #52b788 100%)',
  'linear-gradient(135deg, #1a3d2b 0%, #5c3d2e 100%)',
  'linear-gradient(135deg, #0d2318 0%, #1d4ed8 100%)',
];

export default function HikeCarousel({ hikes }) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const featured = hikes.filter((h) => h.imageUrl).slice(0, 8);

  const goTo = useCallback((idx) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(idx);
    setTimeout(() => setAnimating(false), 400);
  }, [animating]);

  const prev = () => goTo((current - 1 + featured.length) % featured.length);
  const next = () => goTo((current + 1) % featured.length);

  useEffect(() => {
    if (featured.length === 0) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [current, featured.length]);

  if (featured.length === 0) return null;

  const hike = featured[current];
  const gradient = GRADIENTS[current % GRADIENTS.length];

  return (
    <div className="carousel-section">
      <div className="carousel-header">
        <span className="carousel-label">Completed trails</span>
      </div>

      <div className="carousel-track">
        {/* Side previews */}
        {featured.length > 1 && (
          <div
            className="carousel-side left"
            style={{ background: GRADIENTS[(current - 1 + featured.length) % featured.length] }}
            onClick={prev}
          >
            <span className="carousel-side-name">
              {featured[(current - 1 + featured.length) % featured.length].name}
            </span>
          </div>
        )}

        {/* Main card */}
        <div
          className={`carousel-card ${animating ? 'animating' : ''}`}
          style={{ background: gradient }}
        >
          {hike.imageUrl ? (
            <img className="carousel-img" src={hike.imageUrl} alt={hike.name} />
          ) : (
            <div className="carousel-placeholder">
              <span className="carousel-placeholder-icon">🏔️</span>
              <span className="carousel-placeholder-text">No photo yet</span>
            </div>
          )}

          <div className="carousel-overlay">
            <div className="carousel-meta">
              {hike.difficulty && (
                <span className={`badge diff-${hike.difficulty} carousel-badge`}>{hike.difficulty}</span>
              )}
              {hike.mountains && <span className="carousel-mountain">{hike.mountains}</span>}
            </div>
            <h2 className="carousel-title">{hike.name}</h2>
            <div className="carousel-stats">
              {hike.distance && <span>📏 {hike.distance} km</span>}
              {hike.time && <span>⏱ {hike.time} h</span>}
              {hike.up && <span>⬆ {hike.up} m</span>}
              {hike.completed && <span>✅ {hike.completed}</span>}
            </div>
          </div>
        </div>

        {featured.length > 1 && (
          <div
            className="carousel-side right"
            style={{ background: GRADIENTS[(current + 1) % featured.length] }}
            onClick={next}
          >
            <span className="carousel-side-name">
              {featured[(current + 1) % featured.length].name}
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="carousel-nav">
        <button className="carousel-arrow" onClick={prev}>‹</button>
        <div className="carousel-dots">
          {featured.map((_, i) => (
            <button
              key={i}
              className={`carousel-dot ${i === current ? 'active' : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <button className="carousel-arrow" onClick={next}>›</button>
      </div>
    </div>
  );
}
