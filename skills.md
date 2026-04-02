# Trail Mix — What Was Built & How

A step-by-step reference of every feature in this project — useful for rebuilding from scratch or extending.

---

## 1. Project Bootstrap

**Stack chosen:** React + Vite (frontend) + Express (backend) — both running locally with `concurrently`.

```bash
npm create vite@latest hiking -- --template react
cd hiking
npm install express mongoose dotenv cors concurrently nodemon jsonwebtoken
```

**package.json scripts:**
```json
"dev":    "concurrently \"npm run server\" \"npm run client\"",
"server": "nodemon --watch server server/index.js",
"client": "vite"
```

`--watch server` prevents nodemon from restarting on `.env` or `src/` changes.

**Vite proxy** (`vite.config.js`) — forwards `/api` to Express so frontend can call `/api/hikes` without CORS issues:
```js
server: { proxy: { '/api': 'http://localhost:3001' } }
```

---

## 2. MongoDB Atlas Connection

- Cluster: `HikingDb`
- Database: `hikingDb` (case-sensitive)
- Collection: `hikes` (auto-created by Mongoose)

Connection string format:
```
mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/hikingDb?retryWrites=true&w=majority
```

Special chars in password must be percent-encoded (`#` → `%23`) in the URI only.

`server/db.js` uses `mongoose.connect(process.env.MONGODB_URI)` — called before `app.listen()`.

---

## 3. Hike Data Model

`server/models/Hike.js` — Mongoose schema with `timestamps: true`.

Fields: `name`, `time`, `distance`, `tip`, `up`, `down`, `difficulty`, `mountains`, `status`, `completed`, `zone`, `imageUrl`, `description`, `history`, `restaurants`.

- All fields except `name` are optional (default `null`)
- `description` — free-text String, shown on the public detail page
- `imageUrl` — Cloudinary URL, used in carousel and detail hero
- `completed` — String stored as `YYYY-MM-DD`; displayed as `DD-MM-YYYY` in admin, `DD-Mon-YYYY` in public
- `history` — array of subdocuments: `{ time, is_hike, distance, up, down, updatedAt }`
- `restaurants` — array of ObjectId refs to `Restaurant` collection; populated on `GET /api/hikes/:id`

To seed the database:
```bash
npm run seed   # runs data/seed.js once
```

---

## 4. REST API (Express)

`server/routes/hikes.js`:
- `GET /api/hikes` — public, returns all hikes sorted by `createdAt`
- `GET /api/hikes/:id` — public, returns single hike
- `POST /api/hikes` — protected
- `PUT /api/hikes/:id` — protected
- `DELETE /api/hikes/:id` — protected

`server/routes/upload.js`:
- `POST /api/upload` — protected, accepts `multipart/form-data`, uploads to Cloudinary via `multer-storage-cloudinary`, returns `{ url }`

Protected routes use the `requireAuth` middleware (`server/middleware/auth.js`) which validates the `Authorization: Bearer <token>` header.

---

## 5. JWT Authentication

**Server side** (`server/routes/auth.js`):
- `POST /api/auth/login` — compares credentials against `ADMIN_USER` / `ADMIN_PASS` from `.env`
- On success: signs a JWT with `JWT_SECRET`, expires in 8h
- Wrap `jwt.sign()` in try/catch — if `JWT_SECRET` is undefined it throws silently

**Client-side** (`src/api/auth.js`):
- `login()` — POST to `/api/auth/login`, stores token in `localStorage`
- `isLoggedIn()` — decodes JWT payload (base64), checks `exp` against `Date.now()`
- `getToken()` — used by `src/api/hikes.js` to attach `Authorization` header

---

## 6. Public Interface (`/`)

**`App.jsx`** — checks `window.location.pathname`. Routes: `/`, `/hike/:id`, `/admin`, `/admin/hike/:id/edit`, `/admin/hike/new`.

**`HeroSearch.jsx`** — hero section with dark purple gradient background, search input, 5 filter dropdowns (status, difficulty, mountains, zone, trip type), and live stats (trails count, completed, km hiked).

**`HikingTable.jsx`** — card grid, read-only. Each card links to `/hike/:id`.

