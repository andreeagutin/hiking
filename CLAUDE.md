# Trail Mix — Project Guide for Claude

## Overview
A full-stack hiking trail tracker. Users browse hikes and caves publicly (read-only). An admin at `/admin` manages all data (CRUD) behind JWT authentication.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite |
| Backend | Node.js, Express (ESM) |
| Database | MongoDB Atlas via Mongoose |
| Auth | JWT (`jsonwebtoken`) |
| Dev runner | `concurrently` + `nodemon` |
| Styling | Plain CSS (no framework) |
| Charts | Recharts |
| Maps | Leaflet (admin), Mapy.cz iframe (public) |
| Weather | Open-Meteo API |
| Distances | OSRM (driving distance) |
| i18n | Custom `src/i18n.js` — `t('key')` helper |

## Project Structure
```text
hiking/
├── server/
│   ├── index.js              # Express entry point
│   ├── db.js                 # MongoDB connection
│   ├── middleware/
│   │   └── auth.js           # JWT requireAuth middleware
│   ├── models/
│   │   ├── Hike.js           # Mongoose schema (hikes)
│   │   ├── Restaurant.js     # Mongoose schema (restaurants)
│   │   └── Cave.js           # Mongoose schema (caves)
│   └── routes/
│       ├── auth.js           # POST /api/auth/login
│       ├── hikes.js          # GET/POST/PUT/DELETE /api/hikes + history sub-routes
│       ├── restaurants.js    # GET/POST/PUT/DELETE /api/restaurants
│       ├── caves.js          # GET/POST/PUT/DELETE /api/caves
│       └── upload.js         # POST /api/upload (Cloudinary)
├── src/
│   ├── App.jsx               # Root router (pathname-based, no react-router)
│   ├── index.css             # All styles (design tokens + components)
│   ├── i18n.js               # UI translations — t('key') helper, single source of truth
│   ├── api/
│   │   ├── auth.js           # login(), getToken(), isLoggedIn()
│   │   ├── hikes.js          # fetchHikes(), fetchHike(), createHike(), updateHike(), deleteHike()
│   │   ├── restaurants.js    # CRUD helpers for restaurants
│   │   ├── caves.js          # fetchCaves(), fetchCave(), createCave(), updateCave(), deleteCave()
│   │   └── upload.js         # uploadImage()
│   └── components/
│       ├── HeroSearch.jsx    # Hero section with search + filters (public)
│       ├── HikeCard.jsx      # Single hike card (public grid)
│       ├── HikeDetail.jsx    # Full hike detail page (/hike/:id)
│       ├── CaveDetail.jsx    # Cave detail page (/cave/:id)
│       ├── StatsPage.jsx     # Stats page (/stats) with Recharts
│       ├── WeatherForecast.jsx # 7-day forecast via Open-Meteo
│       ├── HikeCarousel.jsx  # Auto-sliding carousel (hikes with imageUrl)
│       └── admin/
│           ├── AdminLogin.jsx        # Login form
│           ├── AdminPanel.jsx        # Hikes CRUD table
│           ├── AdminHikeForm.jsx     # Edit/create hike form with prev/next nav
│           ├── AdminRestaurants.jsx  # Restaurants list + shared AdminNavTabs component
│           ├── AdminRestaurantForm.jsx # Edit/create restaurant form
│           ├── AdminCaves.jsx        # Caves CRUD table
│           └── AdminCaveForm.jsx     # Edit/create cave form with Leaflet map
├── public/
│   └── favicon.svg           # SVG hiker icon
├── data/
│   ├── seed.js               # One-time DB seed script
│   └── migrate-active.js     # Migration utility (run as needed with `node data/migrate-active.js`)
├── .env                      # Never commit this
├── vite.config.js
└── package.json
```

## Environment Variables (.env)
```
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<dbName>?retryWrites=true&w=majority&appName=<appName>
PORT=3001
JWT_SECRET=<random_strong_string>
ADMIN_USER=admin
ADMIN_PASS=<your_password>
CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>
```

