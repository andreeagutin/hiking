# Hike'n'Seek — Project Guide for Claude

## Overview
A full-stack hiking trail tracker branded **Hike'n'Seek**. Users browse hikes and points of interest publicly (read-only). An admin at `/admin` manages all data (CRUD) behind JWT authentication. User accounts with family profiles are supported.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite |
| Backend | Node.js, Express (ESM) |
| Database | MongoDB Atlas via Mongoose |
| Auth | JWT — admin (8h, `JWT_SECRET`) + user accounts (30d, `JWT_USER_SECRET` or fallback to `JWT_SECRET`) |
| Dev runner | `concurrently` + `nodemon` |
| Styling | Plain CSS (no framework) |
| Charts | Recharts |
| Maps | Leaflet (admin), Mapy.cz iframe (public) |
| Weather | Open-Meteo API |
| Distances | OSRM (driving distance) |
| AI Search | Claude Haiku (`claude-haiku-4-5-20251001`) via Anthropic SDK |
| i18n | Custom `src/i18n.js` — `t('key')` helper, RO/EN dual-language |
| Security | `helmet`, `express-rate-limit` |
| API Docs | Swagger UI (`swagger-ui-express`) at `/api-docs` |
| Analytics | Google Analytics (gtag.js injected in `index.html`) |
| PWA | Web app manifest (`public/manifest.json`), installable |

## Project Structure
```text
hiking/
├── server/
│   ├── index.js              # Express entry point + helmet + rate limiting
│   ├── db.js                 # MongoDB connection
│   ├── middleware/
│   │   └── auth.js           # requireAuth (admin JWT) + requireUserAuth (user JWT)
│   ├── models/
│   │   ├── Hike.js           # Mongoose schema (hikes) — includes slug, pois ref
│   │   ├── Restaurant.js     # Mongoose schema (restaurants)
│   │   ├── Poi.js            # Mongoose schema (points of interest: caves + other POIs)
│   │   └── User.js           # User accounts: email, passwordHash, children[], subscription
│   ├── routes/
│   │   ├── auth.js           # POST /api/auth/login (admin)
│   │   ├── hikes.js          # GET/POST/PUT/DELETE /api/hikes + history sub-routes
│   │   ├── restaurants.js    # GET/POST/PUT/DELETE /api/restaurants
│   │   ├── poi.js            # GET/POST/PUT/DELETE /api/poi (ObjectId or slug lookup)
│   │   ├── users.js          # POST register/login, GET/PUT /me, GET /me/subscription
│   │   ├── mountains.js      # GET /api/mountains (static Romanian mountains list)
│   │   ├── upload.js         # POST /api/upload (Cloudinary)
│   │   ├── sitemap.js        # GET /sitemap.xml (auto-generated sitemap)
│   │   └── aiSearch.js       # POST /api/ai-search (Claude Haiku natural language search)
│   ├── swagger.js            # OpenAPI 3.0 spec (served at /api-docs via swagger-ui-express)
│   ├── utils/
│   │   └── slugify.js        # Slug generation + uniqueness helper
│   └── data/
│       └── mountains-ro.js   # Static list of Romanian mountain ranges
├── src/
│   ├── App.jsx               # Root router (pathname-based, no react-router)
│   ├── index.css             # All styles (design tokens + components)
│   ├── i18n.js               # UI translations — t('key'), setLang(), getLang(); RO + EN
│   ├── api/
│   │   ├── auth.js           # login(), getToken(), isLoggedIn()
│   │   ├── hikes.js          # fetchHikes(), fetchHike(), createHike(), updateHike(), deleteHike()
│   │   ├── restaurants.js    # CRUD helpers for restaurants
│   │   ├── poi.js            # fetchPois(), fetchPoi(), createPoi(), updatePoi(), deletePoi()
│   │   ├── upload.js         # uploadImage()
│   │   └── aiSearch.js       # askAI(query, mountains, zones) → { filters, explanation }
│   ├── hooks/
│   │   └── useLang.js        # React hook — returns current lang, re-renders on 'langchange' event
│   └── components/
│       ├── HeroSearch.jsx    # Hero section with AI search, location widget, RO/EN switcher
│       ├── HikeCard.jsx      # Hike card with hover overlay stat bars + family/bear chips
│       ├── HikeDetail.jsx    # Full hike detail page (/hike/:slug-or-id) — includes JSON-LD
│       ├── PoiDetail.jsx     # POI detail page (/poi/:slug-or-id) — includes JSON-LD
│       ├── StatsPage.jsx     # Stats page (/stats) with Recharts
│       ├── WeatherForecast.jsx # 7-day forecast via Open-Meteo
│       ├── HikeCarousel.jsx  # Auto-sliding carousel (hikes with photos)
│       ├── HikeRow.jsx       # Table row component (view + edit modes)
│       ├── HikingTable.jsx   # Sortable/filterable hike table
│       ├── Controls.jsx      # Filter bar (text search, difficulty, mountains, zone, tip)
│       ├── AgeFilter.jsx     # Age-range quick filter UI
│       ├── FeaturesSection.jsx # Feature highlights section on homepage
│       ├── SiteFooter.jsx    # Site-wide footer with links to info pages
│       ├── CookieBanner.jsx  # GDPR cookie consent banner (shown on all non-admin pages)
│       ├── InfoPage.jsx      # Generic wrapper for static info pages
│       ├── AboutPage.jsx           # /about
│       ├── SafetyTipsPage.jsx      # /safety-tips
│       ├── GearGuidePage.jsx       # /gear-guide
│       ├── TrailMapPage.jsx        # /trail-map
│       ├── SubmitTrailPage.jsx     # /submit-trail
│       ├── ReportIssuePage.jsx     # /report-issue
│       ├── FamilyFriendlyPage.jsx  # /family-friendly
│       └── MountainViewsPage.jsx   # /mountain-views
│       └── admin/
│           ├── AdminLogin.jsx        # Login form
│           ├── AdminPanel.jsx        # Hikes CRUD table
│           ├── AdminHikeForm.jsx     # Edit/create hike form with prev/next nav
│           ├── AdminRestaurants.jsx  # Restaurants list + shared AdminNavTabs component
│           ├── AdminRestaurantForm.jsx # Edit/create restaurant form
│           ├── AdminPoi.jsx          # POI CRUD table
│           ├── AdminPoiForm.jsx      # Edit/create POI form with Leaflet map + location search
│           └── ConfirmModal.jsx      # Reusable confirm dialog
├── public/
│   ├── favicon.svg           # SVG hiker icon (used in browser tab + admin header)
│   ├── logo.svg              # Hike'n'seek wordmark/logo (displayed in hero)
│   └── hiking_markers/       # 15 SVG trail marker files served statically
├── hiking_markers/           # Source copies of SVG trail markers
├── data/
│   ├── seed.js               # One-time DB seed script
│   └── migrate-active.js     # Migration utility
├── .env                      # Never commit this
├── vite.config.js
└── package.json
```

