# Hike'n'Seek

A full-stack hiking trail tracker for Romanian mountains. Users browse hikes and points of interest publicly. An admin at `/admin` manages all data behind JWT authentication.

## Production

- **Frontend:** https://hiking-high.netlify.app/
- **API:** https://hiking-1.onrender.com/api/hikes

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite |
| Backend | Node.js, Express (ESM) |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT — admin (8h) + user accounts (30d, bcrypt) |
| Image upload | Cloudinary + multer |
| Dev runner | concurrently + nodemon |
| Styling | Plain CSS (design tokens, no framework) |
| Charts | Recharts |
| Maps | Leaflet (admin), Mapy.cz iframe (public) |
| Weather | Open-Meteo API (free) |
| Distances | OSRM (driving distance, free) |
| AI Search | Claude Haiku via Anthropic SDK |
| i18n | Custom `src/i18n.js` — RO + EN |
| Security | helmet, express-rate-limit |
| API Docs | Swagger UI (`swagger-ui-express`) at `/api-docs` |
| Analytics | Google Analytics (gtag.js in `index.html`) |
| PWA | Web app manifest — installable on mobile |
| Deployment | Netlify (frontend), Render (backend) |

## Getting Started

```bash
git clone git@github.com:andreeagutin/hiking.git
cd hiking
npm install
cp .env.example .env   # fill in your credentials
npm run dev            # Express (port 3001) + Vite (port 5173) concurrently
```

### Environment Variables

```
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/hikingDb?retryWrites=true&w=majority
PORT=3001
JWT_SECRET=<random_strong_string>
JWT_USER_SECRET=<another_string>   # optional; falls back to JWT_SECRET
ADMIN_USER=admin
ADMIN_PASS=<your_password>
CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>
ANTHROPIC_API_KEY=<anthropic_api_key>
```

**Notes:**
- DB name must be exactly `hikingDb` (case-sensitive)
- `#` in MongoDB password → `%23` in URI, plain text in `ADMIN_PASS`
- Missing `ANTHROPIC_API_KEY` → `/api/ai-search` returns HTTP 500

## Commands

```bash
npm run dev       # Both Express + Vite
npm run server    # Express only (nodemon)
npm run client    # Vite only
npm run seed      # Seed MongoDB once
npm run build     # Production build
```

## Project Structure

```
hiking/
├── server/
│   ├── index.js              # Express entry + helmet + rate limiting
│   ├── db.js                 # MongoDB connection
│   ├── middleware/auth.js    # requireAuth (admin) + requireUserAuth (user)
│   ├── models/
│   │   ├── Hike.js           # Hike schema (family/safety fields, POI refs, slug)
│   │   ├── Restaurant.js
│   │   ├── Poi.js            # Points of interest (caves + other POIs), with slug
│   │   └── User.js           # User accounts: email, children[], subscription
│   ├── routes/
│   │   ├── auth.js           # POST /api/auth/login (admin)
│   │   ├── hikes.js          # CRUD + history sub-routes
│   │   ├── restaurants.js
│   │   ├── poi.js            # CRUD (ObjectId or slug lookup)
│   │   ├── users.js          # register, login, me, subscription
│   │   ├── mountains.js      # GET /api/mountains (static Romanian mountains list)
│   │   ├── upload.js         # Cloudinary upload
│   │   └── aiSearch.js       # Claude Haiku natural language search
│   ├── swagger.js            # OpenAPI 3.0 spec (served at /api-docs)
│   ├── utils/slugify.js      # Slug generation + uniqueness helper
│   └── data/mountains-ro.js  # Static list of Romanian mountain ranges
├── src/
│   ├── App.jsx               # Pathname-based router (no react-router)
│   ├── index.css             # All styles + design tokens
│   ├── i18n.js               # t('key'), setLang(), getLang() — RO + EN
│   ├── api/                  # Fetch helpers per resource
│   ├── hooks/useLang.js      # Re-renders on language change
│   └── components/
│       ├── HeroSearch.jsx    # Hero + AI search + location widget + RO/EN switcher
│       ├── HikeCard.jsx      # Card with hover overlay stat bars + family/bear chips
│       ├── HikeDetail.jsx    # Full hike detail page
│       ├── PoiDetail.jsx     # POI detail page (/poi/:slug-or-id)
│       ├── HikeCarousel.jsx  # Auto-sliding image carousel (5s)
│       ├── HikeRow.jsx       # Table row (view + edit modes)
│       ├── HikingTable.jsx   # Sortable hike table
│       ├── Controls.jsx      # Filter bar (search, difficulty, mountains, zone, tip)
│       ├── StatsPage.jsx     # Stats + Recharts
│       ├── WeatherForecast.jsx
│       ├── CookieBanner.jsx  # GDPR cookie consent (non-admin pages)
│       ├── SiteFooter.jsx    # Footer with links to all info pages
│       ├── FeaturesSection.jsx
│       ├── AgeFilter.jsx
│       ├── InfoPage.jsx + {About,SafetyTips,GearGuide,TrailMap,SubmitTrail,ReportIssue,FamilyFriendly,MountainViews}Page.jsx
│       └── admin/
│           ├── AdminLogin.jsx
│           ├── AdminPanel.jsx        # Hikes CRUD table
│           ├── AdminHikeForm.jsx     # Edit/create hike (prev/next nav, all fields)
│           ├── AdminRestaurants.jsx
│           ├── AdminRestaurantForm.jsx
│           ├── AdminPoi.jsx          # POI CRUD table
│           ├── AdminPoiForm.jsx      # Edit/create POI with Leaflet map
│           └── ConfirmModal.jsx
├── public/
│   ├── favicon.svg
│   ├── logo.svg
│   └── hiking_markers/       # 15 SVG trail markers served statically
├── hiking_markers/           # Source SVG copies
└── data/                     # seed.js, migrate-active.js
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/hikes` | public | List all hikes |
| GET | `/api/hikes/:id` | public | Single hike (POIs + restaurants populated) |
| POST | `/api/hikes` | admin JWT | Create hike |
| PUT | `/api/hikes/:id` | admin JWT | Update hike |
| DELETE | `/api/hikes/:id` | admin JWT | Delete hike |
| POST/PUT/DELETE | `/api/hikes/:id/history/:entryId` | admin JWT | Manage history entries |
| POST | `/api/auth/login` | — | Admin login → 8h JWT |
| POST | `/api/users/register` | — | Create user account |
| POST | `/api/users/login` | — | User login → 30d JWT |
| GET | `/api/users/me` | user JWT | Get profile |
| PUT | `/api/users/me` | user JWT | Update name, email, children |
| GET | `/api/users/me/subscription` | user JWT | Check tier + expiry |
| GET | `/api/poi` | public | List all POIs |
| GET | `/api/poi/:id` | public | Single POI (by ObjectId or slug) |
| POST/PUT/DELETE | `/api/poi/:id` | admin JWT | Manage POIs |
| GET | `/api/restaurants` | public | List all restaurants |
| POST/PUT/DELETE | `/api/restaurants/:id` | admin JWT | Manage restaurants |
| GET | `/api/mountains` | public | Romanian mountain ranges list |
| POST | `/api/upload` | admin JWT | Upload to Cloudinary |
| POST | `/api/ai-search` | public | Natural language hike search (Claude Haiku) |
| GET | `/sitemap.xml` | public | Auto-generated XML sitemap |
| GET | `/api-docs` | public | Swagger UI (OpenAPI 3.0) |

