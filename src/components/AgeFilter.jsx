import t from '../i18n.js';
import useLang from '../hooks/useLang.js';

// Age groups: filter by minAgeRecommended <= group.maxAge
const AGE_GROUPS = [
  { id: 'toddler',   emoji: '👶', labelKey: 'age.toddlers',   rangeKey: 'age.toddlersRange',   maxAge: 3  },
  { id: 'preschool', emoji: '🧒', labelKey: 'age.preschool',  rangeKey: 'age.preschoolRange',  maxAge: 5  },
  { id: 'kids',      emoji: '👦', labelKey: 'age.kids',       rangeKey: 'age.kidsRange',       maxAge: 9  },
  { id: 'tweens',    emoji: '🧑', labelKey: 'age.tweens',     rangeKey: 'age.tweensRange',     maxAge: 12 },
  { id: 'teens',     emoji: '👧', labelKey: 'age.teens',      rangeKey: 'age.teensRange',      maxAge: 99 },
];

export { AGE_GROUPS };

export default function AgeFilter({ selectedAge, onAgeSelect }) {
  useLang();

  return (
    <section className="age-filter">
      <div className="age-filter-inner">
        <div className="age-filter-header">
          <h2>{t('age.title')}</h2>
          <p>{t('age.subtitle')}</p>
        </div>

        <div className="age-filter-buttons">
          {/* All Ages */}
          <button
            className={`age-filter-btn${selectedAge === null ? ' active' : ''}`}
            onClick={() => onAgeSelect(null)}
          >
            <span className="age-filter-btn-icon">🌲</span>
            <span className="age-filter-btn-label">{t('age.allAges')}</span>
            <span className="age-filter-btn-range">{t('age.allAgesDesc')}</span>
          </button>

          {AGE_GROUPS.map((group) => (
            <button
              key={group.id}
              className={`age-filter-btn${selectedAge === group.id ? ' active' : ''}`}
              onClick={() => onAgeSelect(selectedAge === group.id ? null : group.id)}
            >
              <span className="age-filter-btn-icon">{group.emoji}</span>
              <span className="age-filter-btn-label">{t(group.labelKey)}</span>
              <span className="age-filter-btn-range">{t(group.rangeKey)}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