## Environment Variables (.env)
```
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<dbName>?retryWrites=true&w=majority&appName=<appName>
PORT=3001
JWT_SECRET=<random_strong_string>
JWT_USER_SECRET=<another_strong_string>   # optional; falls back to JWT_SECRET if not set
ADMIN_USER=admin
ADMIN_PASS=<your_password>
CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>
ANTHROPIC_API_KEY=<anthropic_api_key>
```

**Important:**
- Database name in the URI must match exactly (case-sensitive): `hikingDb`
- Special characters in password must be percent-encoded: `#` → `%23`
- `JWT_SECRET` must be set or `jwt.sign()` throws and the login route returns HTTP 500
- `ANTHROPIC_API_KEY` missing → `/api/ai-search` returns HTTP 500; the `AiSearch` component shows the error inline

## Commands
```bash
npm run dev       # Start both Express (nodemon) + Vite concurrently
npm run server    # Express only (nodemon --watch server)
npm run client    # Vite only
npm run seed      # Seed MongoDB with initial hike data (run once)
npm run build     # Production build
```

## API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/hikes` | public | List all hikes |
| GET | `/api/hikes/:id` | public | Get single hike (restaurants + POIs populated) |
| POST | `/api/hikes` | admin JWT | Create hike |
| PUT | `/api/hikes/:id` | admin JWT | Update hike |
| DELETE | `/api/hikes/:id` | admin JWT | Delete hike |
| POST | `/api/hikes/:id/history` | admin JWT | Add history entry |
| PUT | `/api/hikes/:id/history/:entryId` | admin JWT | Update history entry |
| DELETE | `/api/hikes/:id/history/:entryId` | admin JWT | Delete history entry |
| POST | `/api/auth/login` | — | Admin login → 8h JWT |
| POST | `/api/users/register` | — | Create user account (email + password ≥8 chars) |
| POST | `/api/users/login` | — | User login → 30d JWT |
| GET | `/api/users/me` | user JWT | Get profile |
| PUT | `/api/users/me` | user JWT | Update name, email, children[] |
| GET | `/api/users/me/subscription` | user JWT | Check tier + expiry |
| POST | `/api/upload` | admin JWT | Upload image to Cloudinary |
| GET | `/api/restaurants` | public | List all restaurants |
| GET | `/api/restaurants/:id` | public | Get single restaurant |
| POST | `/api/restaurants` | admin JWT | Create restaurant |
| PUT | `/api/restaurants/:id` | admin JWT | Update restaurant |
| DELETE | `/api/restaurants/:id` | admin JWT | Delete restaurant |
| GET | `/api/poi` | public | List all POIs |
| GET | `/api/poi/:id` | public | Get single POI (by ObjectId or slug) |
| POST | `/api/poi` | admin JWT | Create POI |
| PUT | `/api/poi/:id` | admin JWT | Update POI |
| DELETE | `/api/poi/:id` | admin JWT | Delete POI |
| GET | `/api/mountains` | public | Static list of Romanian mountain ranges |
| POST | `/api/ai-search` | public | Natural language hike search via Claude Haiku |
| GET | `/sitemap.xml` | public | Auto-generated XML sitemap (hikes + POIs) |
| GET | `/api-docs` | public | Swagger UI (OpenAPI 3.0 interactive docs) |