**`HikeDetail.jsx`** — full detail page with hero image, badges, stats grid, and description paragraph.

**Filtering** done client-side in `App.jsx` after fetching all hikes once on mount.

---

## 7. Carousel (`HikeCarousel.jsx`)

- Only renders if at least one hike has `imageUrl` set
- Shows gradient background cards as placeholders until real photos are added
- Auto-advances every 5 seconds via `setInterval` in `useEffect`
- Side peek cards show prev/next hike
- **Rules of Hooks:** early `return null` must come AFTER all `useState`/`useEffect`/`useCallback` calls

To add a photo to a hike: upload via Admin Panel (Cloudinary upload button).

---

## 8. Admin Panel (`/admin`)

Routing is handled without react-router — `App.jsx` reads `window.location.pathname`:

```jsx
if (path === '/admin') → AdminPanel
if (path.startsWith('/admin/hike/')) → AdminHikeForm
```

Flow:
1. Navigate to `/admin`
2. `isLoggedIn()` checks localStorage token expiry
3. If not logged in → `AdminLogin` form
4. On success → token saved → `AdminPanel` renders

**`AdminPanel.jsx`** — CRUD table. Each row shows a thumbnail (88×56px) as first column. Clicking a row navigates to the edit form.

**`AdminHikeForm.jsx`** — edit/create form with:
- All hike fields including `description` (textarea)
- Cloudinary image upload with preview
- Prev/Next arrow navigation (fetches full hike list, finds current index)
- Unsaved changes guard: `isDirty` = `JSON.stringify(form) !== JSON.stringify(original)` — triggers confirm dialog on Back, Cancel, or arrow navigation
- `step="any"` on number inputs to allow any decimal value
- **History section** — table of past entries with inline add/edit form; each entry saved via separate `POST/PUT/DELETE /api/hikes/:id/history/:entryId` requests without affecting the main form save
- **Restaurants section** in hike edit form — checklist of all restaurants; toggling a checkbox updates `form.restaurants` (array of IDs); saved with main form via `PUT /api/hikes/:id`
- **Date format**: date fields use `type="text"` displaying `DD-MM-YYYY`. Helpers `toDisplay()` / `fromDisplay()` convert to/from `YYYY-MM-DD` (storage format). Legacy `dd/mm/yyyy` strings converted on load via `toInputDate()`. Never use `type="date"` — browser locale overrides the display format unpredictably

---

## 9. Cloudinary Image Upload

Install:
```bash
npm install cloudinary multer multer-storage-cloudinary
```

`server/routes/upload.js` — configures `CloudinaryStorage` with `allowed_formats: ['jpg','jpeg','png','webp']`, uses `multer` as middleware, returns `{ url: req.file.path }`.

`src/api/upload.js` — `uploadImage(file)` posts `FormData` with Bearer token.

---

## 10. Design System

All in `src/index.css`. No external CSS library.

**Color palette:**
- Purple theme (hero, admin header, primary buttons): `#1e1b4b → #2e1065 → #3b0764`
- Purple accent: `#7c3aed` (buttons, focus rings)
- Purple light: `#c4b5fd` (subtext on dark), `#f5f3ff` (hover bg)
- `--forest-*`: greens for Done/difficulty badges
- `--neutral-*`: grays for text, borders, backgrounds
- `--amber-*`: In Progress badge
- `--red-*`: delete / error states

**Key sections in index.css:**
- `:root` — design tokens (colors, radii, shadows, transitions)
- `.hero` — full-width purple gradient with search + filters
- `.admin-header` — purple gradient header (same palette as hero)
- `.admin-hike-nav` — prev/next pill in edit form header
- `.form-textarea` — description textarea with purple focus ring
- `.detail-description` — paragraph with `pre-wrap` for line breaks
- `.admin-thumb` / `.admin-thumb-placeholder` — 88×56 thumbnail in table
- `.badge` — pill badges for status and difficulty
- `.toast` — fixed bottom-right notification

---

## 11. Stats Page (`/stats`)

Install Recharts:
```bash
npm install recharts
```

