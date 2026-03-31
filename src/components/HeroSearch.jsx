import { useState } from 'react';
import t from '../i18n.js';

async function geocodeCity(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  const data = await res.json();
  if (!data.length) throw new Error('Location not found');
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), label: data[0].display_name.split(',')[0] };
}

function LocationWidget({ userLocation, onLocationChange }) {
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

export default function HeroSearch({ filters, onChange, hikes, userLocation, onLocationChange }) {
  const mountains = [...new Set(hikes.map((h) => h.mountains).filter(Boolean))].sort();
  const zones     = [...new Set(hikes.map((h) => h.zone).filter(Boolean))].sort();

  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  const done    = hikes.filter((h) => h.status === 'Done').length;
  const kmHiked = hikes
    .filter((h) => h.status === 'Done')
    .reduce((s, h) => s + (h.distance || 0), 0)
    .toFixed(0);

  return (
    <div className="hero">
      <div className="hero-inner">
        <p className="hero-eyebrow"><img src="/favicon.svg" alt="" style={{width:'1.1em', height:'1.1em', verticalAlign:'middle', marginRight:'6px'}} />{t('hero.appName')}</p>
        <h1 className="hero-title">{t('hero.title')}</h1>

        <div className="hero-search-box">
          <svg className="hero-search-icon" width="20" height="20" fill="none" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            className="hero-search-input"
            type="search"
            placeholder={t('hero.searchPlaceholder')}
            value={filters.q}
            onChange={set('q')}
          />
        </div>

        <div className="hero-filters">
          <select value={filters.status}     onChange={set('status')}     className="hero-select">
            <option value="">{t('filter.allStatuses')}</option>
            <option value="Done">{t('status.Done')}</option>
            <option value="In progress">{t('status.In progress')}</option>
            <option value="Not started">{t('status.Not started')}</option>
          </select>
          <select value={filters.difficulty} onChange={set('difficulty')} className="hero-select">
            <option value="">{t('filter.allDifficulties')}</option>
            <option value="easy">{t('difficulty.easy')}</option>
            <option value="medium">{t('difficulty.medium')}</option>
          </select>
          <select value={filters.mountains}  onChange={set('mountains')}  className="hero-select">
            <option value="">{t('filter.allMountains')}</option>
            {mountains.map((m) => <option key={m}>{m}</option>)}
          </select>
          <select value={filters.zone}       onChange={set('zone')}       className="hero-select">
            <option value="">{t('filter.allZones')}</option>
            {zones.map((z) => <option key={z}>{z}</option>)}
          </select>
          <select value={filters.tip}        onChange={set('tip')}        className="hero-select">
            <option value="">{t('filter.allTripTypes')}</option>
            <option value="Dus-intors">{t('tripType.Dus-intors')}</option>
            <option value="Dus">{t('tripType.Dus')}</option>
          </select>
        </div>

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
