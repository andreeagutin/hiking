import { useState, useEffect } from 'react';
import HeroSearch from './components/HeroSearch.jsx';
import HikeCard from './components/HikeCard.jsx';
import HikeDetail from './components/HikeDetail.jsx';
import StatsPage from './components/StatsPage.jsx';
import AdminLogin from './components/admin/AdminLogin.jsx';
import AdminPanel from './components/admin/AdminPanel.jsx';
import AdminHikeForm from './components/admin/AdminHikeForm.jsx';
import AdminRestaurants from './components/admin/AdminRestaurants.jsx';
import AdminRestaurantForm from './components/admin/AdminRestaurantForm.jsx';
import AdminCaves from './components/admin/AdminCaves.jsx';
import AdminCaveForm from './components/admin/AdminCaveForm.jsx';
import CaveDetail from './components/CaveDetail.jsx';
import { fetchHikes } from './api/hikes.js';
import { isLoggedIn } from './api/auth.js';


const pathname = window.location.pathname;
const hikeDetailMatch       = pathname.match(/^\/hike\/([^/]+)$/);
const adminEditMatch        = pathname.match(/^\/admin\/hike\/([^/]+)\/edit$/);
const adminRestaurantEdit   = pathname.match(/^\/admin\/restaurant\/([^/]+)\/edit$/);
const adminCaveEdit         = pathname.match(/^\/admin\/cave\/([^/]+)\/edit$/);
const isAdminNewRoute       = pathname === '/admin/hike/new';
const isAdminRestaurantsRoute = pathname === '/admin/restaurants';
const isAdminNewRestaurant  = pathname === '/admin/restaurant/new';
const isAdminCavesRoute     = pathname === '/admin/caves';
const isAdminNewCave        = pathname === '/admin/cave/new';
const isStatsRoute          = pathname === '/stats';
const caveDetailMatch       = pathname.match(/^\/cave\/([^/]+)$/);
const isAdminRoute          = pathname === '/admin' || !!adminEditMatch || isAdminNewRoute
  || isAdminRestaurantsRoute || !!adminRestaurantEdit || isAdminNewRestaurant
  || isAdminCavesRoute || !!adminCaveEdit || isAdminNewCave;

