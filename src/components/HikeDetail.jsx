import { useState, useEffect, useCallback } from 'react';
import { marked } from 'marked';
import { fetchHike } from '../api/hikes.js';
import WeatherForecast from './WeatherForecast.jsx';
import SiteFooter from './SiteFooter.jsx';
import t from '../i18n.js';
import useLang from '../hooks/useLang.js';
import { isUserLoggedIn, getSaved, saveItem, unsaveItem } from '../api/users.js';

const SITE_BASE_URL = 'https://hiking-high.netlify.app';

function setMeta(nameOrProp, content, isProperty = false) {
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${nameOrProp}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, nameOrProp);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function toAbsoluteUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${SITE_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
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

function useSunset(lat, lng) {
  const [info, setInfo] = useState(null);
  useEffect(() => {
    if (lat == null || lng == null) return;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=sunset&timezone=auto&forecast_days=1`)
      .then(r => r.json())
      .then(data => {
        const sunsetStr = data?.daily?.sunset?.[0];
        if (!sunsetStr) return;
        const sunsetTime = new Date(sunsetStr);
        const now = new Date();
        const diffMs = sunsetTime - now;
        if (diffMs <= 0) { setInfo({ passed: true, time: sunsetStr.slice(11, 16) }); return; }
        const totalMin = Math.round(diffMs / 60000);
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        setInfo({ h, m, time: sunsetStr.slice(11, 16), passed: false });
      })
      .catch(() => {});
  }, [lat, lng]);
  return info;
}

export default function HikeDetail({ id }) {
  useLang();
  const [hike, setHike]         = useState(null);
  const [error, setError]       = useState('');
  const [lightbox, setLightbox] = useState(null);
  const [saved, setSaved]       = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

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

  useEffect(() => {
    if (!isUserLoggedIn()) return;
    getSaved().then(data => {
      setSaved(data.hikes.some(h => h._id === id || h.slug === id));
    }).catch(() => {});
  }, [id]);

  async function toggleSave() {
    if (!isUserLoggedIn()) { window.location.href = '/'; return; }
    setSaveLoading(true);
    try {
      const hikeId = hike?._id || id;
      if (saved) {
        await unsaveItem('hike', hikeId);
        setSaved(false);
      } else {
        await saveItem('hike', hikeId);
        setSaved(true);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSaveLoading(false);
    }
  }

  useEffect(() => {
    if (!hike) return;
    const image = hike.mainPhoto || hike.photos?.[0] || hike.imageUrl || '';
    const rawDesc = hike.description || '';
    const plainDesc = rawDesc.replace(/[#*_`[\]()>!\-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 160);
    const desc = plainDesc || `Traseu ${hike.name}${hike.mountains ? ` în ${hike.mountains}` : ''}.`;
    const title = `${hike.name} — Hike'n'Seek`;

    const slug = hike.slug || hike._id;
    const canonicalUrl = `${SITE_BASE_URL}/hike/${slug}`;
    const absImage = toAbsoluteUrl(image);

    document.title = title;
    setMeta('description', desc);
    const autoKeywords = [
      hike.name,
      hike.mountains,
      hike.zone,
      hike.difficulty === 'easy' ? 'easy hike' : hike.difficulty === 'medium' ? 'moderate hike' : null,
      hike.familyFriendly ? 'family friendly hiking' : null,
      hike.familyFriendly ? 'hiking with kids Romania' : null,
      'hiking trails Romania',
      'trasee montane România',
      'Hike\'n\'Seek',
    ].filter(Boolean);
    const allKeywords = [...new Set([...(hike.keywords || []), ...autoKeywords])];
    setMeta('keywords', allKeywords.join(', '));
    setCanonical(canonicalUrl);
    setMeta('og:title', title, true);
    setMeta('og:description', desc, true);
    setMeta('og:url', canonicalUrl, true);
    setMeta('og:type', 'article', true);
    if (absImage) setMeta('og:image', absImage, true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', desc);
    if (absImage) setMeta('twitter:image', absImage);

    // JSON-LD — TouristAttraction
    const amenities = [];
    if (hike.hasBathrooms)    amenities.push({ '@type': 'LocationFeatureSpecification', name: 'Bathroom', value: true });
    if (hike.hasPicknicArea)  amenities.push({ '@type': 'LocationFeatureSpecification', name: 'Picnic area', value: true });
    if (hike.hasRestAreas)    amenities.push({ '@type': 'LocationFeatureSpecification', name: 'Rest area', value: true });
    if (hike.safeWaterSource) amenities.push({ '@type': 'LocationFeatureSpecification', name: 'Drinking water', value: true });
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': ['TouristAttraction', 'Place'],
      name: hike.name,
      description: desc,
      ...(absImage && { image: absImage }),
      url: canonicalUrl,
      isAccessibleForFree: true,
      ...(hike.mountains && {
        address: { '@type': 'PostalAddress', addressRegion: hike.mountains, addressCountry: 'RO' },
      }),
      ...(hike.startLat && hike.startLng && {
        geo: { '@type': 'GeoCoordinates', latitude: hike.startLat, longitude: hike.startLng },
      }),
      ...(amenities.length && { amenityFeature: amenities }),
      ...(hike.familyFriendly && {
        audience: {
          '@type': 'PeopleAudience',
          suggestedMinAge: hike.minAgeRecommended ?? 0,
          audienceType: 'Families with children',
        },
      }),
      additionalProperty: [
        ...(hike.distance  ? [{ '@type': 'PropertyValue', name: 'Distance',       value: `${hike.distance} km` }] : []),
        ...(hike.time      ? [{ '@type': 'PropertyValue', name: 'Duration',        value: `PT${Math.floor(hike.time)}H${Math.round((hike.time % 1) * 60)}M` }] : []),
        ...(hike.up        ? [{ '@type': 'PropertyValue', name: 'Elevation gain',  value: `${hike.up} m` }] : []),
        ...(hike.difficulty ? [{ '@type': 'PropertyValue', name: 'Difficulty',     value: hike.difficulty === 'easy' ? 'Easy' : 'Moderate' }] : []),
      ],
    };
    let ldScript = document.getElementById('hike-jsonld');
    if (!ldScript) {
      ldScript = document.createElement('script');
      ldScript.id = 'hike-jsonld';
      ldScript.type = 'application/ld+json';
      document.head.appendChild(ldScript);
    }
    ldScript.textContent = JSON.stringify(jsonLd);

    // JSON-LD — BreadcrumbList
    const breadcrumbLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',   item: SITE_BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Trails', item: `${SITE_BASE_URL}/#trails` },
        { '@type': 'ListItem', position: 3, name: hike.name, item: canonicalUrl },
      ],
    };
    let bcScript = document.getElementById('hike-breadcrumb-jsonld');
    if (!bcScript) {
      bcScript = document.createElement('script');
      bcScript.id = 'hike-breadcrumb-jsonld';
      bcScript.type = 'application/ld+json';
      document.head.appendChild(bcScript);
    }
    bcScript.textContent = JSON.stringify(breadcrumbLd);

    return () => {
      document.title = `Hike'n'Seek — Trasee montane din România`;
      setMeta('description', 'Descoperă cele mai frumoase trasee montane din România.');
      setCanonical(`${SITE_BASE_URL}/`);
      document.getElementById('hike-jsonld')?.remove();
      document.getElementById('hike-breadcrumb-jsonld')?.remove();
    };
  }, [hike]);

  if (error) {
    return (
      <div className="detail-error-wrap">
        <div className="error-banner">⚠ {error}</div>
        <button className="detail-back-btn" onClick={() => window.location.href = '/'}>{t('common.backToError')}</button>
      </div>
    );
  }

  const sunset = useSunset(hike?.startLat, hike?.startLng);

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
            <div className="detail-hero-title-row">
              <h1 className="detail-hero-title">{hike.name}</h1>
              {isUserLoggedIn() && (
                <button
                  className={`detail-save-btn${saved ? ' detail-save-btn-saved' : ''}`}
                  onClick={toggleSave}
                  disabled={saveLoading}
                  title={saved ? t('save.unsave') : t('save.save')}
                >
                  {saved ? '🔖' : '🔖'} {saved ? t('save.saved') : t('save.save')}
                </button>
              )}
              {hike.trailMarkers && hike.trailMarkers.length > 0 && (
                <div className="detail-hero-markers">
                  {hike.trailMarkers.map((id) => (
                    <img key={id} src={`/hiking_markers/${id}.svg`} alt={id} title={id.replace('_', ' ')} className="detail-hero-marker-img" />
                  ))}
                </div>
              )}
            </div>
            <div className="detail-hero-badges">
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
          <img src={lightbox} alt="" className="cave-lightbox-img" onClick={(e) => e.stopPropagation()} />
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
          <StatItem icon="📏" value={hike.distance ? `${hike.distance} km` : null} label={t('stat.distance')} />
          <StatItem icon="⏱"  value={hike.time     ? `${hike.time} h`     : null} label={t('stat.duration')} />
          <StatItem icon="↑"  value={hike.up        ? `${hike.up} m`       : null} label={t('stat.elevationGain')} />
          <StatItem icon="🔄" value={hike.tip ? t(`tripType.${hike.tip}`) : null} label={t('stat.tripType')} />
          {sunset && (
            <StatItem
              icon="🌅"
              value={sunset.passed ? sunset.time : `${sunset.h}h ${sunset.m}min`}
              label={sunset.passed ? t('stat.sunsetPassed') : t('stat.untilSunset')}
            />
          )}
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
                    <span className="detail-chip">{'⭐'.repeat(hike.kidEngagementScore)}{'☆'.repeat(5 - hike.kidEngagementScore)} {t('hike.kidScore')}</span>
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

        {hike.pois && hike.pois.length > 0 && (
          <div className="detail-caves-section">
            <div className="detail-caves-title">{t('hike.nearbyCaves')}</div>
            <div className="detail-caves-list">
              {hike.pois.map((c) => (
                <a key={c._id} href={`/poi/${c.slug || c._id}`} className="detail-cave-card">
                  {c.mainPhoto && (
                    <div className="detail-cave-thumb">
                      <img src={c.mainPhoto} alt={c.name} />
                    </div>
                  )}
                  <div className="detail-cave-body">
                    <div className="detail-cave-top">
                      <span className="detail-cave-name">{c.name}</span>
                      {c.poiType && <span className="detail-cave-icon" style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.7 }}>{c.poiType}</span>}
                    </div>
                    {(c.mountains || c.zone) && (
                      <div className="detail-cave-mountains">{[c.mountains, c.zone].filter(Boolean).join(' · ')}</div>
                    )}
                    <div className="detail-cave-stats">
                      {c.address && <span>{c.address}</span>}
                      {c.development != null && <span>↔ {c.development} m</span>}
                      {c.verticalExtent != null && <span>↕ {c.verticalExtent} m</span>}
                      {c.altitude != null && <span>⛰ {c.altitude} m</span>}
                      {c.rockType && <span>{c.rockType}</span>}
                    </div>
                    {c.notes && <div className="detail-cave-mountains" style={{ fontStyle: 'italic' }}>{c.notes}</div>}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
