import { useEffect } from 'react';

const SITE_NAME = "Hike'n'Seek";
const BASE_URL  = 'https://hiking-high.netlify.app';
const DEFAULT_IMAGE = `${BASE_URL}/hero-family-hike.jpg`;

function setMeta(nameOrProp, content, isProperty = false) {
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${nameOrProp}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, nameOrProp);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Sets page-level SEO meta tags and cleans up on unmount.
 *
 * @param {string} title       - Page title (without site suffix)
 * @param {string} description - Meta description (≤160 chars)
 * @param {string} path        - URL path, e.g. "/safety-tips"
 * @param {string} [image]     - Absolute image URL (falls back to site default)
 */
export default function usePageMeta(title, description, path, image) {
  useEffect(() => {
    const fullTitle   = `${title} — ${SITE_NAME}`;
    const canonicalUrl = `${BASE_URL}${path}`;
    const ogImage     = image || DEFAULT_IMAGE;

    document.title = fullTitle;
    setMeta('description', description);
    setMeta('keywords',    `${title}, hiking trails Romania, drumeții montane, Carpathian hiking, ${SITE_NAME}`);
    setCanonical(canonicalUrl);
    setMeta('og:title',       fullTitle,    true);
    setMeta('og:description', description, true);
    setMeta('og:url',         canonicalUrl, true);
    setMeta('og:type',        'website',    true);
    setMeta('og:image',       ogImage,      true);
    setMeta('twitter:title',       fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image',       ogImage);

    return () => {
      document.title = `${SITE_NAME} — Trasee montane din România`;
      setMeta('description', 'Descoperă cele mai frumoase trasee montane din România. Filtrează după dificultate, durată, munte și condiții pentru familie.');
      setCanonical(`${BASE_URL}/`);
      setMeta('og:title',       `${SITE_NAME} — Trasee montane din România`, true);
      setMeta('og:description', 'Descoperă cele mai frumoase trasee montane din România.', true);
      setMeta('og:url',         `${BASE_URL}/`, true);
      setMeta('og:image',       DEFAULT_IMAGE, true);
      setMeta('twitter:title',       `${SITE_NAME} — Trasee montane din România`);
      setMeta('twitter:description', 'Descoperă cele mai frumoase trasee montane din România.');
      setMeta('twitter:image',       DEFAULT_IMAGE);
    };
  }, [title, description, path, image]);
}
