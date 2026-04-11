import { useState } from 'react';
import InfoPage from './InfoPage.jsx';

const MOUNTAINS = [
  'Bucegi', 'Fagaras', 'Piatra Craiului', 'Retezat', 'Apuseni', 'Ceahlău',
  'Rarău', 'Semenic', 'Ciucaș', 'Leaota', 'Trascău', 'Bihor', 'Vlădeasa',
  'Cozia', 'Parâng', 'Cindrel', 'Lotrului', 'Iezer-Păpușa', 'Căpățânii', 'Șureanu',
];

const EMPTY = {
  trailName: '',
  mountains: '',
  startLocation: '',
  approximateDistance: '',
  approximateTime: '',
  difficulty: '',
  familyFriendly: false,
  minAge: '',
  description: '',
  contactEmail: '',
};

export default function SubmitTrailPage() {
  const [form, setForm] = useState(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.trailName.trim()) { setError('Please enter the trail name.'); return; }
    if (!form.description.trim()) { setError('Please add a brief trail description.'); return; }
    if (!form.contactEmail.trim() || !form.contactEmail.includes('@')) {
      setError('Please enter a valid contact email.'); return;
    }
    setError('');
    // In production this would POST to an API endpoint.
    // For now we show a thank-you state.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <InfoPage icon="✅" title="Trail Submitted" subtitle="Thank you for contributing to Hike'n'Seek">
        <div className="submit-success">
          <div className="submit-success-icon">🎉</div>
          <h2>We received your trail!</h2>
          <p>
            Our team will review <strong>{form.trailName}</strong> and add it to the database
            once verified. We may reach out to you at <strong>{form.contactEmail}</strong> if
            we have questions.
          </p>
          <p>Thank you for helping other families discover Romania's mountains.</p>
          <div className="submit-success-actions">
            <a href="/" className="info-btn info-btn--primary">Browse Trails</a>
            <button className="info-btn info-btn--secondary" onClick={() => { setForm(EMPTY); setSubmitted(false); }}>
              Submit Another
            </button>
          </div>
        </div>
      </InfoPage>
    );
  }

  return (
    <InfoPage
      icon="📝"
      title="Submit a Trail"
      subtitle="Know a great family hiking route that's not on Hike'n'Seek? Tell us about it."
    >
      <div className="info-intro">
        <p>
          We review every submission and hike the trail ourselves (or verify it through our
          community) before adding it. Please provide as much detail as you can — the more
          information, the faster we can publish it.
        </p>
      </div>

      {error && <div className="info-form-error">{error}</div>}

      <form className="info-form" onSubmit={handleSubmit}>
        <div className="info-form-grid">
          <div className="info-form-group info-form-group--full">
            <label>Trail Name <span className="required">*</span></label>
            <input
              type="text"
              value={form.trailName}
              onChange={(e) => set('trailName', e.target.value)}
              placeholder="e.g. Cascade Urlatoarea from Bușteni"
            />
          </div>

          <div className="info-form-group">
            <label>Mountain Range</label>
            <input
              list="mountains-list"
              value={form.mountains}
              onChange={(e) => set('mountains', e.target.value)}
              placeholder="e.g. Bucegi"
            />
            <datalist id="mountains-list">
              {MOUNTAINS.map((m) => <option key={m} value={m} />)}
            </datalist>
          </div>

          <div className="info-form-group">
            <label>Starting Location / Village</label>
            <input
              type="text"
              value={form.startLocation}
              onChange={(e) => set('startLocation', e.target.value)}
              placeholder="e.g. Bușteni town centre"
            />
          </div>

          <div className="info-form-group">
            <label>Approximate Distance (km)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.approximateDistance}
              onChange={(e) => set('approximateDistance', e.target.value)}
              placeholder="e.g. 8.5"
            />
          </div>

          <div className="info-form-group">
            <label>Approximate Time (hours)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={form.approximateTime}
              onChange={(e) => set('approximateTime', e.target.value)}
              placeholder="e.g. 3.5"
            />
          </div>

          <div className="info-form-group">
            <label>Difficulty</label>
            <select value={form.difficulty} onChange={(e) => set('difficulty', e.target.value)}>
              <option value="">Not sure</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="info-form-group">
            <label>Minimum Age (years)</label>
            <input
              type="number"
              min="0"
              max="18"
              value={form.minAge}
              onChange={(e) => set('minAge', e.target.value)}
              placeholder="e.g. 4"
            />
          </div>

          <div className="info-form-group info-form-group--full">
            <label className="info-checkbox-label">
              <input
                type="checkbox"
                checked={form.familyFriendly}
                onChange={(e) => set('familyFriendly', e.target.checked)}
              />
              This trail is family-friendly (suitable for children)
            </label>
          </div>

          <div className="info-form-group info-form-group--full">
            <label>Trail Description <span className="required">*</span></label>
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Describe the route: starting point, key waypoints, terrain type, highlights, any hazards or notes for families…"
            />
          </div>

          <div className="info-form-group info-form-group--full">
            <label>Your Email <span className="required">*</span></label>
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => set('contactEmail', e.target.value)}
              placeholder="We'll contact you if we have questions"
            />
          </div>
        </div>

        <button type="submit" className="info-btn info-btn--primary info-btn--lg">
          Submit Trail
        </button>
      </form>
    </InfoPage>
  );
}
