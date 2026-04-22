import { useState, useEffect } from 'react';
import t from '../i18n.js';
import useLang from '../hooks/useLang.js';
import SiteFooter from './SiteFooter.jsx';
import {
  isUserLoggedIn, getProfile, updateProfile,
  getSaved, saveItem, unsaveItem, logoutUser,
} from '../api/users.js';

function SubscriptionBadge({ tier }) {
  const colors = { free: 'neutral', explorer: 'amber', pro: 'forest' };
  return (
    <span className={`profile-sub-badge profile-sub-badge-${colors[tier] || 'neutral'}`}>
      {tier || 'free'}
    </span>
  );
}

function ProfileSection({ user, onUpdate }) {
  useLang();
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState(user.name || '');
  const [email, setEmail]     = useState(user.email || '');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const updated = await updateProfile({ name, email });
      onUpdate(updated);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className="profile-card">
        <div className="profile-card-header">
          <h2 className="profile-section-title">{t('user.profile')}</h2>
          <button className="profile-edit-btn" onClick={() => setEditing(true)}>{t('common.edit')}</button>
        </div>
        <div className="profile-info-row"><span className="profile-info-label">{t('auth.name')}</span><span>{user.name || '—'}</span></div>
        <div className="profile-info-row"><span className="profile-info-label">{t('auth.email')}</span><span>{user.email}</span></div>
        <div className="profile-info-row">
          <span className="profile-info-label">{t('user.subscription')}</span>
          <SubscriptionBadge tier={user.subscription} />
        </div>
      </div>
    );
  }

  return (
    <div className="profile-card">
      <h2 className="profile-section-title">{t('user.editProfile')}</h2>
      <form onSubmit={handleSave} className="profile-form">
        <label className="profile-form-label">
          {t('auth.name')}
          <input className="profile-form-input" type="text" value={name} onChange={e => setName(e.target.value)} />
        </label>
        <label className="profile-form-label">
          {t('auth.email')}
          <input className="profile-form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        {error && <div className="auth-error">{error}</div>}
        <div className="profile-form-actions">
          <button className="profile-save-btn" type="submit" disabled={saving}>
            {saving ? t('common.saving') : t('common.save')}
          </button>
          <button className="profile-cancel-btn" type="button" onClick={() => setEditing(false)}>{t('common.cancel')}</button>
        </div>
      </form>
    </div>
  );
}