`src/components/StatsPage.jsx` — fetches all hikes on mount, aggregates client-side:
- **Summary cards**: total km, elevation gain (m), hours on trail, completed trail count
- **Charts**: status breakdown (PieChart), difficulty breakdown (PieChart), hiking by month (BarChart), distance by mountains (BarChart)
- Hikes with no `completed` date are excluded from the monthly chart

Linked from `HeroSearch.jsx` via "View stats →" button.

---

## 12. Trail Starting Point Map

Admin hike form includes an interactive Leaflet map (`react-leaflet`) to set `startLat` / `startLng`:

```bash
npm install react-leaflet leaflet
```

- Click on map → coordinates stored in form state → saved with hike
- Default center: Romania (`45.9432, 24.9668`), zoom 7
- Marker shown when coordinates set; "Clear point" button removes them
- Used by `WeatherForecast` and OSRM distance calculation

---

## 13. User Location & Driving Distances

`App.jsx` — `fetchDrivingDistances(userLoc, hikes)`:
1. Filters hikes that have `startLat`/`startLng`
2. Sends a single OSRM Table API request: `router.project-osrm.org/table/v1/driving/{coords}?sources=0&annotations=distance`
3. Returns a map `{ hikeId → km }` used to render "X km away" on cards
4. Falls back to straight-line Haversine when OSRM fails

User location is obtained via:
- Browser `navigator.geolocation`
- Or city name → Nominatim geocoding (`nominatim.openstreetmap.org/search`)

Location persisted in `sessionStorage` so it survives detail page navigation.

---

## 14. Weather Forecast

`src/components/WeatherForecast.jsx` — shown on `HikeDetail` when `startLat`/`startLng` are set.

- Fetches from Open-Meteo (`api.open-meteo.com`) — free, no API key
- Displays a 7-day forecast strip: date, weather icon, min/max temp
- Weekend days (Sat/Sun) are visually highlighted with a different background
- WMO weather code mapped to emoji + label via local lookup table

---

## 15. Mapy.cz Trail Map

Admin hike form has a "Trail map" textarea. Paste the `<iframe>` embed code from Mapy.cz.

`HikeDetail.jsx` renders the map:
```jsx
src={hike.mapUrl.replace(/^https?:\/\/(www\.|en\.)?mapy\.(cz|com)/, 'https://frame.mapy.cz')}
```
The domain rewrite is needed because only `frame.mapy.cz` allows embedding.

---

## 16. Markdown Description Editor

`AdminHikeForm.jsx` — description field uses a rich markdown editor (toolbar buttons for bold, italic, headings, lists, links, etc.).

`HikeDetail.jsx` renders via `marked`:
```bash
npm install marked
```
```jsx
<div dangerouslySetInnerHTML={{ __html: marked.parse(hike.description) }} />
```

---

## 17. Caves

New collection alongside hikes and restaurants.

**Model** (`server/models/Cave.js`):
```js
{ name, photos: [String], mainPhoto, mountains, development, verticalExtent, altitude, rockType, lat, lng }
```

**API** (`server/routes/caves.js`): full CRUD at `/api/caves`, all mutating routes protected.

**Admin:**
- `AdminCaves.jsx` — list/search/delete table at `/admin/caves`
- `AdminCaveForm.jsx` — edit/create form: photo gallery (multiple uploads), Leaflet map for entrance with **location search** (Nominatim geocoding + `map.flyTo()`), fields for all cave stats

**Public:**
- `CaveDetail.jsx` — hero (photo or dark blue gradient), stats grid, photo gallery grid, **photo lightbox** (click to open full-size, close with ✕ or Escape), **coordinates** displayed with Google Maps link, **weather forecast** via `WeatherForecast.jsx` when `lat`/`lng` set, linked hikes list
- `HikeDetail.jsx` — "Nearby caves" section shows linked cave cards

**Linking:** `Hike.caves` is an array of ObjectIds populated on `GET /api/hikes/:id`. In the hike edit form, a checklist lets the admin toggle which caves are linked.

**Cave photo gallery:** multiple Cloudinary uploads stored in `photos[]`; `mainPhoto` is shown in hero and admin thumbnail. In the detail page, all photos render as a grid of thumbnails that open in a lightbox overlay.

---

## 18. Restaurants