Rate limiting: 10 requests / 15 min on both login endpoints.

## Features

### Public

- **AI natural language search** (Claude Haiku) — interprets queries in RO or EN, returns structured filters + explanation pill. Supports: time, distance, elevation, difficulty, mountains, zone, trip type, family/safety fields, driving distance, highlights.
- **HikeCard hover overlay** — stat bars for difficulty, distance, time, elevation; family-friendly and bear risk chips.
- **RO/EN language switcher** — persisted in `localStorage`.
- Driving distance from user location via OSRM (geolocation or Nominatim city search).
- Hike detail: multi-photo lightbox, trail marker card, Family & Safety card, weather forecast, Mapy.cz embed, history, restaurants, POIs. Includes JSON-LD (`TouristAttraction`) structured data.
- POI detail (`/poi/:slug`): photo gallery, coordinates (Google Maps link), weather forecast, linked hikes. Includes JSON-LD structured data.
- Stats page (`/stats`): totals + Recharts charts (difficulty pie, monthly bar, distance by mountains).
- **Static info pages**: About, Safety Tips, Gear Guide, Trail Map, Submit Trail, Report Issue, Family Friendly, Mountain Views — all linked from the site footer.
- **Cookie consent banner** (GDPR) on all non-admin pages.
- **Google Analytics** via gtag.js.
- **PWA manifest** — installable on Android/iOS home screen.

### Admin

- CRUD for hikes, restaurants, POIs (tab navigation).
- **Multi-photo gallery** per hike and POI (upload, set main, remove).
- **Trail marker picker** — 15 SVG markers (red/yellow/blue × stripe/circle/cross/ring/triangle), ordered multi-select.
- **Family & Safety** collapsible section with all family/safety fields.
- **Restaurants tag multi-select** — pill tags with dropdown.
- Markdown description editor with full toolbar.
- Interactive Leaflet map for trailhead coordinates.
- Prev/next navigation in hike edit form; unsaved changes guard.
- POI form includes Leaflet map with Nominatim location search.

## Routing

`App.jsx` switches on `window.location.pathname`. Hikes and POIs support both slug and ObjectId in URLs.

| Path | Component |
|------|-----------|
| `/` | Public grid |
| `/hike/:slug-or-id` | `HikeDetail` |
| `/poi/:slug-or-id` | `PoiDetail` |
| `/stats` | `StatsPage` |
| `/admin` | `AdminPanel` |
| `/admin/hike/new`, `/admin/hike/:id/edit` | `AdminHikeForm` |
| `/admin/restaurants`, `/admin/restaurant/new`, `/admin/restaurant/:id/edit` | Restaurant admin |
| `/admin/poi`, `/admin/poi/new`, `/admin/poi/:id/edit` | POI admin |
| `/about`, `/safety-tips`, `/gear-guide`, `/trail-map` | Static info pages |
| `/submit-trail`, `/report-issue`, `/family-friendly`, `/mountain-views` | Static info pages |

## Known Gotchas

- Port 3001 conflict: `cmd //c "taskkill /F /IM node.exe"` then `npm run dev`
- `.env` changes require full server restart (nodemon only watches `server/`)
- `imageUrl` kept in sync with `mainPhoto` in `AdminHikeForm` — don't set them independently
- `maxDriveHours` AI filter silently ignored when user location is not set

## License

MIT