Rate limiting: 10 requests / 15 min on both login endpoints (`/api/auth/login` and `/api/users/login`).

## Authentication Flow

### Admin
1. `POST /api/auth/login` with `{ username, password }` → returns `{ token }`
2. Token stored in `localStorage` as `admin_token`; expires in 8 hours
3. All admin mutating API calls send `Authorization: Bearer <token>` header
4. `isLoggedIn()` in `src/api/auth.js` checks expiry client-side via JWT payload decode

### User
1. `POST /api/users/register` with `{ email, password, name }` → returns `{ user }`
2. `POST /api/users/login` with `{ email, password }` → returns `{ token, user }`
3. Token stored in `localStorage` as `user_token`; expires in 30 days
4. Middleware: `requireUserAuth` in `server/middleware/auth.js`
5. Uses `JWT_USER_SECRET` env var (falls back to `JWT_SECRET`)

## Routing (no react-router)
`App.jsx` checks `window.location.pathname`:
- `/` → public view (hero + card grid + carousel)
- `/hike/:slug-or-id` → public hike detail page (`HikeDetail`)
- `/poi/:slug-or-id` → public POI detail page (`PoiDetail`)
- `/stats` → stats page (`StatsPage`)
- `/admin` → `AdminLogin` → `AdminPanel` hikes (if token valid)
- `/admin/hike/:id/edit` → `AdminHikeForm` (edit existing)
- `/admin/hike/new` → `AdminHikeForm` (create new)
- `/admin/restaurants` → `AdminRestaurants` list
- `/admin/restaurant/:id/edit` → `AdminRestaurantForm` (edit)
- `/admin/restaurant/new` → `AdminRestaurantForm` (create)
- `/admin/poi` → `AdminPoi` list
- `/admin/poi/:id/edit` → `AdminPoiForm` (edit existing)
- `/admin/poi/new` → `AdminPoiForm` (create new)
- `/safety-tips` → `SafetyTipsPage`
- `/gear-guide` → `GearGuidePage`
- `/trail-map` → `TrailMapPage`
- `/about` → `AboutPage`
- `/submit-trail` → `SubmitTrailPage`
- `/report-issue` → `ReportIssuePage`
- `/family-friendly` → `FamilyFriendlyPage`
- `/mountain-views` → `MountainViewsPage`

Hike and POI routes accept both slug and ObjectId — the API resolves either. Vite handles SPA fallback in dev; Express serves `dist/` in production.