`server/models/Restaurant.js` — separate Mongoose collection with fields: `name` (required), `type` (enum), `mountains`, `zone`, `address`, `link`, `notes`.

`server/routes/restaurants.js` — full CRUD, all mutating routes protected. Registered in `server/index.js` as `/api/restaurants`.

**Admin pages:**
- `AdminRestaurants.jsx` — list/delete table at `/admin/restaurants`. Creates with placeholder name `"New restaurant"` to satisfy `required` validation (empty string fails Mongoose required check).
- `AdminRestaurantForm.jsx` — edit/create form at `/admin/restaurant/:id/edit`
- `AdminNavTabs` — shared component exported from `AdminRestaurants.jsx`, used in both `AdminPanel` and `AdminRestaurants` for tab navigation (Hikes | Restaurants)

**Public:** `HikeDetail.jsx` shows linked restaurants as cards (name, type badge, zone, address, notes, link) in a "Nearby restaurants" section.

**Linking:** `Hike.restaurants` is an array of ObjectIds. On `GET /api/hikes/:id`, Mongoose `.populate('restaurants')` resolves them. In the hike edit form, a checklist lets the admin toggle which restaurants are linked; saved with the main hike save.

---

## 19. i18n (Dual-Language: RO + EN)

`src/i18n.js` — single source of truth for all UI strings. Two full translation sets: `ro` and `en`.

```js
import t, { setLang, getLang } from '../i18n.js';
t('stat.distance')                    // → 'Distance' (en) or 'Distanță' (ro)
t('weather.forecastLabel', { n: 7 }) // → '7-day forecast · near trailhead'
```

- `TRANSLATIONS` object has two keys: `'ro'` and `'en'`, each containing all UI keys
- `t(key, vars)` resolves against current language, falls back to `en`, then returns the key itself
- `setLang('ro')` — updates module-level `_lang`, saves to `localStorage`, dispatches `window` event `'langchange'`
- `getLang()` — returns current language string
- Components that render translated strings must call `useLang()` from `src/hooks/useLang.js` to re-render on language change
- `useLang()` hook subscribes to `'langchange'` via `addEventListener` in `useEffect`; returns the current lang string
- Language defaults to `'en'`; persisted across page loads via `localStorage` key `lang`
- Never hardcode display strings in components — always use `t('key')`

---

## 20. Branding (Logo + Favicon)

**Favicon:** `public/favicon.svg` — custom SVG of a hiker with backpack and hiking stick, in forest green palette. Referenced in `index.html` as `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`. Also used inline in the admin header as `<img src="/favicon.svg">`.

**Logo:** `public/logo.svg` — Trail Mix wordmark/logo. Displayed in the hero section:
```jsx
<img src="/logo.svg" alt="Trail Mix" style={{ height: '2.4rem', verticalAlign: 'middle' }} />
```
Both files live in `public/` so Vite serves them at root (`/favicon.svg`, `/logo.svg`) without import handling.

---

## 21. Cave Map Location Search (AdminCaveForm)

The Leaflet map in `AdminCaveForm.jsx` includes a text search input above the map so admins can navigate to a location by name instead of panning manually.

**Flow:**
1. Admin types a location name into the search box
2. On submit: `fetch` to `nominatim.openstreetmap.org/search?q=...&format=json&limit=1`
3. If found: `setFlyTarget([lat, lng])` — a `FlyTo` component reads this and calls `map.flyTo(target, 14)`
4. Admin then clicks the map to drop the marker at the exact entrance point

**`FlyTo` component pattern** — needed because `map.flyTo()` must be called from inside the Leaflet context:
```jsx
function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => { if (target) map.flyTo(target, 14); }, [target, map]);
  return null;
}
```

The same Nominatim + `map.flyTo` pattern is reusable for the hike starting point map.

---

## 22. AI-Powered Natural Language Search

Users can describe a hike in plain language (Romanian or English) and get filtered results.

**Install:**
```bash
npm install @anthropic-ai/sdk
```

