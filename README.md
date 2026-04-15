# 🥾 Hike'n'Seek

> **Vibe-coded, solo, end-to-end.** An AI-powered hiking trail tracker for Romanian mountains — built with Claude (Anthropic) at its core.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://hiking-high.netlify.app/)
[![API](https://img.shields.io/badge/API-Render-blue)](https://hiking-1.onrender.com/api/hikes)
[![API Docs](https://img.shields.io/badge/docs-Swagger-orange)](https://hiking-1.onrender.com/api-docs)
[![License: MIT](https://img.shields.io/badge/license-MIT-lightgrey)](LICENSE)

**[→ Live app](https://hiking-high.netlify.app/)** · **[→ API docs](https://hiking-1.onrender.com/api-docs)**

---

## What is this?

Hike'n'Seek is a full-stack web app for discovering and tracking hiking trails across Romania. The whole thing was vibe-coded solo — from schema design to production deployment — using AI-assisted development throughout.

The most interesting part is the **AI search**: instead of dropdowns and checkboxes, you just describe what you want in plain language and Claude Haiku figures out what you mean, extracts structured filters, and queries the database in real time.

> *"traseu ușor cu copii mici, fără urși, lângă Brașov"*
> → AI extracts: `difficulty: easy`, `bearRisk: low`, `familyFriendly: true`, `zone: Brașov`

---

## AI Features

- **Natural language search** powered by [Claude Haiku](https://www.anthropic.com/) — understands Romanian and English, returns structured JSON filters + a human-readable explanation pill shown in the hero
- Supports 25+ filter fields: distance, duration, elevation, difficulty, family safety, bear risk, stroller access, kid engagement score, driving distance, highlights, and more
- `maxDriveHours` applied client-side against real OSRM driving distances from the user's location
- The model is instructed to output clean JSON only — no markdown wrappers, no hallucinated field names
- Query validated (required, max 500 chars) before hitting the Anthropic API

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite |
| Backend | Node.js, Express (ESM) |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT — admin (8h) + user accounts (30d, bcrypt) |
| **AI Search** | **Claude Haiku via Anthropic SDK** |
| Image upload | Cloudinary + multer |
| Dev runner | concurrently + nodemon |
| Styling | Plain CSS (design tokens, no framework) |
| Charts | Recharts |
| Maps | Leaflet (admin), Mapy.cz iframe (public) |
| Weather | Open-Meteo API (free, no key needed) |
| Distances | OSRM (driving distance, free) |
| i18n | Custom `src/i18n.js` — RO + EN |
| Security | helmet, express-rate-limit |
| API Docs | Swagger UI at `/api-docs` |
| Analytics | Google Analytics (gtag.js) |
| PWA | Web app manifest — installable on mobile |
| Deployment | Netlify (frontend) + Render (backend) |

---

## Getting Started

```bash
git clone git@github.com:andreeagutin/hiking.git
cd hiking
npm install
cp .env.example .env   # fill in your credentials
npm run dev            # Express (port 3001) + Vite (port 5173) concurrently
```

### Environment Variables

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/hikingDb?retryWrites=true&w=majority
PORT=3001
JWT_SECRET=<random_strong_string>
JWT_USER_SECRET=<another_string>   # optional; falls back to JWT_SECRET
ADMIN_USER=admin
ADMIN_PASS=<your_password>
CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>
ANTHROPIC_API_KEY=<your_anthropic_key>   # required for AI search
```

> **Notes:**
> - DB name must be exactly `hikingDb` (case-sensitive)
> - `#` in MongoDB password → encode as `%23` in the URI
> - Missing `ANTHROPIC_API_KEY` → `/api/ai-search` returns HTTP 500

---

## Commands

```bash
npm run dev       # Both Express + Vite
npm run server    # Express only (nodemon)
npm run client    # Vite only
npm run seed      # Seed MongoDB (run once)
npm run build     # Production build
```

---

## Features

### Public

- **AI natural language search** — type anything in RO or EN; Claude Haiku interprets intent, extracts filters, and returns live results with a plain-language explanation
- **HikeCard hover overlay** — animated stat bars for difficulty, distance, time, elevation; family-friendly and bear risk chips
- **Driving distances** from user location via OSRM (browser geolocation or Nominatim city search)
- **Hike detail page** — multi-photo lightbox, trail marker card, Family & Safety card, 7-day weather forecast, Mapy.cz trail embed, history log, restaurants, POIs; JSON-LD structured data
- **POI detail page** — photo gallery, coordinates with Google Maps link, weather forecast, linked hikes; JSON-LD structured data
- **Stats page** (`/stats`) — totals (km, elevation, hours) + Recharts charts (difficulty pie, monthly bar, mountains bar)
- **RO/EN language switcher** — persisted in `localStorage`, custom i18n system (no library)
- GDPR cookie consent banner, Google Analytics, PWA manifest (installable on Android/iOS)

### Admin (`/admin`)

- CRUD for hikes, restaurants, and POIs behind JWT auth
- Multi-photo gallery per hike/POI (upload, set main, remove)
- Trail marker picker — 15 SVG markers (red/yellow/blue × stripe/circle/cross/ring/triangle), ordered multi-select
- Family & Safety collapsible section with all family/safety fields
- Restaurants tag multi-select — pill tags with dropdown
- Markdown editor with full toolbar
- Interactive Leaflet map for trailhead coordinates
- Prev/next navigation in edit form; unsaved changes guard

---

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
| GET/PUT | `/api/users/me` | user JWT | Get / update profile |
| GET | `/api/users/me/subscription` | user JWT | Check tier + expiry |
| GET | `/api/poi` | public | List all POIs |
| GET | `/api/poi/:id` | public | Single POI (ObjectId or slug) |
| POST/PUT/DELETE | `/api/poi/:id` | admin JWT | Manage POIs |
| GET | `/api/restaurants` | public | List all restaurants |
| POST/PUT/DELETE | `/api/restaurants/:id` | admin JWT | Manage restaurants |
| GET | `/api/mountains` | public | Romanian mountain ranges list |
| POST | `/api/upload` | admin JWT | Upload image to Cloudinary |
| **POST** | **`/api/ai-search`** | public | **Natural language search (Claude Haiku)** |
| GET | `/sitemap.xml` | public | Auto-generated XML sitemap |
| GET | `/api-docs` | public | Swagger UI (OpenAPI 3.0) |

Rate limiting: 10 requests / 15 min on both login endpoints.

---

## Project Structure

```
hiking/
├── server/
│   ├── index.js              # Express entry + helmet + rate limiting
│   ├── db.js                 # MongoDB connection
│   ├── middleware/auth.js    # requireAuth (admin) + requireUserAuth (user)
│   ├── models/               # Hike, Restaurant, Poi, User schemas
│   ├── routes/
│   │   ├── aiSearch.js       # Claude Haiku natural language search ✨
│   │   ├── hikes.js          # CRUD + history sub-routes
│   │   ├── poi.js            # CRUD (ObjectId or slug lookup)
│   │   ├── users.js          # register, login, me, subscription
│   │   └── auth.js, restaurants.js, mountains.js, upload.js, sitemap.js
│   ├── swagger.js            # OpenAPI 3.0 spec
│   └── utils/slugify.js
├── src/
│   ├── App.jsx               # Pathname-based router (no react-router)
│   ├── i18n.js               # t('key'), setLang(), getLang() — RO + EN
│   ├── api/                  # Fetch helpers per resource
│   ├── hooks/useLang.js
│   └── components/
│       ├── HeroSearch.jsx    # Hero + AI search + location widget + RO/EN switcher ✨
│       ├── HikeCard.jsx      # Card with hover overlay + family/bear chips
│       ├── HikeDetail.jsx    # Full hike detail page
│       ├── PoiDetail.jsx     # POI detail page
│       ├── StatsPage.jsx     # Stats + Recharts
│       ├── WeatherForecast.jsx
│       └── admin/            # AdminPanel, AdminHikeForm, AdminPoiForm, etc.
└── public/
    ├── favicon.svg, logo.svg
    └── hiking_markers/       # 15 SVG trail markers
```

---

## Known Gotchas

- Port 3001 conflict: `cmd //c "taskkill /F /IM node.exe"` then `npm run dev`
- `.env` changes require a full server restart (nodemon only watches `server/`)
- `imageUrl` is kept in sync with `mainPhoto` in `AdminHikeForm` — don't set them independently
- `maxDriveHours` AI filter is silently ignored if the user hasn't set their location

---

## License

MIT
