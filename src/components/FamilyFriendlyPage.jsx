import { useState, useEffect } from 'react';
import InfoPage from './InfoPage.jsx';
import HikeCard from './HikeCard.jsx';
import { fetchHikes } from '../api/hikes.js';

const TIPS = [
  { icon: '🍎', text: 'Pack twice the snacks you think you need — kids need fuel every 45 minutes.' },
  { icon: '🐢', text: 'Slow down. A child\'s pace is 1–1.5 km/h. Plan accordingly.' },
  { icon: '🎯', text: 'Give kids a mission: count bridges, spot birds, find the biggest rock.' },
  { icon: '🔴', text: 'Know the turnaround time before you start — tired kids don\'t negotiate.' },
];

export default function FamilyFriendlyPage() {
  const [hikes, setHikes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHikes()
      .then((all) => setHikes(all.filter((h) => h.familyFriendly)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <InfoPage
      icon="👨‍👩‍👧‍👦"
      title="Family-Friendly Trails"
      subtitle="Curated routes verified as suitable for children — with family safety info on every trail"
      path="/family-friendly"
      metaDescription="Best family-friendly hiking trails in Romania, verified for children of all ages. Bear safety, difficulty ratings, and stroller-accessible routes."
    >
      <div className="info-intro">
        <p>
          Every trail on this page has been verified as family-friendly by parents who've
          hiked it with their own kids. Each entry includes minimum recommended age, amenities,
          safety notes, and a kid engagement score so you can find the perfect adventure.
        </p>
      </div>

      <div className="family-tips-row">
        {TIPS.map((tip) => (
          <div key={tip.icon} className="family-tip">
            <span className="family-tip-icon">{tip.icon}</span>
            <span className="family-tip-text">{tip.text}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="info-loading">Loading trails…</div>
      ) : hikes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🥾</div>
          <div className="empty-state-text">No family-friendly trails listed yet — check back soon!</div>
        </div>
      ) : (
        <>
          <div className="info-results-bar">{hikes.length} family-friendly trail{hikes.length !== 1 ? 's' : ''}</div>
          <div className="hike-grid">
            {hikes.map((h) => (
              <HikeCard key={h._id} hike={h} distance={null} />
            ))}
          </div>
        </>
      )}

      <div className="info-section" style={{ marginTop: '3rem' }}>
        <h2>Age-by-Age Hiking Guide</h2>
        <div className="age-guide-grid">
          {[
            { range: '0–2 yrs', label: 'Babies & Toddlers', icon: '👶', tips: ['Carrier hikes only', 'Max 1.5 h total outing', 'Shade and water critical', 'Check for stroller-accessible trails'] },
            { range: '3–5 yrs', label: 'Preschoolers', icon: '🧒', tips: ['1–3 km with frequent breaks', 'Let them lead sometimes', 'Bring a change of clothes', '30-min trail games keep them going'] },
            { range: '6–9 yrs', label: 'Kids', icon: '🧗', tips: ['Up to 6–8 km comfortable', 'Involve them in navigation', 'Let them carry their own pack', 'Summits are incredibly motivating'] },
            { range: '10+ yrs', label: 'Tweens & Teens', icon: '🏃', tips: ['Adult distances possible', 'Give real responsibilities', 'Harder terrain is engaging', 'Multi-day huts within reach'] },
          ].map((g) => (
            <div key={g.range} className="age-guide-card">
              <div className="age-guide-icon">{g.icon}</div>
              <div className="age-guide-range">{g.range}</div>
              <div className="age-guide-label">{g.label}</div>
              <ul className="age-guide-tips">
                {g.tips.map((tip) => <li key={tip}>{tip}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </InfoPage>
  );
}
