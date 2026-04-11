import SiteFooter from './SiteFooter.jsx';
import usePageMeta from '../hooks/usePageMeta.js';

/**
 * Shared layout for static informational pages.
 * Renders a dark header, main content area, and site footer.
 * @param {string} path            - URL path for canonical tag, e.g. "/safety-tips"
 * @param {string} [metaDescription] - Custom meta description; falls back to subtitle
 */
export default function InfoPage({ icon, title, subtitle, path, metaDescription, children }) {
  usePageMeta(title, metaDescription || subtitle || title, path || '/');
  return (
    <div className="public-page">
      <div className="info-page-header">
        <div className="info-page-header-inner">
          <a href="/" className="info-back-link">← All Trails</a>
          <div className="info-page-title-row">
            <span className="info-page-icon">{icon}</span>
            <div>
              <h1 className="info-page-title">{title}</h1>
              {subtitle && <p className="info-page-subtitle">{subtitle}</p>}
            </div>
          </div>
        </div>
      </div>
      <main className="info-page-body">
        <div className="info-page-inner">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
