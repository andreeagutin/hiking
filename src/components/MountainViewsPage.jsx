import { useState, useEffect } from 'react';
import InfoPage from './InfoPage.jsx';
import HikeCard from './HikeCard.jsx';
import { fetchHikes } from '../api/hikes.js';

// Keywords that suggest scenic/panoramic hikes
const SCENIC_KEYWORDS = ['panoram', 'view', 'vedere', 'summit', 'vârf', 'varf', 'peak', 'creastă', 'creasta', 'ridge'];

function isScenicHike(hike) {
  // Hike has significant elevation gain OR is marked as medium difficulty
  if (hike.up != null && hike.up >= 300) return true;
  if (hike.difficulty === 'medium') return true;
  // Or has scenic highlights
  const highlights = (hike.highlights || []).map((h) => h.toLowerCase());
  return SCENIC_KEYWORDS.some((kw) => highlights.some((h) => h.includes(kw)));
}

const BEST_MOUNTAINS = [
  { name: 'Bucegi', emoji: '🏔️', viewDesc: 'Plateau views stretching to the Fagaras range, plus the iconic Sphinx rock formation.' },
  { name: 'Piatra Craiului', emoji: '🪨', viewDesc: 'A narrow limestone ridge with 360° panoramas — one of the most dramatic ridgelines in Romania.' },
  { name: 'Retezat', emoji: '🏞️', viewDesc: 'Glacial lake cirques, high alpine meadows, and unobstructed views of the Southern Carpathians.' },
  { name: 'Ceahlău', emoji: '⛰️', viewDesc: 'Rock pillar formations and sweeping views over Lake Izvorul Muntelui to the east.' },
  { name: 'Fagaras', emoji: '🌨️', viewDesc: 'The highest peaks in Romania — ridge walks above 2 400 m with views into Transylvania and Wallachia.' },
  { name: 'Rarău', emoji: '🌲', viewDesc: 'The Pietrele Doamnei limestone monoliths rising from spruce forest — dramatic and easily accessible.' },
];

const PHOTO_TIPS = [
  { icon: '🌅', tip: 'Golden hour on mountain ridges is 30–45 min after sunrise. Plan your summit for dawn.' },
  { icon: '☁️', tip: 'Overcast days reduce harsh shadows. Some of the most dramatic photos come from "bad" weather.' },
  { icon: '📱', tip: 'Wide-angle mode captures more of the panorama. Shoot in portrait format for tall formations.' },
  { icon: '🧍', tip: 'A person in the foreground gives scale to vast mountain scenes.' },
];

export default function MountainViewsPage() {
  const [hikes, setHikes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHikes()
      .then((all) => {
        const scenic = all.filter(isScenicHike);
        // Sort by elevation gain descending — the highest hikes tend to have the best views
        scenic.sort((a, b) => (b.up ?? 0) - (a.up ?? 0));
        setHikes(scenic);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <InfoPage
      icon="🌄"
      title="Mountain Views"
      subtitle="Trails with the most spectacular panoramas in Romania's Carpathians"
    >
      <div className="info-intro">
        <p>
          There's something irreplaceable about cresting a ridge after a hard climb and
          seeing the mountains unfold in every direction. These trails are selected for
          their elevation gain, ridge sections, and standout summit or panoramic views —
          perfect for families ready to go a step beyond the forest walk.
        </p>
      </div>

      <div className="info-section">
        <h2>Best Regions for Mountain Views</h2>
        <div className="region-grid region-grid--compact">
          {BEST_MOUNTAINS.map((m) => (
            <div key={m.name} className="region-view-card">
              <span className="region-view-emoji">{m.emoji}</span>
              <div>
                <div className="region-view-name">{m.name}</div>
                <div className="region-view-desc">{m.viewDesc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="info-loading">Loading trails…</div>
      ) : hikes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏔️</div>
          <div className="empty-state-text">No scenic trails listed yet — check back soon!</div>
        </div>
      ) : (
        <div className="info-section">
          <h2>Scenic Trails ({hikes.length})</h2>
          <div className="hike-grid">
            {hikes.map((h) => (
              <HikeCard key={h._id} hike={h} distance={null} />
            ))}
          </div>
        </div>
      )}

      <div className="info-section">
        <h2>Photography Tips</h2>
        <div className="photo-tips-grid">
          {PHOTO_TIPS.map((pt) => (
            <div key={pt.icon} className="photo-tip">
              <span className="photo-tip-icon">{pt.icon}</span>
              <span>{pt.tip}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="info-tip-box">
        <strong>Safety reminder:</strong> Ridge and summit hikes are more exposed. Always check
        the weather before heading out — afternoon thunderstorms are common in summer. If you
        see clouds building over the peaks by 11 AM, consider a lower-elevation route or an
        early start the next day.
      </div>
    </InfoPage>
  );
}
