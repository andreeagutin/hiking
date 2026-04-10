import InfoPage from './InfoPage.jsx';

const REGIONS = [
  {
    name: 'Bucegi',
    emoji: '🏔️',
    description: 'The most accessible alpine area from Bucharest. Spectacular limestone plateau, iconic Sphinx and Babele rock formations, well-marked trails. Busy in summer — go early.',
    difficulty: 'Easy to Hard',
    access: 'Sinaia, Bușteni, Azuga',
    highlight: 'Vârful Omu (2 505 m)',
  },
  {
    name: 'Retezat',
    emoji: '🏞️',
    description: 'Romania\'s oldest national park. Glacial lakes, pristine wilderness, and the country\'s most dramatic alpine scenery. Longer approach but worth every step.',
    difficulty: 'Medium to Hard',
    access: 'Petroșani, Hațeg',
    highlight: 'Lacul Bucura (largest glacial lake)',
  },
  {
    name: 'Piatra Craiului',
    emoji: '🪨',
    description: 'A narrow limestone ridge stretching 25 km. Exposed ridgeline hiking with dramatic views in both directions. Not suitable for young children on the ridge trail.',
    difficulty: 'Medium to Hard',
    access: 'Zărnești, Bran',
    highlight: 'Creasta Nordică ridge',
  },
  {
    name: 'Apuseni',
    emoji: '🌿',
    description: 'Gentler forested mountains with caves, gorges, and meadows. The most family-friendly mountain region — lower elevations, moderate terrain, rich in natural wonders.',
    difficulty: 'Easy to Medium',
    access: 'Cluj-Napoca, Alba Iulia',
    highlight: 'Peștera Scărișoara (ice cave)',
  },
  {
    name: 'Ceahlău',
    emoji: '⛰️',
    description: 'The "sacred mountain" of the Eastern Carpathians. Dramatic rock pillars, ancient legends, and a circular ridge route with great views over Lake Izvorul Muntelui.',
    difficulty: 'Easy to Medium',
    access: 'Bicaz, Piatra Neamț',
    highlight: 'Vârful Toaca (1 904 m)',
  },
  {
    name: 'Fagaras',
    emoji: '🌨️',
    description: 'The highest mountain range in Romania, with peaks above 2 500 m. The Transfăgărășan road cuts through it. Ridge traverses are for experienced hikers only.',
    difficulty: 'Hard',
    access: 'Sibiu, Curtea de Argeș',
    highlight: 'Vârful Moldoveanu (2 544 m)',
  },
  {
    name: 'Rarău',
    emoji: '🌲',
    description: 'Iconic limestone monoliths ("Pietrele Doamnei") rising from spruce forests in Bucovina. Shorter hikes with dramatic scenery — great for a half-day family outing.',
    difficulty: 'Easy to Medium',
    access: 'Câmpulung Moldovenesc',
    highlight: 'Pietrele Doamnei rock formation',
  },
  {
    name: 'Semenic',
    emoji: '🦌',
    description: 'Rounded highlands in the Banat with vast meadows and European bison (zimbri) in the Semenic-Cheile Carasului National Park. Excellent for families and nature lovers.',
    difficulty: 'Easy',
    access: 'Reșița, Caransebeș',
    highlight: 'European bison reserve',
  },
];

const MAP_APPS = [
  { name: 'Mapy.cz', url: 'https://mapy.cz', desc: 'Detailed Czech-made maps, excellent Romanian coverage. Downloadable offline. Recommended.' },
  { name: 'Munții Noștri', url: 'https://muntii-nostri.ro', desc: 'Romania-specific hiking app. Community-verified trail data and GPX downloads.' },
  { name: 'Maps.me', url: 'https://maps.me', desc: 'Offline OpenStreetMap-based navigation. Good for road access to trailheads.' },
  { name: 'AllTrails', url: 'https://alltrails.com', desc: 'Growing Romanian trail database with user reviews. Useful for finding new routes.' },
  { name: 'Wikiloc', url: 'https://wikiloc.com', desc: 'Large repository of user-uploaded GPX tracks for Romanian mountains.' },
];

export default function TrailMapPage() {
  return (
    <InfoPage
      icon="🗺️"
      title="Trail Map"
      subtitle="Explore Romania's mountain regions and discover the best mapping resources"
    >
      <div className="info-intro">
        <p>
          Romania's Carpathians span over 900 km and contain some of Central Europe's
          most spectacular and least-crowded mountain terrain. The country is divided into three
          main Carpathian arcs: the Eastern, Southern (Transylvanian Alps), and Western Carpathians,
          each with a distinct character.
        </p>
      </div>

      <div className="info-section">
        <h2>Mountain Regions</h2>
        <div className="region-grid">
          {REGIONS.map((r) => (
            <div key={r.name} className="region-card">
              <div className="region-card-header">
                <span className="region-emoji">{r.emoji}</span>
                <div>
                  <div className="region-name">{r.name}</div>
                  <div className="region-difficulty">{r.difficulty}</div>
                </div>
              </div>
              <p className="region-desc">{r.description}</p>
              <div className="region-meta">
                <span>📍 {r.access}</span>
                <span>⭐ {r.highlight}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="info-section">
        <h2>Recommended Mapping Apps</h2>
        <div className="map-apps-list">
          {MAP_APPS.map((app) => (
            <div key={app.name} className="map-app-item">
              <div className="map-app-name">{app.name}</div>
              <div className="map-app-desc">{app.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="info-section">
        <h2>Trail Marking Colours</h2>
        <div className="marker-legend">
          {[
            { color: '#dc2626', label: 'Red', desc: 'Main ridge routes and primary trails' },
            { color: '#ca8a04', label: 'Yellow', desc: 'Secondary trails connecting main routes' },
            { color: '#2563eb', label: 'Blue', desc: 'Connecting trails and valley routes' },
          ].map((m) => (
            <div key={m.label} className="marker-legend-item">
              <span className="marker-swatch" style={{ background: m.color }} />
              <div>
                <div className="marker-legend-label">{m.label}</div>
                <div className="marker-legend-desc">{m.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="info-note">
          Markers appear as horizontal stripes, crosses, triangles, or circles painted on rocks and
          trees. The colour + shape combination identifies a specific trail. Always match both.
        </p>
      </div>

      <div className="info-tip-box">
        <strong>Planning tip:</strong> Cross-reference Mapy.cz with the Munții Noștri website
        for current trail conditions — especially after winter, when snow bridges and washed-out
        sections are common until May/June at higher elevations.
      </div>
    </InfoPage>
  );
}
