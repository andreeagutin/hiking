import { useState, useEffect } from 'react';
import InfoPage from './InfoPage.jsx';
import { fetchHikes } from '../api/hikes.js';

const ISSUE_TYPES = [
  { value: 'trail-condition', label: 'Trail condition (washed out, blocked, damaged)' },
  { value: 'hazard', label: 'Hazard (fallen tree, unstable terrain, water crossing)' },
  { value: 'incorrect-info', label: 'Incorrect information (wrong distance, time, difficulty)' },
  { value: 'facilities', label: 'Facilities change (toilet closed, shelter removed)' },
  { value: 'bear-activity', label: 'Bear or wildlife activity' },
  { value: 'marking', label: 'Missing or damaged trail markings' },
  { value: 'other', label: 'Other' },
];

const EMPTY = {
  trail: '',
  issueType: '',
  severity: '',
  description: '',
  contactEmail: '',
};

export default function ReportIssuePage() {
  const [form, setForm] = useState(EMPTY);
  const [hikes, setHikes] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHikes().then(setHikes).catch(() => {});
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.issueType) { setError('Please select an issue type.'); return; }
    if (!form.description.trim()) { setError('Please describe the issue.'); return; }
    setError('');
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <InfoPage icon="✅" title="Report Received" subtitle="Thank you for keeping our trails safe">
        <div className="submit-success">
          <div className="submit-success-icon">🙏</div>
          <h2>We've received your report</h2>
          <p>
            Our team will review the issue{form.trail ? ` on ${form.trail}` : ''} and
            update the trail information or notify the relevant authorities as needed.
          </p>
          {form.contactEmail && (
            <p>We may follow up at <strong>{form.contactEmail}</strong> if we need more details.</p>
          )}
          <p>Your report helps keep other families safe — thank you.</p>
          <div className="submit-success-actions">
            <a href="/" className="info-btn info-btn--primary">Back to Trails</a>
            <button
              className="info-btn info-btn--secondary"
              onClick={() => { setForm(EMPTY); setSubmitted(false); }}
            >
              Report Another Issue
            </button>
          </div>
        </div>
      </InfoPage>
    );
  }

  return (
    <InfoPage
      icon="⚠️"
      title="Report an Issue"
      subtitle="Help keep trails safe for all families by flagging problems you encounter"
    >
      <div className="info-intro">
        <p>
          Trail conditions change — especially after storms, winter, or heavy use. If you
          notice something that could affect other hikers' safety or experience, please let
          us know. For emergencies, call <strong>112</strong> or Salvamont{' '}
          <strong>0725 826 668</strong> immediately.
        </p>
      </div>

      {error && <div className="info-form-error">{error}</div>}

      <form className="info-form" onSubmit={handleSubmit}>
        <div className="info-form-grid">
          <div className="info-form-group">
            <label>Trail (optional)</label>
            <select value={form.trail} onChange={(e) => set('trail', e.target.value)}>
              <option value="">Select a trail…</option>
              {hikes.map((h) => (
                <option key={h._id} value={h.name}>{h.name}</option>
              ))}
              <option value="__other">Other / not listed</option>
            </select>
          </div>

          <div className="info-form-group">
            <label>Severity</label>
            <select value={form.severity} onChange={(e) => set('severity', e.target.value)}>
              <option value="">Select severity…</option>
              <option value="low">Low — minor issue, trail still usable</option>
              <option value="medium">Medium — trail usable with caution</option>
              <option value="high">High — trail should be avoided</option>
              <option value="emergency">Emergency — immediate danger</option>
            </select>
          </div>

          <div className="info-form-group info-form-group--full">
            <label>Issue Type <span className="required">*</span></label>
            <div className="radio-group">
              {ISSUE_TYPES.map((t) => (
                <label key={t.value} className="radio-label">
                  <input
                    type="radio"
                    name="issueType"
                    value={t.value}
                    checked={form.issueType === t.value}
                    onChange={() => set('issueType', t.value)}
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </div>

          <div className="info-form-group info-form-group--full">
            <label>Description <span className="required">*</span></label>
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Describe the issue in detail: exact location on the trail, what you observed, when you were there, and anything that would help other hikers or our team understand the situation…"
            />
          </div>

          <div className="info-form-group info-form-group--full">
            <label>Your Email (optional)</label>
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => set('contactEmail', e.target.value)}
              placeholder="We'll contact you if we need more information"
            />
          </div>
        </div>

        <button type="submit" className="info-btn info-btn--primary info-btn--lg">
          Submit Report
        </button>
      </form>
    </InfoPage>
  );
}