**Backend** (`server/routes/aiSearch.js`):
- `POST /api/ai-search` — public endpoint (no auth required)
- Validates input: `query` required, max 500 chars
- Calls `client.messages.create()` with model `claude-haiku-4-5-20251001`, `max_tokens: 512`
- System prompt instructs Claude to return ONLY a JSON object with filter fields — no markdown wrappers
- Strips any accidental ` ```json ``` ` wrappers before `JSON.parse()`
- Returns `{ filters, explanation }` — explanation is in the same language as the query

**Filter fields Claude returns:**
```js
{ maxHikeHours, minHikeHours, maxDistanceKm, minDistanceKm, maxElevationUp,
  difficulty, mountains, zone, tip, status, maxDriveHours, explanation }
```

**Frontend** (`src/api/aiSearch.js`):
```js
export async function askAI(query, availableMountains, availableZones) {
  const res = await fetch('/api/ai-search', { method: 'POST', ... });
  return res.json(); // { filters, explanation }
}
```

**`AiSearch` component** (inside `HeroSearch.jsx`):
- Separate search bar from the regular text search, below it in the hero
- On submit: calls `askAI()`, passes result up via `onAiSearch(filters, explanation)` prop
- When active: shows an explanation pill with a clear (×) button
- `maxDriveHours` filter is applied client-side against OSRM distances — shows a note if location not set

**`App.jsx` filtering:** AI filters are applied on top of regular filters. `maxDriveHours` is ignored when `drivingDistances` map is empty.

**Requires:** `ANTHROPIC_API_KEY` in `.env`

---

## 23. Romanian i18n + RO/EN Language Switcher

Added full Romanian translation set alongside English, plus a live language switcher in the hero.

**`LangSwitcher` component** (inside `HeroSearch.jsx`):
```jsx
function LangSwitcher() {
  const lang = useLang();
  return (
    <div className="lang-switcher">
      <button className={`lang-btn${lang === 'ro' ? ' active' : ''}`} onClick={() => setLang('ro')}>RO</button>
      <span className="lang-sep">|</span>
      <button className={`lang-btn${lang === 'en' ? ' active' : ''}`} onClick={() => setLang('en')}>EN</button>
    </div>
  );
}
```

Rendered top-right of the hero, in a flex row with the logo (`hero-top-row` class).

**Reactivity pattern:** `setLang()` dispatches `new Event('langchange')` on `window`. Components subscribe via `useLang()` hook which calls `useState(getLang)` and adds/removes the event listener in `useEffect`. Any component that renders `t()` strings must call `useLang()` at the top — otherwise it won't re-render when language changes.

**All admin strings are also translated** — so switching language affects both public and admin UI.

---

## 24. Common Issues & Fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| `EADDRINUSE :3001` | Old Node process still running | `cmd //c "taskkill /F /IM node.exe"` |
| `Invalid namespace: /.hikes` | Missing DB name in URI | Add `/hikingDb` before `?` in `MONGODB_URI` |
| `.env` changes not picked up | nodemon only watches `server/` | Full restart: Ctrl+C → `npm run dev` |
| JWT sign empty response | `JWT_SECRET` undefined | Check `.env` has `JWT_SECRET=...`, restart server |
| Carousel hook order error | `return null` before hooks | Move early return AFTER all hook calls |
| `#` in password fails URI | `#` = fragment in URLs | Use `%23` in `MONGODB_URI`, plain `#` in `ADMIN_PASS` |
| Number input validation error | `step` attribute restricts values | Use `step="any"` to allow any decimal |
| Date input shows MM/DD/YYYY | `type="date"` uses browser locale | Use `type="text"` + `toDisplay()`/`fromDisplay()` helpers instead |
| "Failed to create restaurant" on add | Empty `name` fails Mongoose `required` | Create with placeholder `"New restaurant"`, not `""` |
| AI search returns 500 | `ANTHROPIC_API_KEY` missing or invalid | Check `.env`, restart server (nodemon doesn't watch `.env`) |
| AI search `maxDriveHours` ignored | User location not set, no OSRM data | Show note in `AiSearch` component prompting user to set location |
| Language doesn't switch in a component | Component doesn't call `useLang()` | Add `useLang()` call at top of component to subscribe to `langchange` event |
| Cave map doesn't fly to searched location | `FlyTo` not inside `MapContainer` | `FlyTo` must be rendered as a child of `<MapContainer>`, not outside |
