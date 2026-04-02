import { useState, useEffect } from 'react';
import { getLang } from '../i18n.js';

export default function useLang() {
  const [lang, setLangState] = useState(getLang);
  useEffect(() => {
    const handler = () => setLangState(getLang());
    window.addEventListener('langchange', handler);
    return () => window.removeEventListener('langchange', handler);
  }, []);
  return lang;
}
