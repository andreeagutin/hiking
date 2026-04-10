import InfoPage from './InfoPage.jsx';

const TIPS = [
  {
    icon: '🐻',
    title: 'Bear Awareness',
    body: `The Carpathians are home to Europe's largest brown bear population. Make noise while hiking (talk, clap, use a bear bell) so you don't surprise them. Never run — back away slowly. Keep food sealed and store it away from your campsite. If a bear charges, stand your ground and use bear spray if you have it.`,
  },
  {
    icon: '🌩️',
    title: 'Mountain Weather',
    body: `Mountain weather changes fast — sunny skies can turn to thunderstorms within an hour. Check the forecast before you leave and always bring a rain layer. Above the tree line, seek shelter immediately at the first sign of lightning. Aim to be off exposed ridges before midday in summer.`,
  },
  {
    icon: '🧭',
    title: 'Trail Marking System',
    body: `Romanian trails use painted markers on rocks and trees: red, yellow, or blue stripes, crosses, triangles, or circles. Learn these before you head out. Download an offline map (Maps.me, Mapy.cz, or Munții Noștri) in case you lose signal. Never rely solely on a phone with mobile data in the mountains.`,
  },
  {
    icon: '💧',
    title: 'Water Safety',
    body: `Not all mountain springs are safe to drink — cattle and sheep graze near many trails. Use a filter bottle or purification tablets, or carry enough water from a known safe source. A good rule: 0.5 L per hour of hiking per adult, more for children and hot days.`,
  },
  {
    icon: '⏱️',
    title: 'Know When to Turn Back',
    body: `Half the journey is getting back. Set a turnaround time before you start — if you haven't reached the summit by that time, head back regardless. It's better to return another day than to hike back in the dark. Trails take 30–50 % longer on the way back when tired.`,
  },
  {
    icon: '📶',
    title: 'Mobile Signal',
    body: `Signal can be non-existent above 1 500 m in many Romanian mountain areas. Tell someone your route and expected return time before you leave. Save the Salvamont emergency number offline. Consider a PLB (Personal Locator Beacon) for multi-day or remote trips.`,
  },
  {
    icon: '🐕',
    title: 'Sheepdog Encounters',
    body: `Large livestock guardian dogs (ciobănești) protect sheep flocks and can be territorial. Don't run. Stand still, speak calmly, and slowly walk around the flock. Keep children close and between you and the flock. Most dogs bark to warn — actual attacks are rare if you stay calm.`,
  },
  {
    icon: '🩹',
    title: 'Basic First Aid Kit',
    body: `Always carry blister plasters, bandages, antiseptic wipes, pain relief, any personal medication, a whistle, and an emergency foil blanket. For family hikes add children's ibuprofen and antihistamine. Know how to use everything before you need it.`,
  },
];

export default function SafetyTipsPage() {
  return (
    <InfoPage
      icon="🛡️"
      title="Safety Tips"
      subtitle="Essential mountain safety for families hiking in Romania's Carpathians"
    >
      <div className="info-alert">
        <strong>Emergency: </strong> Call <strong>112</strong> (general emergency) or{' '}
        <strong>0725 826 668</strong> (Salvamont mountain rescue — save this offline).
      </div>

      <div className="info-card-grid">
        {TIPS.map((tip) => (
          <div key={tip.title} className="info-card">
            <div className="info-card-icon">{tip.icon}</div>
            <h3 className="info-card-title">{tip.title}</h3>
            <p className="info-card-body">{tip.body}</p>
          </div>
        ))}
      </div>

      <div className="info-section">
        <h2>Before Every Hike — Checklist</h2>
        <ul className="info-checklist">
          <li>Check the weather forecast (yr.no or meteo.ro)</li>
          <li>Download an offline map of the area</li>
          <li>Tell someone your route and return time</li>
          <li>Verify your phone is fully charged</li>
          <li>Pack extra layers even on warm days</li>
          <li>Bring more water than you think you need</li>
          <li>Know the nearest Salvamont post location</li>
          <li>Set a realistic turnaround time</li>
        </ul>
      </div>
    </InfoPage>
  );
}
