import t from '../i18n.js';
import useLang from '../hooks/useLang.js';

const FEATURES = [
  { emoji: '👶', titleKey: 'features.age.title',    descKey: 'features.age.desc'    },
  { emoji: '🛡️', titleKey: 'features.safety.title', descKey: 'features.safety.desc' },
  { emoji: '📍', titleKey: 'features.local.title',  descKey: 'features.local.desc'  },
  { emoji: '🧭', titleKey: 'features.nav.title',    descKey: 'features.nav.desc'    },
];

export default function FeaturesSection() {
  useLang();

  return (
    <section className="features-section">
      <div className="features-inner">
        <div className="features-header">
          <h2>{t('features.title')}</h2>
          <p>{t('features.subtitle')}</p>
        </div>

        <div className="features-grid">
          {FEATURES.map((f) => (
            <div key={f.titleKey} className="feature-card">
              <div className="feature-card-icon">{f.emoji}</div>
              <h3>{t(f.titleKey)}</h3>
              <p>{t(f.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
