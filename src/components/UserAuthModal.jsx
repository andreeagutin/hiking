import { useState } from 'react';
import t from '../i18n.js';
import useLang from '../hooks/useLang.js';
import { loginUser, registerUser } from '../api/users.js';

export default function UserAuthModal({ onClose, onSuccess }) {
  useLang();
  const [mode, setMode]       = useState('login'); // 'login' | 'register'
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginUser({ email, password });
      } else {
        await registerUser({ email, password, name });
        await loginUser({ email, password });
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-modal-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal">
        <button className="auth-modal-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="auth-modal-header">
          <div className="auth-modal-logo">🏔️</div>
          <h2 className="auth-modal-title">
            {mode === 'login' ? t('auth.signIn') : t('auth.createAccount')}
          </h2>
        </div>

        <form className="auth-modal-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="auth-field">
              <label className="auth-label">{t('auth.name')}</label>
              <input
                className="auth-input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t('auth.namePlaceholder')}
                autoComplete="name"
              />
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label">{t('auth.email')}</label>
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">{t('auth.password')}</label>
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'register' ? t('auth.passwordHint') : '••••••••'}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-submit-btn" type="submit" disabled={loading}>
            {loading
              ? t('common.loading')
              : mode === 'login' ? t('auth.signIn') : t('auth.createAccount')
            }
          </button>
        </form>

        <div className="auth-modal-switch">
          {mode === 'login' ? (
            <>
              {t('auth.noAccount')}{' '}
              <button className="auth-switch-btn" onClick={() => { setMode('register'); setError(''); }}>
                {t('auth.createAccount')}
              </button>
            </>
          ) : (
            <>
              {t('auth.haveAccount')}{' '}
              <button className="auth-switch-btn" onClick={() => { setMode('login'); setError(''); }}>
                {t('auth.signIn')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