**Important:**
- Database name in the URI must match exactly (case-sensitive): `hikingDb`
- Special characters in password must be percent-encoded: `#` → `%23`
- `JWT_SECRET` must be set or `jwt.sign()` throws and the login route returns HTTP 500 with `{ error: <jwt.sign() message> }`

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
| GET | `/api/hikes/:id` | public | Get single hike (restaurants + caves populated) |
| POST | `/api/hikes` | Bearer JWT | Create hike |
| PUT | `/api/hikes/:id` | Bearer JWT | Update hike |
| DELETE | `/api/hikes/:id` | Bearer JWT | Delete hike |
| POST | `/api/hikes/:id/history` | Bearer JWT | Add history entry |
| PUT | `/api/hikes/:id/history/:entryId` | Bearer JWT | Update history entry |
| DELETE | `/api/hikes/:id/history/:entryId` | Bearer JWT | Delete history entry |
| POST | `/api/auth/login` | — | Returns JWT token |
| POST | `/api/upload` | Bearer JWT | Upload image to Cloudinary |
| GET | `/api/restaurants` | public | List all restaurants |
| GET | `/api/restaurants/:id` | public | Get single restaurant |
| POST | `/api/restaurants` | Bearer JWT | Create restaurant |
| PUT | `/api/restaurants/:id` | Bearer JWT | Update restaurant |
| DELETE | `/api/restaurants/:id` | Bearer JWT | Delete restaurant |
| GET | `/api/caves` | public | List all caves |
| GET | `/api/caves/:id` | public | Get single cave |
| POST | `/api/caves` | Bearer JWT | Create cave |
| PUT | `/api/caves/:id` | Bearer JWT | Update cave |
| DELETE | `/api/caves/:id` | Bearer JWT | Delete cave |

## Authentication Flow
1. `POST /api/auth/login` with `{ username, password }` → returns `{ token }`
2. Token stored in `localStorage` as `admin_token`
3. Token expires in 8 hours
4. All mutating API calls send `Authorization: Bearer <token>` header
5. `isLoggedIn()` in `src/api/auth.js` checks expiry client-side via JWT payload decode

## Routing (no react-router)
`App.jsx` checks `window.location.pathname`:
- `/` → public view (hero + card grid + carousel)
- `/hike/:id` → public hike detail page (`HikeDetail`)
- `/cave/:id` → public cave detail page (`CaveDetail`)
- `/stats` → stats page (`StatsPage`)
- `/admin` → `AdminLogin` → `AdminPanel` hikes (if token valid)
- `/admin/hike/:id/edit` → `AdminHikeForm` (edit existing)
- `/admin/hike/new` → `AdminHikeForm` (create new)
- `/admin/restaurants` → `AdminRestaurants` list
- `/admin/restaurant/:id/edit` → `AdminRestaurantForm` (edit)
- `/admin/restaurant/new` → `AdminRestaurantForm` (create)
- `/admin/caves` → `AdminCaves` list
- `/admin/cave/:id/edit` → `AdminCaveForm` (edit existing)
- `/admin/cave/new` → `AdminCaveForm` (create new)

Vite handles SPA fallback automatically in dev. In production, Express serves `dist/` and catches all routes with `index.html`.