## Hike Schema
```js
{
  name:        String (required)
  slug:        String | null   // URL-friendly slug, unique, auto-generated from name
  time:        Number | null   // hours
  distance:    Number | null   // km
  tip:         'Dus-intors' | 'Dus' | null
  up:          Number | null   // elevation gain (m)
  difficulty:  'easy' | 'medium' | null
  mountains:   String | null
  zone:        String | null
  imageUrl:    String | null   // legacy single photo (kept for backward compat)
  photos:      [String]        // array of Cloudinary URLs
  mainPhoto:   String | null   // hero image; falls back to photos[0] if not set
  description: String | null   // markdown trail description
  startLat:    Number | null   // trailhead coordinates (set via Leaflet map in admin)
  startLng:    Number | null
  mapUrl:      String | null   // Mapy.cz iframe URL
  active:      Boolean         // default: true
  sources:     [String]        // source URLs used to populate description
  // Family & Safety fields
  familyFriendly:     Boolean          // default: false
  minAgeRecommended:  Number | null    // years
  strollerAccessible: Boolean
  toddlerFriendly:    Boolean
  kidEngagementScore: Number | null    // 1–5
  highlights:         [String]         // e.g. ["waterfall", "marmots"]
  hasRestAreas:       Boolean
  restAreaCount:      Number | null
  hasBathrooms:       Boolean
  bathroomType:       'flush' | 'pit' | 'none' | null
  hasPicknicArea:     Boolean
  nearbyPlayground:   Boolean
  bearRisk:           'low' | 'medium' | 'high' | null
  sheepdogWarning:    Boolean
  safeWaterSource:    Boolean
  mobileSignal:       'good' | 'partial' | 'none' | null
  trailMarkColor:     'red' | 'yellow' | 'blue' | null  // legacy
  trailMarkShape:     'stripe' | 'cross' | 'triangle' | 'dot' | null  // legacy
  trailMarkers:       [String]         // ordered list of marker IDs e.g. ['yellow_circle', 'red_stripe']
  salvamontPoint:     String | null
  history:     Array<{ time, is_hike, distance, up, down, updatedAt }>
  restaurants: Array<ObjectId ref 'Restaurant'>  // populated on GET /:id
  pois:        Array<ObjectId ref 'Poi'>          // populated on GET /:id
}
```

## Restaurant Schema
```js
{
  name:      String (required)
  type:      'Restaurant' | 'Cabana' | 'Pensiune' | 'Cafenea' | null
  mountains: String | null
  zone:      String | null
  address:   String | null
  link:      String | null   // website / Google Maps URL
  notes:     String | null
}
```

## POI Schema (Points of Interest — replaces old Cave schema)
```js
{
  name:           String (required)
  slug:           String | null   // URL-friendly slug, unique
  poiType:        String | null   // e.g. "Cave", "Waterfall", "Viewpoint"
  photos:         [String]        // array of Cloudinary URLs
  mainPhoto:      String | null   // hero image; falls back to photos[0] if not set
  mountains:      String | null
  development:    Number | null   // total surveyed length (m) — caves
  verticalExtent: Number | null   // height difference entrance-to-lowest (m) — caves
  altitude:       Number | null   // entrance altitude (m)
  rockType:       String | null   // e.g. "Calcar"
  zone:           String | null
  address:        String | null
  link:           String | null   // website / Google Maps URL
  notes:          String | null
  lat:            Number | null   // entrance/location coordinates
  lng:            Number | null
  active:         Boolean         // default: true
}
```

## User Schema
```js
{
  email:        String (required, unique, lowercase)
  passwordHash: String (required)              // bcrypt, 10 rounds
  name:         String
  children:     [{ name: String, birthYear: Number | null }]
  subscription: 'free' | 'explorer' | 'pro'   // default: 'free'
  subExpiresAt: Date | null
  createdAt:    Date
}
```

## Carousel
- Only shows hikes that have a photo (`mainPhoto || photos[0] || imageUrl`)
- Gradient placeholder shown when no image
- Auto-advances every 5 seconds
- To add a photo: upload via Admin Panel (multi-photo gallery) — first uploaded photo becomes `mainPhoto` automatically

## Weather Forecast
- `WeatherForecast.jsx` — rendered on `HikeDetail` when `hike.startLat`/`startLng` are set; on `PoiDetail` when `poi.lat`/`lng` are set
- Fetches from Open-Meteo API using coordinates
- Shows a 7-day forecast; weekend days are visually highlighted
- No API key required (Open-Meteo is free)

## Stats Page (`/stats`)
- Aggregates hike data client-side (fetched once on mount)
- Totals: km hiked, elevation gain, hours on trail, completed trails
- Charts via Recharts: difficulty breakdown (pie), hiking by month (bar), distance by mountains (bar)
- Link from hero section ("View stats →")

