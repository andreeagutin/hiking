import React, { useState, useEffect } from 'react';
import HeroSearch from './components/HeroSearch.jsx';
import HikeCard from './components/HikeCard.jsx';
import HikeDetail from './components/HikeDetail.jsx';
import StatsPage from './components/StatsPage.jsx';
import AdminLogin from './components/admin/AdminLogin.jsx';
import AdminPanel from './components/admin/AdminPanel.jsx';
import AdminHikeForm from './components/admin/AdminHikeForm.jsx';
import AdminRestaurants from './components/admin/AdminRestaurants.jsx';
import AdminRestaurantForm from './components/admin/AdminRestaurantForm.jsx';
import { fetchHikes } from './api/hikes.js';
import { isLoggedIn } from './api/auth.js';

const EMPTY_FILTERS = { q: '', status: '', difficulty: '', mountains: '', zone: '', tip: '' };

const pathname = window.location.pathname;
const hikeDetailMatch       = pathname.match(/^\/hike\/([^/]+)$/);
const adminEditMatch        = pathname.match(/^\/admin\/hike\/([^/]+)\/edit$/);
const adminRestaurantEdit   = pathname.match(/^\/admin\/restaurant\/([^/]+)\/edit$/);
const isAdminNewRoute       = pathname === '/admin/hike/new';
const isAdminRestaurantsRoute = pathname === '/admin/restaurants';
const isAdminNewRestaurant  = pathname === '/admin/restaurant/new';
const isStatsRoute          = pathname === '/stats';
const isAdminRoute          = pathname === '/admin' || !!adminEditMatch || isAdminNewRoute
  || isAdminRestaurantsRoute || !!adminRestaurantEdit || isAdminNewRestaurant;

function AdminAuthGate({ children }) {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  if (!loggedIn) return <AdminLogin onSuccess={() => setLoggedIn(true)} />;
  return children;
}

function PublicApp() {
  const [hikes, setHikes]   = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [error, setError]   = useState('');

  useEffect(() => {
    fetchHikes().then(setHikes).catch((e) => setError(e.message));
  }, []);

  const filtered = hikes.filter((h) => {
    if (filters.status     && h.status     !== filters.status)     return false;
    if (filters.difficulty && h.difficulty !== filters.difficulty) return false;
    if (filters.mountains  && h.mountains  !== filters.mountains)  return false;
    if (filters.zone       && h.zone       !== filters.zone)       return false;
    if (filters.tip        && h.tip        !== filters.tip)        return false;
    if (filters.q) {
      const q = filters.q.toLowerCase();
      if (!Object.values(h).join(' ').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <>
      <HeroSearch filters={filters} onChange={setFilters} hikes={hikes} />

      <div className="page-content">
        {error && <div className="error-banner">⚠ {error}</div>}
        <div className="results-bar">
          {filtered.length === hikes.length
            ? `${hikes.length} trails`
            : `${filtered.length} of ${hikes.length} trails`}
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🥾</div>
            <div className="empty-state-text">No hikes match your filters.</div>
          </div>
        ) : (
          <div className="hike-grid">
            {filtered.map((h) => <HikeCard key={h._id} hike={h} />)}
          </div>
        )}
      </div>
    </>
  );
}

export default function App() {
  if (hikeDetailMatch)        return <HikeDetail id={hikeDetailMatch[1]} />;
  if (isStatsRoute)           return <StatsPage />;
  if (isAdminNewRoute)        return <AdminAuthGate><AdminHikeForm /></AdminAuthGate>;
  if (adminEditMatch)         return <AdminAuthGate><AdminHikeForm id={adminEditMatch[1]} /></AdminAuthGate>;
  if (isAdminNewRestaurant)   return <AdminAuthGate><AdminRestaurantForm /></AdminAuthGate>;
  if (adminRestaurantEdit)    return <AdminAuthGate><AdminRestaurantForm id={adminRestaurantEdit[1]} /></AdminAuthGate>;
  if (isAdminRestaurantsRoute) return <AdminAuthGate><AdminRestaurants /></AdminAuthGate>;
  if (isAdminRoute)           return <AdminAuthGate><AdminPanel /></AdminAuthGate>;
  return <PublicApp />;
}
