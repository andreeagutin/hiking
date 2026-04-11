import { useState } from 'react';
import t, { setLang } from '../i18n.js';
import useLang from '../hooks/useLang.js';
import { askAI } from '../api/aiSearch.js';

// ── Location widget ────────────────────────────────────────────────────────────
async function geocodeCity(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  const data = await res.json();
  if (!data.length) throw new Error('Location not found');
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), label: data[0].display_name.split(',')[0] };
}

function LocationWidget({ userLocation, onLocationChange }) {
  useLang();
  const [cityInput, setCityInput] = useState('');
  const [mode, setMode]           = useState('idle');
  const [errMsg, setErrMsg]       = useState('');

  function requestGeo() {
    if (!navigator.geolocation) { setMode('input'); return; }
    setMode('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocationChange({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: t('location.yourLocation') });
        setMode('idle');
      },
      () => { setMode('input'); }
    );
  }

  async function handleCitySubmit(e) {
    e.preventDefault();
    if (!cityInput.trim()) return;
    setMode('loading');
    setErrMsg('');
    try {
      const loc = await geocodeCity(cityInput.trim());
      onLocationChange(loc);
      setCityInput('');
      setMode('idle');
    } catch {
      setErrMsg(t('location.notFound'));
      setMode('input');
    }
  }

  if (userLocation) {
    return (
      <div className="hero-location-pill">
        <span className="hero-location-icon">📍</span>
        <span className="hero-location-label">{userLocation.label}</span>
        <button className="hero-location-clear" onClick={() => { onLocationChange(null); setMode('idle'); }} title="Clear location">×</button>
      </div>
    );
  }

  if (mode === 'loading') {
    return <div className="hero-location-pill hero-location-loading">{t('location.locating')}</div>;
  }

  if (mode === 'input') {
    return (
      <form className="hero-location-form" onSubmit={handleCitySubmit}>
        <input
          className="hero-location-input"
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
          placeholder={t('location.cityPlaceholder')}
          autoFocus
        />
        <button className="hero-location-submit" type="submit">{t('location.go')}</button>
        <button className="hero-location-cancel" type="button" onClick={() => setMode('idle')}>×</button>
        {errMsg && <span className="hero-location-err">{errMsg}</span>}
      </form>
    );
  }

  return (
    <div className="hero-location-prompt">
      <button className="hero-location-btn" onClick={requestGeo}>{t('location.showDistances')}</button>
      <button className="hero-location-btn-alt" onClick={() => setMode('input')}>{t('location.enterCity')}</button>
    </div>
  );
}

// ── AI Search ──────────────────────────────────────────────────────────────────
function AiSearch({ hikes, userLocation, aiExplanation, onAiSearch, onAiClear }) {
  useLang();
  const [query, setQuery]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const mountains = [...new Set(hikes.map((h) => h.mountains).filter(Boolean))].sort();
  const zones     = [...new Set(hikes.map((h) => h.zone).filter(Boolean))].sort();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { filters, explanation } = await askAI(query.trim(), mountains, zones);
      onAiSearch(filters, explanation);
      setQuery('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="hero-ai-search">
      {aiExplanation ? (
        <div className="hero-ai-active">
          <span className="hero-ai-sparkle">✨</span>
          <span className="hero-ai-explanation">{aiExplanation}</span>
          {!userLocation && <span className="hero-ai-note">{t('hero.aiDriveNote')}</span>}
          <button className="hero-ai-clear" onClick={onAiClear} title={t('hero.aiClear')}>×</button>
        </div>
      ) : (
        <form className="hero-ai-form" onSubmit={handleSubmit}>
          <div className="hero-ai-input-wrap">
            <svg className="hero-ai-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <input
              className="hero-ai-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('hero.aiPlaceholder')}
              disabled={loading}
            />
          </div>
          <button className="hero-ai-btn" type="submit" disabled={loading || !query.trim()}>
            {loading ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            )}
            {loading ? t('hero.aiLoading') : t('hero.aiButton')}
          </button>
        </form>
      )}
      {error && <div className="hero-ai-error">{error}</div>}
    </div>
  );
}

// ── Site nav ───────────────────────────────────────────────────────────────────
function SiteNav() {
  const lang = useLang();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="site-nav">
      <div className="site-nav-inner">
        <a href="/" className="site-nav-logo">
          <img src="/hikenSeek_owl_logo_full.svg" alt="Hike'n'Seek" className="site-nav-logo-img" />
        </a>

        <div className="site-nav-links">
          <a href="#trails" className="site-nav-link">{t('nav.trails')}</a>
          <a href="/stats" className="site-nav-link">{t('hero.viewStats')}</a>
        </div>

        <div className="site-nav-actions">
          <div className="lang-switcher">
            <button className={`lang-btn${lang === 'ro' ? ' active' : ''}`} onClick={() => setLang('ro')}>RO</button>
            <span className="lang-sep">|</span>
            <button className={`lang-btn${lang === 'en' ? ' active' : ''}`} onClick={() => setLang('en')}>EN</button>
          </div>
          <a href="/stats" className="site-nav-stats-btn">{t('hero.viewStats')}</a>
        </div>

        <button className="site-nav-burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div className="site-nav-mobile">
          <a href="#trails" className="site-nav-mobile-link" onClick={() => setMenuOpen(false)}>{t('nav.trails')}</a>
          <a href="/stats" className="site-nav-mobile-link" onClick={() => setMenuOpen(false)}>{t('hero.viewStats')}</a>
          <div className="site-nav-mobile-lang">
            <button className={`lang-btn${lang === 'ro' ? ' active' : ''}`} onClick={() => { setLang('ro'); setMenuOpen(false); }}>RO</button>
            <span className="lang-sep">|</span>
            <button className={`lang-btn${lang === 'en' ? ' active' : ''}`} onClick={() => { setLang('en'); setMenuOpen(false); }}>EN</button>
          </div>
        </div>
      )}
    </nav>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────────
export default function HeroSearch({ hikes, userLocation, onLocationChange, aiExplanation, onAiSearch, onAiClear }) {
  useLang();
  const kmHiked     = hikes.reduce((s, h) => s + (h.distance || 0), 0).toFixed(0);
  const familyCount = hikes.filter((h) => h.familyFriendly).length;
  const regionCount = new Set(hikes.map((h) => h.mountains).filter(Boolean)).size;

  return (
    <div className="hero">
      <img src="/hero-family-hike.jpg" alt="" className="hero-bg" aria-hidden="true" />
      <SiteNav />

      <div className="hero-inner">
        <span className="hero-badge">{t('hero.adventureBadge')}</span>
        <h1 className="hero-title">{t('hero.title')}</h1>
        <p className="hero-subtitle">{t('hero.subtitle')}</p>

        <AiSearch
          hikes={hikes}
          userLocation={userLocation}
          aiExplanation={aiExplanation}
          onAiSearch={onAiSearch}
          onAiClear={onAiClear}
        />

        <LocationWidget userLocation={userLocation} onLocationChange={onLocationChange} />
      </div>

      <div className="hero-stats-bar">
        <div className="hero-stats-card">
          <div className="hero-stat-item">
            <span className="hero-stat-value">{hikes.length}</span>
            <span className="hero-stat-label">{t('hero.trails')}</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-value">{kmHiked} km</span>
            <span className="hero-stat-label">{t('hero.kmHiked')}</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-value">{familyCount}+</span>
            <span className="hero-stat-label">{t('hero.kidFriendly')}</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-value">{regionCount}</span>
            <span className="hero-stat-label">{t('hero.regions')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
