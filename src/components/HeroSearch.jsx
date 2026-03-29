import React from 'react';

export default function HeroSearch({ filters, onChange, hikes }) {
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
        <p className="hero-eyebrow">🏔️ Hiking High</p>
        <h1 className="hero-title">Where would you like to hike?</h1>

        <div className="hero-search-box">
          <svg className="hero-search-icon" width="20" height="20" fill="none" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            className="hero-search-input"
            type="search"
            placeholder="Search by name, mountains, zone…"
            value={filters.q}
            onChange={set('q')}
          />
        </div>

        <div className="hero-filters">
          <select value={filters.status}     onChange={set('status')}     className="hero-select">
            <option value="">All statuses</option>
            <option>Done</option>
            <option>In progress</option>
            <option>Not started</option>
          </select>
          <select value={filters.difficulty} onChange={set('difficulty')} className="hero-select">
            <option value="">All difficulties</option>
            <option>easy</option>
            <option>medium</option>
          </select>
          <select value={filters.mountains}  onChange={set('mountains')}  className="hero-select">
            <option value="">All mountains</option>
            {mountains.map((m) => <option key={m}>{m}</option>)}
          </select>
          <select value={filters.zone}       onChange={set('zone')}       className="hero-select">
            <option value="">All zones</option>
            {zones.map((z) => <option key={z}>{z}</option>)}
          </select>
          <select value={filters.tip}        onChange={set('tip')}        className="hero-select">
            <option value="">All trip types</option>
            <option>Dus-intors</option>
            <option>Dus</option>
          </select>
        </div>

        <div className="hero-stats">
          <span><strong>{hikes.length}</strong> trails</span>
          <span className="hero-stat-dot">·</span>
          <span><strong>{done}</strong> completed</span>
          <span className="hero-stat-dot">·</span>
          <span><strong>{kmHiked}</strong> km hiked</span>
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
