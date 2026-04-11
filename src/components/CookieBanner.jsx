import { useState, useEffect } from 'react';
import t from '../i18n.js';
import useLang from '../hooks/useLang.js';

const GA_ID = 'G-0B30HZLRRQ';

function loadGA() {
  if (window.__gaLoaded) return;
  window.__gaLoaded = true;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID);
}

export default function CookieBanner() {
  useLang();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setVisible(true);
    } else if (consent === 'accepted') {
      loadGA();
    }
    // Register global handler so footer "Cookie settings" link can re-open banner
    window.__showCookieSettings = () => setVisible(true);
    return () => { delete window.__showCookieSettings; };
  }, []);

  function accept() {
    localStorage.setItem('cookie_consent', 'accepted');
    loadGA();
    setVisible(false);
  }

  function reject() {
    localStorage.setItem('cookie_consent', 'rejected');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label={t('cookie.title')}>
      <div className="cookie-banner-inner">
        <div className="cookie-banner-text">
          <strong>{t('cookie.title')}</strong>
          <p>{t('cookie.body')}</p>
        </div>
        <div className="cookie-banner-actions">
          <button className="cookie-btn cookie-btn-reject" onClick={reject}>
            {t('cookie.reject')}
          </button>
          <button className="cookie-btn cookie-btn-accept" onClick={accept}>
            {t('cookie.accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