function ChildrenSection({ user, onUpdate }) {
  useLang();
  const [editing, setEditing] = useState(false);
  const [children, setChildren] = useState(user.children || []);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  function addChild() {
    setChildren(prev => [...prev, { name: '', birthYear: '' }]);
  }

  function removeChild(i) {
    setChildren(prev => prev.filter((_, idx) => idx !== i));
  }

  function updateChild(i, field, value) {
    setChildren(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const normalized = children.map(c => ({
        name: c.name,
        birthYear: c.birthYear === '' ? null : Number(c.birthYear),
      }));
      const updated = await updateProfile({ children: normalized });
      onUpdate(updated);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className="profile-card">
        <div className="profile-card-header">
          <h2 className="profile-section-title">{t('user.children')}</h2>
          <button className="profile-edit-btn" onClick={() => { setChildren(user.children || []); setEditing(true); }}>{t('common.edit')}</button>
        </div>
        {(!user.children || user.children.length === 0) ? (
          <p className="profile-empty-text">{t('user.noChildren')}</p>
        ) : (
          <div className="profile-children-list">
            {user.children.map((c, i) => (
              <div key={i} className="profile-child-row">
                <span className="profile-child-icon">👦</span>
                <span>{c.name || '—'}</span>
                {c.birthYear && <span className="profile-child-year">{c.birthYear}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="profile-card">
      <h2 className="profile-section-title">{t('user.children')}</h2>
      <form onSubmit={handleSave} className="profile-form">
        {children.map((c, i) => (
          <div key={i} className="profile-child-edit-row">
            <input
              className="profile-form-input"
              type="text"
              value={c.name}
              onChange={e => updateChild(i, 'name', e.target.value)}
              placeholder={t('user.childName')}
            />
            <input
              className="profile-form-input profile-form-input-year"
              type="number"
              value={c.birthYear}
              onChange={e => updateChild(i, 'birthYear', e.target.value)}
              placeholder={t('user.birthYear')}
              min="2000"
              max={new Date().getFullYear()}
            />
            <button className="profile-child-remove" type="button" onClick={() => removeChild(i)}>✕</button>
          </div>
        ))}
        <button className="profile-add-child-btn" type="button" onClick={addChild}>+ {t('user.addChild')}</button>
        {error && <div className="auth-error">{error}</div>}
        <div className="profile-form-actions">
          <button className="profile-save-btn" type="submit" disabled={saving}>
            {saving ? t('common.saving') : t('common.save')}
          </button>
          <button className="profile-cancel-btn" type="button" onClick={() => setEditing(false)}>{t('common.cancel')}</button>
        </div>
      </form>
    </div>
  );
}

function SavedHikeCard({ hike, onUnsave }) {
  const img = hike.mainPhoto || hike.photos?.[0] || hike.imageUrl;
  return (
    <div className="profile-saved-card">
      {img
        ? <img src={img} alt={hike.name} className="profile-saved-card-img" loading="lazy" />
        : <div className="profile-saved-card-no-img">🏔️</div>
      }
      <div className="profile-saved-card-body">
        <a className="profile-saved-card-title" href={`/hike/${hike.slug || hike._id}`}>{hike.name}</a>
        <div className="profile-saved-card-meta">
          {hike.mountains && <span>{hike.mountains}</span>}
          {hike.distance && <span>{hike.distance} km</span>}
          {hike.time && <span>{hike.time}h</span>}
        </div>
      </div>
      <button className="profile-unsave-btn" onClick={() => onUnsave('hike', hike._id)} title={t('save.unsave')}>🔖</button>
    </div>
  );
}

function SavedPoiCard({ poi, onUnsave }) {
  const img = poi.mainPhoto || poi.photos?.[0];
  return (
    <div className="profile-saved-card">
      {img
        ? <img src={img} alt={poi.name} className="profile-saved-card-img" loading="lazy" />
        : <div className="profile-saved-card-no-img">📍</div>
      }
      <div className="profile-saved-card-body">
        <a className="profile-saved-card-title" href={`/poi/${poi.slug || poi._id}`}>{poi.name}</a>
        <div className="profile-saved-card-meta">
          {poi.poiType && <span>{poi.poiType}</span>}
          {poi.mountains && <span>{poi.mountains}</span>}
        </div>
      </div>
      <button className="profile-unsave-btn" onClick={() => onUnsave('poi', poi._id)} title={t('save.unsave')}>🔖</button>
    </div>
  );
}

function SavedRestaurantCard({ restaurant, onUnsave }) {
  return (
    <div className="profile-saved-card">
      <div className="profile-saved-card-no-img">🍽️</div>
      <div className="profile-saved-card-body">
        <span className="profile-saved-card-title">{restaurant.name}</span>
        <div className="profile-saved-card-meta">
          {restaurant.type && <span>{restaurant.type}</span>}
          {restaurant.mountains && <span>{restaurant.mountains}</span>}
          {restaurant.zone && <span>{restaurant.zone}</span>}
        </div>
        {restaurant.link && (
          <a href={restaurant.link} target="_blank" rel="noopener noreferrer" className="profile-saved-card-link">
            {t('common.view')}
          </a>
        )}
      </div>
      <button className="profile-unsave-btn" onClick={() => onUnsave('restaurant', restaurant._id)} title={t('save.unsave')}>🔖</button>
    </div>
  );
}

export default function UserProfile() {
  useLang();
  const [user, setUser]       = useState(null);
  const [saved, setSaved]     = useState({ hikes: [], restaurants: [], pois: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!isUserLoggedIn()) {
      window.location.href = '/';
      return;
    }
    document.title = "My Profile — Hike'n'Seek";
    Promise.all([getProfile(), getSaved()])
      .then(([profile, savedItems]) => {
        setUser(profile);
        setSaved(savedItems);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleUnsave(type, id) {
    try {
      await unsaveItem(type, id);
      setSaved(prev => ({
        ...prev,
        hikes:       type === 'hike'       ? prev.hikes.filter(x => x._id !== id)       : prev.hikes,
        restaurants: type === 'restaurant' ? prev.restaurants.filter(x => x._id !== id) : prev.restaurants,
        pois:        type === 'poi'        ? prev.pois.filter(x => x._id !== id)         : prev.pois,
      }));
    } catch (err) {
      alert(err.message);
    }
  }

  function handleSignOut() {
    logoutUser();
    window.location.href = '/';
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">{t('common.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="error-banner">{error}</div>
        <button className="detail-back-btn" onClick={() => window.location.href = '/'}>← {t('common.backToTrails')}</button>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <button className="detail-back-btn" onClick={() => window.location.href = '/'}>
          {t('common.backToTrails')}
        </button>
        <h1 className="profile-title">{t('user.profile')}</h1>
        <button className="profile-signout-btn" onClick={handleSignOut}>{t('common.signOut')}</button>
      </div>

      <div className="profile-body">
        {/* Profile + Children */}
        <div className="profile-col">
          <ProfileSection user={user} onUpdate={setUser} />
          <ChildrenSection user={user} onUpdate={setUser} />

          {/* My Tracks */}
          <div className="profile-card">
            <h2 className="profile-section-title">{t('user.myTracks')}</h2>
            <p className="profile-empty-text" style={{ marginBottom: 12 }}>
              {t('user.myTracksDesc')}
            </p>
            <a href="/track" className="profile-tracks-link">{t('track.title')} →</a>
          </div>
        </div>

        {/* Saved items */}
        <div className="profile-saved-col">
          {/* Saved Hikes */}
          <div className="profile-card">
            <h2 className="profile-section-title">{t('user.savedHikes')}</h2>
            {saved.hikes.length === 0
              ? <p className="profile-empty-text">{t('user.noSaved')}</p>
              : saved.hikes.map(h => <SavedHikeCard key={h._id} hike={h} onUnsave={handleUnsave} />)
            }
          </div>

          {/* Saved POIs */}
          <div className="profile-card">
            <h2 className="profile-section-title">{t('user.savedPois')}</h2>
            {saved.pois.length === 0
              ? <p className="profile-empty-text">{t('user.noSaved')}</p>
              : saved.pois.map(p => <SavedPoiCard key={p._id} poi={p} onUnsave={handleUnsave} />)
            }
          </div>

          {/* Saved Restaurants */}
          <div className="profile-card">
            <h2 className="profile-section-title">{t('user.savedRestaurants')}</h2>
            {saved.restaurants.length === 0
              ? <p className="profile-empty-text">{t('user.noSaved')}</p>
              : saved.restaurants.map(r => <SavedRestaurantCard key={r._id} restaurant={r} onUnsave={handleUnsave} />)
            }
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
