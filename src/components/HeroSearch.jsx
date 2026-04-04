import { useState } from 'react';
import t, { setLang } from '../i18n.js';
import useLang from '../hooks/useLang.js';
import { askAI } from '../api/aiSearch.js';

function LangSwitcher() {
  const lang = useLang();
  return (
    <div className="lang-switcher">
      <button className={`lang-btn${lang === 'ro' ? ' active' : ''}`} onClick={() => setLang('ro')}>RO</button>
      <span className="lang-sep">|</span>
      <button className={`lang-btn${lang === 'en' ? ' active' : ''}`} onClick={() => setLang('en')}>EN</button>
    </div>
  );
}

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
  const [mode, setMode]           = useState('idle'); // idle | input | loading | error
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

function AiSearch({ hikes, userLocation, aiExplanation, onAiSearch, onAiClear }) {
  useLang();
  const [query, setQuery]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

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
          <input
            className="hero-ai-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('hero.aiPlaceholder')}
            disabled={loading}
          />
          <button className="hero-ai-btn" type="submit" disabled={loading || !query.trim()}>
            {loading ? t('hero.aiLoading') : t('hero.aiButton')}
          </button>
        </form>
      )}
      {error && <div className="hero-ai-error">{error}</div>}
    </div>
  );
}

export default function HeroSearch({ hikes, userLocation, onLocationChange, aiExplanation, onAiSearch, onAiClear }) {
  useLang();
  const done    = hikes.filter((h) => h.completed).length;
  const kmHiked = hikes
    .filter((h) => h.completed)
    .reduce((s, h) => s + (h.distance || 0), 0)
    .toFixed(0);

  return (
    <div className="hero">
      <div className="hero-inner">
        <div className="hero-top-row">
          <p className="hero-eyebrow"><img src="/logo.svg" alt={t('hero.appName')} style={{height:'2.4rem', verticalAlign:'middle'}} /></p>
          <LangSwitcher />
        </div>
        <h1 className="hero-title">{t('hero.title')}</h1>

        <AiSearch hikes={hikes} userLocation={userLocation} aiExplanation={aiExplanation} onAiSearch={onAiSearch} onAiClear={onAiClear} />

        <LocationWidget userLocation={userLocation} onLocationChange={onLocationChange} />

        <div className="hero-stats">
          <span><strong>{hikes.length}</strong> {t('hero.trails')}</span>
          <span className="hero-stat-dot">·</span>
          <span><strong>{done}</strong> {t('hero.completed')}</span>
          <span className="hero-stat-dot">·</span>
          <span><strong>{kmHiked}</strong> {t('hero.kmHiked')}</span>
          <span className="hero-stat-dot">·</span>
          <a className="hero-stats-link" href="/stats">{t('hero.viewStats')}</a>
        </div>
      </div>

      {/* Mountain silhouette */}
      <div className="hero-silhouette">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,120 L0,80 L120,40 L240,70 L360,20 L480,55 L600,10 L720,45 L840,15 L960,50 L1080,25 L1200,60 L1320,30 L1440,55 L1440,120 Z" fill="var(--bg)"/>
        </svg>
      </div>
    </div>
  );
}
