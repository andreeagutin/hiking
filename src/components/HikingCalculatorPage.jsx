import { useState } from 'react';
import InfoPage from './InfoPage.jsx';

function formatTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function getChildFactor(age) {
  if (age <= 4) return 2.5;
  if (age >= 14) return 1.1;
  const points = [[4, 2.5], [6, 2.0], [8, 1.7], [10, 1.4], [12, 1.2], [14, 1.1]];
  for (let i = 0; i < points.length - 1; i++) {
    const [a1, f1] = points[i];
    const [a2, f2] = points[i + 1];
    if (age >= a1 && age <= a2) return f1 + (f2 - f1) * ((age - a1) / (a2 - a1));
  }
  return 1.1;
}

function getMaxKm(age) {
  if (age <= 4) return 3;
  if (age <= 6) return 5;
  if (age <= 8) return 8;
  if (age <= 10) return 10;
  if (age <= 12) return 13;
  return 18;
}

function getDifficulty(distNum, elevNum) {
  if (elevNum > 800 || distNum > 20) return { label: 'Dificil', cls: 'calc-diff--hard'   };
  if (elevNum > 400 || distNum > 12) return { label: 'Moderat', cls: 'calc-diff--medium' };
  return                                     { label: 'Ușor',   cls: 'calc-diff--easy'   };
}

const PAUSE_OPTIONS = [
  { label: 'Ritm rapid', factor: 1.15, desc: 'Pauze scurte' },
  { label: 'Moderat',    factor: 1.35, desc: 'Pauze regulate' },
  { label: 'Relaxat',    factor: 1.55, desc: 'Picnic & poze' },
];