## Hike Schema
```js
{
  name:        String (required)
  time:        Number | null   // hours
  distance:    Number | null   // km
  tip:         'Dus-intors' | 'Dus' | null
  up:          Number | null   // elevation gain (m)
  down:        Number | null   // elevation loss (m)
  difficulty:  'easy' | 'medium' | null
  mountains:   String | null
  status:      'Done' | 'In progress' | 'Not started'  // default: 'Not started'
  completed:   String | null   // stored as YYYY-MM-DD, displayed as DD-MM-YYYY in admin / DD-Mon-YYYY in public
  zone:        String | null
  imageUrl:    String | null
  description: String | null   // markdown trail description
  startLat:    Number | null   // trailhead coordinates (set via Leaflet map in admin)
  startLng:    Number | null
  mapUrl:      String | null   // Mapy.cz iframe URL (embedded on detail page)
  active:      Boolean         // default: true
  history:     Array<{ time, is_hike, distance, up, down, updatedAt }>
  restaurants: Array<ObjectId ref 'Restaurant'>  // populated on GET /:id
  caves:       Array<ObjectId ref 'Cave'>        // populated on GET /:id
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

## Cave Schema
```js
{
  name:          String (required)
  photos:        [String]      // array of Cloudinary URLs
  mainPhoto:     String | null // displayed as hero; first of photos if not set
  mountains:     String | null
  development:   Number | null // total surveyed length (m)
  verticalExtent: Number | null // height difference entrance-to-lowest (m)
  altitude:      Number | null // entrance altitude (m)
  rockType:      String | null // e.g. "Calcar"
  lat:           Number | null // entrance coordinates
  lng:           Number | null
}
```

## Carousel
- Only shows hikes that have `imageUrl` set
- Gradient placeholder shown when no image
- Auto-advances every 5 seconds
- To add a photo: upload via Admin Panel (Cloudinary) or set `imageUrl` directly in Atlas

## Weather Forecast
- `WeatherForecast.jsx` — rendered on `HikeDetail` when `hike.startLat` and `hike.startLng` are set
- Fetches from Open-Meteo API using trailhead coordinates
- Shows a 7-day forecast; weekend days are visually highlighted
- No API key required (Open-Meteo is free)

## Stats Page (`/stats`)
- Aggregates hike data client-side (fetched once on mount)
- Totals: km hiked, elevation gain, hours on trail, completed trails
- Charts via Recharts: status breakdown (pie), difficulty breakdown (pie), hiking by month (bar), distance by mountains (bar)
- Link from hero section ("View stats →")

## User Location & Driving Distances
- User clicks "Show distances from me" in hero → geolocation or city search (Nominatim)
- Location stored in `sessionStorage` across page navigations
- Driving distances fetched via OSRM Table API (`router.project-osrm.org`) — batch request for all hikes with `startLat`/`startLng` set
- Displayed as "X km away" on each hike card

## Admin Panel Features
- **Table** with image thumbnails (88×56px) as first column
- **Edit form** (`AdminHikeForm`) opens at `/admin/hike/:id/edit`
- **Prev/Next navigation** in edit form header — arrows to move between hikes in order
- **Unsaved changes guard** — confirm dialog if navigating away with dirty form
- **Image upload** via Cloudinary (`/api/upload`)
- **Markdown description editor** — rich toolbar (bold, italic, headings, lists, links, etc.)
- **Trail starting point** — interactive Leaflet map; click to set `startLat`/`startLng`
- **Mapy.cz embed** — paste iframe code; rendered on public detail page
- **History** section per hike — add/edit/delete entries with date, is_hike, distance, time, up, down
- **Restaurants** section in hike edit form — checklist to link/unlink restaurants; stored as ObjectId array
- **Caves** section in hike edit form — checklist to link/unlink caves; stored as ObjectId array
- **Tab navigation** (Hikes / Restaurants / Caves) via `AdminNavTabs` component shared across admin pages
- **Date inputs** are `type="text"` displaying `DD-MM-YYYY`; stored internally as `YYYY-MM-DD`. Conversion helpers `toDisplay()` / `fromDisplay()` in `AdminHikeForm.jsx`. Legacy `dd/mm/yyyy` strings converted on load via `toInputDate()`
- New restaurant/cave created with placeholder name to satisfy `required` validation

## i18n
All UI strings go through `src/i18n.js`. Use `t('key')` in components. Keys are organized by section (common, stat, cave.stat, hike, history, hero, filter, weather, stats, admin, login). Never hardcode display strings in components.

## Known Gotchas
- Port 3001 conflict: run `cmd //c "taskkill /F /IM node.exe"` then `npm run dev`
- `.env` changes require full server restart (nodemon only watches `server/`)
- `#` in passwords must be `%23` in the MongoDB URI but written as-is in `ADMIN_PASS`
- MongoDB Atlas: IP must be whitelisted in Network Access, database name is case-sensitive

## Design System
All CSS variables are in `src/index.css` under `:root`. Color palette:
- **Purple theme** (hero, admin header, primary buttons): `#1e1b4b → #2e1065 → #3b0764`
- **Purple accents**: `#7c3aed` (buttons, focus rings, borders)
- **Purple light**: `#c4b5fd` (subtext on dark bg), `#f5f3ff` (hover backgrounds)
- `--forest-*`: greens used for badges (Done, difficulty)
- `--neutral-*`: grays (text, borders, backgrounds)
- `--amber-*`: in-progress badge
- `--red-*`: delete / error states
- Hike detail hero without image: purple gradient (`#1e1b4b → #2e1065 → #3b0764`)
- Cave detail hero without image: dark blue gradient (`#1a1a2e → #16213e → #0f3460`)
