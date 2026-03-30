import { useState, useEffect } from 'react';
import { fetchRestaurant, createRestaurant, updateRestaurant, deleteRestaurant } from '../../api/restaurants.js';
import { clearToken } from '../../api/auth.js';
import { AdminNavTabs } from './AdminRestaurants.jsx';

const EMPTY = { name: '', type: null, mountains: null, zone: null, address: null, link: null, notes: null };

function Field({ label, children, full }) {
  return (
    <div className={`form-field${full ? ' form-field-full' : ''}`}>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

export default function AdminRestaurantForm({ id }) {
  const isNew = !id;
  const [form, setForm]     = useState(EMPTY);
  const [original, setOriginal] = useState(EMPTY);
  const [loading, setLoading]   = useState(!isNew);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const isDirty = JSON.stringify(form) !== JSON.stringify(original);

  useEffect(() => {
    if (!isNew) {
      fetchRestaurant(id)
        .then((r) => { setForm(r); setOriginal(r); setLoading(false); })
        .catch((e) => { setError(e.message); setLoading(false); });
    }
  }, [id, isNew]);

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value === '' ? null : e.target.value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name) { setError('Name is required'); return; }
    setSaving(true); setError('');
    try {
      if (isNew) await createRestaurant(form);
      else await updateRestaurant(id, form);
      window.location.href = '/admin/restaurants';
    } catch (err) { setError(err.message); setSaving(false); }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${form.name}"?`)) return;
    try {
      await deleteRestaurant(id);
      window.location.href = '/admin/restaurants';
    } catch (err) { setError(err.message); }
  }

  function handleBack() {
    if (isDirty && !confirm('Ai modificari nesalvate. Esti sigur ca vrei sa pleci?')) return;
    window.location.href = '/admin/restaurants';
  }

  function handleLogout() { clearToken(); window.location.href = '/admin'; }

  if (loading) return <div className="detail-loading">Loading…</div>;

  return (
    <div className="admin-wrap">
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="admin-back-btn" onClick={handleBack}>← Back</button>
          <div>
            <div className="admin-header-title">{isNew ? 'New restaurant' : 'Edit restaurant'}</div>
            {!isNew && form.name && <div className="admin-header-sub">{form.name}</div>}
          </div>
        </div>
        <button className="admin-logout" onClick={handleLogout}>Sign out</button>
      </header>

      <div className="admin-form-content">
        {error && <div className="error-banner">⚠ {error}</div>}
        <AdminNavTabs active="restaurants" />

        <form className="admin-form-card" onSubmit={handleSave}>
          <div className="form-section-title">Details</div>
          <div className="form-grid">
            <Field label="Name *" full>
              <input type="text" value={form.name ?? ''} onChange={set('name')} placeholder="Restaurant name" required />
            </Field>
            <Field label="Type">
              <select value={form.type ?? ''} onChange={set('type')}>
                <option value="">—</option>
                <option>Restaurant</option>
                <option>Cabana</option>
                <option>Pensiune</option>
                <option>Cafenea</option>
              </select>
            </Field>
            <Field label="Mountains">
              <input type="text" value={form.mountains ?? ''} onChange={set('mountains')} placeholder="e.g. Bucegi" />
            </Field>
            <Field label="Zone">
              <input type="text" value={form.zone ?? ''} onChange={set('zone')} placeholder="e.g. Sinaia" />
            </Field>
            <Field label="Address" full>
              <input type="text" value={form.address ?? ''} onChange={set('address')} placeholder="Address or landmark" />
            </Field>
            <Field label="Link (URL)" full>
              <input type="text" value={form.link ?? ''} onChange={set('link')} placeholder="https://..." />
            </Field>
            <Field label="Notes" full>
              <textarea className="form-textarea" rows={3} value={form.notes ?? ''} onChange={set('notes')} placeholder="Any useful notes…" />
            </Field>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-form-save" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            <button type="button" className="btn btn-form-cancel" onClick={handleBack}>Cancel</button>
            {!isNew && (
              <button type="button" className="btn btn-form-delete" onClick={handleDelete}>Delete</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