export default function HikingCalculatorPage() {
  const [distance,   setDistance]   = useState('');
  const [elevation,  setElevation]  = useState('');
  const [isCircuit,  setIsCircuit]  = useState(false);
  const [pauseLevel, setPauseLevel] = useState(1);
  const [childAge,   setChildAge]   = useState('');

  const distNum  = parseFloat(distance)  || 0;
  const elevNum  = parseFloat(elevation) || 0;
  const hasInput = distNum > 0;

  const distMinutes  = (distNum / 5) * 60;
  const upMinutes    = (elevNum / 600) * 60;
  const downMinutes  = isCircuit ? (elevNum / 300) * 60 * 0.4 : 0;
  const totalMinutes = distMinutes + upMinutes + downMinutes;
  const withPauses   = totalMinutes * PAUSE_OPTIONS[pauseLevel].factor;

  const childAgeNum     = parseInt(childAge) || 0;
  const childFactor     = getChildFactor(childAgeNum);
  const childMoving     = totalMinutes * childFactor;
  const childWithPauses = childMoving * PAUSE_OPTIONS[pauseLevel].factor;

  const diff = getDifficulty(distNum, elevNum);

  return (
    <InfoPage
      icon="⏱"
      title="Calculator Drumeție"
      subtitle="Estimează durata unui traseu folosind Formula Naismith"
      path="/hiking-calculator"
    >
      <div className="calc-layout">

        {/* ── Inputs ── */}
        <div className="calc-inputs-col">
          <div className="calc-section-label">Date traseu</div>

          <div className="calc-field">
            <label className="calc-label">Distanță (km)</label>
            <input
              className="calc-input"
              type="number"
              value={distance}
              onChange={e => setDistance(e.target.value)}
              placeholder="ex: 9.2"
            />
          </div>

          <div className="calc-field">
            <label className="calc-label">Elevație urcare (m)</label>
            <input
              className="calc-input"
              type="number"
              value={elevation}
              onChange={e => setElevation(e.target.value)}
              placeholder="ex: 346"
            />
          </div>

          {/* Circuit toggle */}
          <div className="calc-field">
            <label className="calc-label">Tip traseu</label>
            <button
              type="button"
              className={`calc-toggle ${isCircuit ? 'calc-toggle--on' : ''}`}
              onClick={() => setIsCircuit(c => !c)}
            >
              <span className="calc-toggle-track">
                <span className="calc-toggle-thumb" />
              </span>
              Circuit (include coborâre)
            </button>
          </div>

          {/* Pause level */}
          <div className="calc-field">
            <label className="calc-label">Ritm &amp; pauze</label>
            <div className="calc-pause-group">
              {PAUSE_OPTIONS.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  className={`calc-pause-btn ${pauseLevel === i ? 'calc-pause-btn--active' : ''}`}
                  onClick={() => setPauseLevel(i)}
                >
                  <span className="calc-pause-name">{opt.label}</span>
                  <span className="calc-pause-desc">×{opt.factor.toFixed(2)} · {opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Child age */}
          <div className="calc-field">
            <label className="calc-label">Vârsta copilului (ani) <span className="calc-optional">— opțional</span></label>
            <input
              className="calc-input"
              type="number"
              value={childAge}
              onChange={e => setChildAge(e.target.value)}
              placeholder="ex: 6"
              min="3"
              max="16"
            />
          </div>
        </div>

        {/* ── Results ── */}
        <div className="calc-results-col">
          {!hasInput ? (
            <div className="calc-empty">
              <span className="calc-empty-icon">🏔️</span>
              <p>Introdu distanța pentru a vedea estimarea</p>
              <p className="calc-formula-note">Formula Naismith: 5 km/h + 10 min per 100m urcare</p>
            </div>
          ) : (
            <div className="calc-results-anim">

              {/* Main result card */}
              <div className="calc-result-card calc-result-card--main">
                <div className="calc-result-top">
                  <div>
                    <div className="calc-section-label">Timp estimat adult <span className="calc-pause-tag">{PAUSE_OPTIONS[pauseLevel].desc}</span></div>
                    <div className="calc-time-big">{formatTime(withPauses)}</div>
                    <div className="calc-time-pauses">mers: {formatTime(totalMinutes)}</div>
                  </div>
                  <span className={`calc-difficulty-badge ${diff.cls}`}>{diff.label}</span>
                </div>
              </div>

              {/* Breakdown */}
              <div className="calc-result-card">
                <div className="calc-section-label">Detalii calcul</div>
                <div className="calc-breakdown">
                  <div className="calc-breakdown-row">
                    <span>Distanță {distNum} km ÷ 5</span>
                    <span>{formatTime(distMinutes)}</span>
                  </div>
                  <div className="calc-breakdown-row">
                    <span>Urcare {elevNum} m ÷ 600</span>
                    <span>{formatTime(upMinutes)}</span>
                  </div>
                  {isCircuit && (
                    <div className="calc-breakdown-row">
                      <span>Coborâre {elevNum} m</span>
                      <span>{formatTime(downMinutes)}</span>
                    </div>
                  )}
                  <div className="calc-breakdown-row calc-breakdown-row--total">
                    <span>Total mers</span>
                    <span>{formatTime(totalMinutes)}</span>
                  </div>
                </div>
              </div>

              {/* Child */}
              {childAgeNum >= 3 && childAgeNum <= 16 && (
                <div className="calc-result-card">
                  <div className="calc-section-label">Estimare copil · {childAgeNum} ani</div>
                  <div className="calc-child-row">
                    <div>
                      <div className="calc-time-child">{formatTime(childWithPauses)}</div>
                      <div className="calc-time-pauses">
                        mers: {formatTime(childMoving)} · factor ×{childFactor.toFixed(1)}
                      </div>
                    </div>
                    <div className="calc-child-max">
                      <span className="calc-child-max-label">max recomandat</span>
                      <span className="calc-child-max-val">{getMaxKm(childAgeNum)} km/zi</span>
                    </div>
                  </div>
                  {distNum > getMaxKm(childAgeNum) && (
                    <div className="calc-warning">
                      ⚠ Distanța de {distNum} km depășește limita recomandată de {getMaxKm(childAgeNum)} km pentru {childAgeNum} ani
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>

      </div>

      <p className="calc-naismith-note">
        Naismith's Rule (1892) — regulă empirică pentru estimarea timpului de mers pe munte. Nu ține cont de oboseală, teren dificil sau condiții meteo.
      </p>
    </InfoPage>
  );
}
