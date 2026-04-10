import t from '../i18n.js';
import useLang from '../hooks/useLang.js';

export default function SiteFooter() {
  useLang();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-grid">
          {/* Brand */}
          <div>
            <a href="/" className="site-footer-brand-logo">
              <img src="/hike-and-seek.png" alt="Hike & Seek" className="site-footer-logo-img" />
              <span>Hike &amp; Seek</span>
            </a>
            <p className="site-footer-tagline">{t('footer.tagline')}</p>
            <div className="site-footer-socials">
              <a href="#" className="site-footer-social-btn" aria-label="Instagram">📸</a>
              <a href="#" className="site-footer-social-btn" aria-label="Facebook">📘</a>
              <a href="#" className="site-footer-social-btn" aria-label="Email">✉️</a>
            </div>
          </div>

          {/* Explore */}
          <div className="site-footer-col">
            <h3>{t('footer.explore')}</h3>
            <ul>
              <li><a href="/#trails">{t('footer.allTrails')}</a></li>
              <li><a href="/#trails">{t('footer.familyFriendly')}</a></li>
              <li><a href="/#trails">{t('footer.easyWalks')}</a></li>
              <li><a href="/#trails">{t('footer.mountainViews')}</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="site-footer-col">
            <h3>{t('footer.resources')}</h3>
            <ul>
              <li><a href="/stats">{t('footer.statistics')}</a></li>
              <li><a href="#">{t('footer.safetyTips')}</a></li>
              <li><a href="#">{t('footer.gearGuide')}</a></li>
              <li><a href="#">{t('footer.trailMap')}</a></li>
            </ul>
          </div>

          {/* Info */}
          <div className="site-footer-col">
            <h3>{t('footer.info')}</h3>
            <ul>
              <li><a href="#">{t('footer.aboutUs')}</a></li>
              <li><a href="#">{t('footer.submitTrail')}</a></li>
              <li><a href="#">{t('footer.reportIssue')}</a></li>
              <li><a href="/admin">{t('footer.admin')}</a></li>
            </ul>
          </div>
        </div>

        <div className="site-footer-bottom">
          <p>© {year} Hike &amp; Seek. {t('footer.rights')}</p>
          <p>{t('footer.madeWith')}</p>
        </div>
      </div>
    </footer>
  );
}
