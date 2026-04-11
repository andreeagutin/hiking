import React from 'react';
import { useState } from 'react';
import { login, setToken } from '../../api/auth.js';

export default function AdminLogin({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const token = await login(username, password);
      setToken(token);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-wrap">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <img src="/hikenSeek-owl-icon.svg" alt="Hike'n'Seek" style={{ width: '4rem', height: '4rem', margin: '0 auto 0.5rem' }} />
        <h1 className="admin-login-title">Admin Panel</h1>
        <p className="admin-login-sub">Hike'n'Seek</p>

        {error && <div className="admin-login-error">{error}</div>}

        <div className="admin-field">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className="admin-field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="admin-login-btn" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