## User Location & Driving Distances
- User clicks "Show distances from me" in hero → geolocation or city search (Nominatim)
- Location stored in `sessionStorage` across page navigations
- Driving distances fetched via OSRM Table API (`router.project-osrm.org`) — batch request for all hikes with `startLat`/`startLng` set
- Displayed as "X km away" on each hike card

## AI-Powered Natural Language Search
- Input in hero section (`AiSearch` component inside `HeroSearch.jsx`)
- User types a free-form query in Romanian or English
- `POST /api/ai-search` — handled by `server/routes/aiSearch.js` using Claude Haiku
- System prompt instructs the model to return structured JSON filters; no markdown wrappers allowed
- Supported filter fields: `maxHikeHours`, `minHikeHours`, `maxDistanceKm`, `minDistanceKm`, `maxElevation`, `minElevation`, `difficulty`, `mountains`, `zone`, `tip`, `maxDriveHours`, `familyFriendly`, `strollerAccessible`, `toddlerFriendly`, `minAgeRecommended`, `maxAgeRecommended`, `kidEngagementMin`, `bearRisk`, `mobileSignal`, `hasBathrooms`, `hasPicknicArea`, `nearbyPlayground`, `safeWaterSource`, `hasRestAreas`, `sheepdogFree`, `highlights`
- `maxDriveHours` applied client-side against OSRM distances (requires user location)
- Response includes an `explanation` string in the query's language — displayed as a pill in the hero
- Query validated (required, max 500 chars) before calling Claude

## HikeCard Hover Overlay
- On hover, a dark overlay slides up over the card image showing:
  - Stat bars for difficulty (green/amber/red), distance (max 30 km), time (max 10h), elevation (max 2000m)
  - Family-friendly chip (green) if `familyFriendly: true`
  - Bear risk chip (color-coded) if `bearRisk` is set
- Card navigates to `/hike/${hike.slug || hike._id}` on click

## Admin Panel Features
- **Table** with image thumbnails (88×56px) as first column — uses `mainPhoto || photos[0] || imageUrl`
- **Edit form** (`AdminHikeForm`) opens at `/admin/hike/:id/edit`
- **Prev/Next navigation** in edit form header — arrows to move between hikes in order
- **Unsaved changes guard** — confirm dialog if navigating away with dirty form
- **Multi-photo gallery** — upload multiple photos, click to set as main, ✕ to remove; `imageUrl` kept in sync with `mainPhoto` for backward compat
- **Markdown description editor** — rich toolbar (bold, italic, headings, lists, links, etc.)
- **Mountains & Zone** — `<input list>` + `<datalist>` comboboxes; suggestions derived from `/api/mountains`, free-text entry allowed
- **Trail starting point** — interactive Leaflet map; click to set `startLat`/`startLng`
- **Mapy.cz embed** — paste iframe code; rendered on public detail page
- **History** section per hike — add/edit/delete entries with date, is_hike, distance, time, up, down
- **Restaurants** section — `TagMultiSelect` component: pill-style tags with × per item, dropdown list, clear-all button
- **POIs** section in hike edit form — checkbox list to link/unlink POIs; stored as ObjectId array in `pois`
- **Family & Safety** section — collapsible `<details>` with all family/safety fields (checkboxes, selects, number inputs)
- **Trail markers** — `MarkerPicker` component: 5×3 grid of SVG marker images (15 markers: red/yellow/blue × stripe/circle/cross/ring/triangle), click to select, number badge shows order, reorder with ↑↓ buttons, remove with ×
- **Tab navigation** (Hikes / Restaurants / POIs) via `AdminNavTabs` component shared across admin pages
- **Date inputs** are `type="text"` displaying `DD-MM-YYYY`; stored internally as `YYYY-MM-DD`
- **POI form** (`AdminPoiForm`) — same multi-photo gallery UX as hikes, Leaflet map with Nominatim location search, `poiType` field
- `TagMultiSelect` and `MarkerPicker` are defined as module-level functions at the top of `AdminHikeForm.jsx` — not in separate files

