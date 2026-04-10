import InfoPage from './InfoPage.jsx';

const GEAR_SECTIONS = [
  {
    icon: '👟',
    title: 'Footwear',
    items: [
      { name: 'Hiking boots (adults)', note: 'Mid-cut with ankle support for rocky terrain. Waterproof membrane (GTX) for Romanian mountain conditions.' },
      { name: 'Trail runners', note: 'Good option for well-maintained, drier trails. Lighter weight — kids often prefer them.' },
      { name: "Kids' hiking shoes", note: 'Look for rubber toe caps, grippy soles, and quick-lace systems. Avoid pure fashion trainers on mountain trails.' },
      { name: 'Wool or synthetic socks', note: 'No cotton — cotton holds moisture and causes blisters. Merino wool is ideal for all-day comfort.' },
    ],
  },
  {
    icon: '🧥',
    title: 'Layering System',
    items: [
      { name: 'Base layer', note: 'Moisture-wicking synthetic or merino wool. Avoid cotton — "cotton kills" in wet mountain conditions.' },
      { name: 'Mid layer', note: 'Fleece or light down jacket. Even in summer, carry one per person — temperatures drop fast above 1 500 m.' },
      { name: 'Shell / rain jacket', note: 'Lightweight packable shell is non-negotiable in the Carpathians. Pack one for every family member.' },
      { name: 'Gloves & hat', note: 'Essential spring and autumn. A warm hat fits in a pocket and weighs almost nothing.' },
    ],
  },
  {
    icon: '🎒',
    title: 'Backpacks',
    items: [
      { name: 'Day pack (adults)', note: '20–30 L for a day hike with all family gear. Look for hip belt and load-lifter straps.' },
      { name: "Kids' pack", note: 'Let children aged 5+ carry their own snacks and water — 10–15 % of body weight max. Kids love the responsibility.' },
      { name: 'Hydration bladder', note: '2 L reservoir with drinking tube keeps kids hydrated without stopping — they drink more when it\'s easy.' },
      { name: 'Rain cover', note: 'Most packs include one. Keep it accessible on top.' },
    ],
  },
  {
    icon: '🗺️',
    title: 'Navigation',
    items: [
      { name: 'Offline maps', note: 'Download your area in Mapy.cz, Maps.me, or Munții Noștri app before leaving home. Mobile signal is unreliable in the mountains.' },
      { name: 'Paper map', note: 'For longer or remote hikes, carry a printed topo map. The 1:25 000 Munții Noștri series covers most Romanian ranges.' },
      { name: 'Compass', note: 'Know how to use it in combination with your map. Phones fail; compasses don\'t.' },
      { name: 'GPS watch', note: 'Useful for tracking distance and elevation. Not a substitute for maps.' },
    ],
  },
  {
    icon: '🍎',
    title: 'Food & Water',
    items: [
      { name: 'Water', note: 'Bring 0.5 L per hour of hiking per adult, 0.4 L per child. Refill only from known safe springs or use a filter.' },
      { name: 'Filter bottle or purifier', note: 'LifeStraw, Sawyer Squeeze, or iodine tablets for emergencies. Very useful on longer trails.' },
      { name: 'Calorie-dense snacks', note: 'Trail mix, dates, energy bars, cheese, cured meats. Kids need snacks every 45–60 minutes to keep morale high.' },
      { name: 'Lunch', note: 'A proper sit-down lunch keeps energy up and morale high. Wraps travel well; sandwiches crush. Hot soup in a thermos is a treat in autumn.' },
    ],
  },
  {
    icon: '🩺',
    title: 'First Aid & Extras',
    items: [
      { name: 'First aid kit', note: 'Blister plasters (most common issue!), bandages, antiseptic, pain relief (adult + children\'s doses), antihistamine, tweezers for ticks.' },
      { name: 'Sun protection', note: 'SPF 50 sunscreen, UV sunglasses, and a hat. UV exposure increases ~4 % per 300 m elevation gain.' },
      { name: 'Insect repellent', note: 'Tick repellent is essential from April to October in Romanian forests. Check for ticks after every hike.' },
      { name: 'Emergency foil blanket', note: 'Weighs 30 g and can prevent hypothermia. One per adult minimum.' },
      { name: 'Headlamp', note: 'Even for day hikes — storms or slow groups can mean a late return. Spare batteries or USB charging cable.' },
      { name: 'Whistle', note: 'The international distress signal is 6 blasts, pause, repeat. Much more effective than shouting.' },
    ],
  },
];

export default function GearGuidePage() {
  return (
    <InfoPage
      icon="🎒"
      title="Gear Guide"
      subtitle="What to pack for family hiking in Romania's mountains — from day trips to mountain adventures"
    >
      <div className="info-intro">
        <p>
          You don't need expensive gear to have a great family hike — but a few key items
          make the difference between a miserable retreat and a day your kids will talk about
          for years. This guide focuses on the Romanian mountain context: unpredictable weather,
          variable trail quality, and limited services once you're above the tree line.
        </p>
      </div>

      {GEAR_SECTIONS.map((section) => (
        <div key={section.title} className="info-section">
          <h2><span className="info-section-icon">{section.icon}</span> {section.title}</h2>
          <div className="gear-grid">
            {section.items.map((item) => (
              <div key={item.name} className="gear-item">
                <div className="gear-item-name">{item.name}</div>
                <div className="gear-item-note">{item.note}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="info-tip-box">
        <strong>Pro tip for families:</strong> Buy quality hiking boots and a good pack —
        these are the two items that most affect comfort. Everything else can be improvised.
        Second-hand gear shops and Facebook Marketplace are great sources for fast-growing kids.
      </div>
    </InfoPage>
  );
}