function AdminAuthGate({ children }) {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  if (!loggedIn) return <AdminLogin onSuccess={() => setLoggedIn(true)} />;
  return children;
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchDrivingDistances(userLoc, hikes) {
  const targets = hikes.filter((h) => h.startLat != null && h.startLng != null);
  if (!targets.length) return {};

  const coords = [
    `${userLoc.lng},${userLoc.lat}`,
    ...targets.map((h) => `${h.startLng},${h.startLat}`),
  ].join(';');

  const url = `https://router.project-osrm.org/table/v1/driving/${coords}?sources=0&annotations=duration,distance`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('OSRM error');
  const data = await res.json();
  const distances = data.distances[0]; // metres from source to each destination
  const durations = data.durations[0]; // seconds from source to each destination

  const distanceMap = {};
  const durationMap = {};
  targets.forEach((h, i) => {
    const metres = distances[i + 1]; // index 0 is source→source = 0
    const secs   = durations[i + 1];
    distanceMap[h._id] = metres != null ? metres / 1000 : null;
    durationMap[h._id] = secs != null ? secs : null;
  });
  return { distanceMap, durationMap };
}

function PublicApp() {
  const [hikes, setHikes]                     = useState([]);
  const [error, setError]                     = useState('');
  const [drivingMap, setDrivingMap]           = useState({});
  const [drivingDurationMap, setDrivingDurationMap] = useState({});
  const [aiFilters, setAiFilters]             = useState(null);
  const [aiExplanation, setAiExplanation]     = useState('');
  const [userLocation, setUserLocation] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('userLocation')); } catch { return null; }
  });

  useEffect(() => {
    fetchHikes().then(setHikes).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!userLocation || !hikes.length) { setDrivingMap({}); setDrivingDurationMap({}); return; }
    fetchDrivingDistances(userLocation, hikes)
      .then(({ distanceMap, durationMap }) => {
        setDrivingMap(distanceMap);
        setDrivingDurationMap(durationMap);
      })
      .catch(() => { setDrivingMap({}); setDrivingDurationMap({}); }); // fallback to haversine on error
  }, [userLocation, hikes]);

  function handleLocationChange(loc) {
    setUserLocation(loc);
    if (loc) sessionStorage.setItem('userLocation', JSON.stringify(loc));
    else sessionStorage.removeItem('userLocation');
  }

  const filtered = hikes.filter((h) => {
    if (!aiFilters) return true;
    if (aiFilters.maxHikeHours   != null && h.time     > aiFilters.maxHikeHours)   return false;
    if (aiFilters.minHikeHours   != null && h.time     < aiFilters.minHikeHours)   return false;
    if (aiFilters.maxDistanceKm  != null && h.distance > aiFilters.maxDistanceKm)  return false;
    if (aiFilters.minDistanceKm  != null && h.distance < aiFilters.minDistanceKm)  return false;
    if (aiFilters.maxElevationUp != null && h.up       > aiFilters.maxElevationUp) return false;
    if (aiFilters.difficulty && h.difficulty !== aiFilters.difficulty) return false;
    if (aiFilters.mountains  && h.mountains  !== aiFilters.mountains)  return false;
    if (aiFilters.zone       && h.zone       !== aiFilters.zone)       return false;
    if (aiFilters.tip        && h.tip        !== aiFilters.tip)        return false;
    if (aiFilters.status     && h.status     !== aiFilters.status)     return false;
    if (aiFilters.maxDriveHours != null && userLocation) {
      const secs = drivingDurationMap[h._id];
      if (secs != null && secs > aiFilters.maxDriveHours * 3600) return false;
    }
    return true;
  });

  return (
    <>
      <HeroSearch
        hikes={hikes}
        userLocation={userLocation} onLocationChange={handleLocationChange}
        aiExplanation={aiExplanation}
        onAiSearch={(f, explanation) => { setAiFilters(f); setAiExplanation(explanation); }}
        onAiClear={() => { setAiFilters(null); setAiExplanation(''); }}
      />

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
            {filtered.map((h) => (
              <HikeCard key={h._id} hike={h}
                distance={userLocation && h.startLat && h.startLng
                  ? (drivingMap[h._id] ?? haversineKm(userLocation.lat, userLocation.lng, h.startLat, h.startLng))
                  : null}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function App() {
  if (hikeDetailMatch)        return <HikeDetail id={hikeDetailMatch[1]} />;
  if (caveDetailMatch)        return <CaveDetail id={caveDetailMatch[1]} />;
  if (isStatsRoute)           return <StatsPage />;
  if (isAdminNewRoute)        return <AdminAuthGate><AdminHikeForm /></AdminAuthGate>;
  if (adminEditMatch)         return <AdminAuthGate><AdminHikeForm id={adminEditMatch[1]} /></AdminAuthGate>;
  if (isAdminNewRestaurant)   return <AdminAuthGate><AdminRestaurantForm /></AdminAuthGate>;
  if (adminRestaurantEdit)    return <AdminAuthGate><AdminRestaurantForm id={adminRestaurantEdit[1]} /></AdminAuthGate>;
  if (isAdminRestaurantsRoute) return <AdminAuthGate><AdminRestaurants /></AdminAuthGate>;
  if (isAdminNewCave)         return <AdminAuthGate><AdminCaveForm /></AdminAuthGate>;
  if (adminCaveEdit)          return <AdminAuthGate><AdminCaveForm id={adminCaveEdit[1]} /></AdminAuthGate>;
  if (isAdminCavesRoute)      return <AdminAuthGate><AdminCaves /></AdminAuthGate>;
  if (isAdminRoute)           return <AdminAuthGate><AdminPanel /></AdminAuthGate>;
  return <PublicApp />;
}