## Hike Detail (`/hike/:slug-or-id`)
- Hero image: `mainPhoto || photos[0] || imageUrl`; falls back to purple gradient if none
- **Photo gallery** — grid of all photos (shown when `photos.length > 1`); click to open lightbox (Escape to close)
- **Stats grid** — first card shows trail markers (SVG images); then Distance, Duration, Elevation gain, Trip type, Completed date
- **Family & Safety card** — shown when any family/safety field is set; sections: Family Suitability (chips), Highlights (tags), Amenities (chips), Safety (chips with color coding: green/amber/red)
- **Trail markers in Safety card header** — marker SVG images displayed top-right of the Family & Safety card
- Weather forecast, trail map (Mapy.cz), description, history, restaurants, linked POIs sections

## POI Detail (`/poi/:slug-or-id`)
- Hero image: `mainPhoto` or first of `photos`; falls back to dark blue gradient if none
- **Photo gallery grid** — thumbnails of all photos below the stats section
- **Lightbox** — click any thumbnail to open full-size overlay; close with ✕ or Escape key
- **Coordinates** — displayed as `lat, lng` when set; links to Google Maps
- **Weather forecast** — rendered via `WeatherForecast.jsx` when `lat`/`lng` are set
- **Linked hikes** — list of hikes that include this POI

## i18n
All UI strings go through `src/i18n.js`. Two languages: **Romanian (`ro`)** and **English (`en`)**.

- Use `t('key')` in components. Never hardcode display strings.
- Use `t('key', { var: value })` for interpolation.
- Keys organized by section: `common`, `tripType`, `difficulty`, `stat`, `poi.stat`, `hike`, `history`, `poi`, `hero`, `filter`, `location`, `card`, `carousel`, `weather`, `stats`, `admin.*`, `login`.
- Language persisted in `localStorage` under key `lang`; defaults to `'en'`.
- Components that need re-render on language change must call `useLang()` from `src/hooks/useLang.js`.
- `LangSwitcher` lives inside `HeroSearch.jsx`; buttons labeled **RO** and **EN**.

## Trail Markers
- 15 SVG files in `hiking_markers/` and `public/hiking_markers/` (served statically at `/hiking_markers/*.svg`)
- Naming: `{color}_{shape}.svg` — colors: `red`, `yellow`, `blue`; shapes: `stripe`, `circle`, `cross`, `ring`, `triangle`
- `trailMarkers` field stores an ordered array of marker IDs; order is preserved in display
- Legacy `trailMarkColor` + `trailMarkShape` fields kept for backward compat but `trailMarkers` takes precedence

## Known Gotchas
- Port 3001 conflict: run `cmd //c "taskkill /F /IM node.exe"` then `npm run dev`
- `.env` changes require full server restart (nodemon only watches `server/`)
- `#` in passwords must be `%23` in the MongoDB URI but written as-is in `ADMIN_PASS`
- MongoDB Atlas: IP must be whitelisted in Network Access, database name is case-sensitive
- `ANTHROPIC_API_KEY` missing → `/api/ai-search` returns HTTP 500
- AI search `maxDriveHours` filter is silently ignored if user hasn't set their location
- `imageUrl` is kept in sync with `mainPhoto` on every photo upload/remove/set-main in `AdminHikeForm` — don't set them independently
- `TagMultiSelect` and `MarkerPicker` are defined as module-level functions at the top of `AdminHikeForm.jsx` (before `EMPTY`) — not in separate files
- Hike and POI routes accept both slug and ObjectId — the server resolves either via `isObjectId()` check
- Swagger UI at `/api-docs` uses a relaxed CSP (mounted before `helmet()`) — scoped to that path only
- `CookieBanner` is shown on all non-admin pages; it sets a `cookieConsent` key in `localStorage`
- PWA manifest is at `public/manifest.json`; `index.html` links it with `<link rel="manifest">`
- Google Analytics tag is injected directly in `index.html` — no npm package needed

## Design System
All CSS variables are in `src/index.css` under `:root`. Color palette:
- **Purple theme** (hero, admin header, primary buttons): `#1e1b4b → #2e1065 → #3b0764`
- **Purple accents**: `#7c3aed` (buttons, focus rings, borders)
- **Purple light**: `#c4b5fd` (subtext on dark bg), `#f5f3ff` (hover backgrounds)
- `--forest-*`: greens used for badges (difficulty, family-friendly)
- `--neutral-*`: grays (text, borders, backgrounds)
- `--amber-*`: medium difficulty / in-progress
- `--red-*`: delete / error states / high bear risk
- Hike detail hero without image: purple gradient (`#1e1b4b → #2e1065 → #3b0764`)
- POI detail hero without image: dark blue gradient (`#1a1a2e → #16213e → #0f3460`)
