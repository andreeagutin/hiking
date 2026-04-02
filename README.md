# Trail Mix

A fullstack application for tracking, managing, and sharing hiking routes.

## Production
- **Frontend:** https://hiking-high.netlify.app/
- **API:** https://hiking-1.onrender.com/api/hikes

---

## Overview

Trail Mix allows users to:
- Browse hikes publicly with search, filters, and a detail page per trail
- Track key metrics: distance, elevation, duration, difficulty
- Manage all data through a protected admin interface (CRUD)
- Upload trail photos via Cloudinary

---

## Architecture

```
Client (React + Vite)
        ↓
REST API (Node.js / Express)
        ↓
MongoDB Atlas
```

- Frontend communicates with backend via REST API
- Backend handles business logic, validation, and data access
- MongoDB stores structured hike data
- Images hosted on Cloudinary, URLs stored in DB

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite |
| Backend | Node.js, Express (ESM) |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT (jsonwebtoken) |
| Image upload | Cloudinary + multer |
| Dev runner | concurrently + nodemon |
| Styling | Plain CSS (design tokens, no framework) |
| Charts | Recharts |
| Maps | Leaflet (admin), Mapy.cz iframe (public) |
| AI Search | Claude Haiku via Anthropic SDK |
| Deployment | Netlify (frontend), Render (backend) |

---

## Project Structure

```
hiking/
├── server/
│   ├── index.js
│   ├── db.js
│   ├── middleware/
│   ├── models/         # Hike.js, Restaurant.js, Cave.js
│   └── routes/         # hikes, restaurants, caves, auth, upload, aiSearch
├── src/
│   ├── api/            # hikes.js, restaurants.js, caves.js, auth.js, upload.js, aiSearch.js
│   ├── hooks/          # useLang.js
│   ├── i18n.js         # UI translations — RO + EN, t('key'), setLang(), getLang()
│   └── components/
│       ├── HikeDetail.jsx
│       ├── CaveDetail.jsx
│       ├── StatsPage.jsx
│       ├── WeatherForecast.jsx
│       ├── HikeCarousel.jsx
│       └── admin/      # AdminPanel, AdminHikeForm, AdminRestaurants, AdminRestaurantForm, AdminCaves, AdminCaveForm
├── public/
│   ├── favicon.svg     # SVG hiker icon
│   └── logo.svg        # Trail Mix wordmark logo
├── data/               # seed.js, migrate-active.js
├── .env
└── package.json
```

---

## Getting Started

```bash
git clone git@github.com:andreeagutin/hiking.git
cd hiking
npm install
npm run dev        # Express (port 3001) + Vite concurrently
```

Copy `.env.example` to `.env` and fill in your credentials.

---

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/hikes` | public | List all hikes |
| GET | `/api/hikes/:id` | public | Get single hike (restaurants + caves populated) |
| POST | `/api/hikes` | JWT | Create hike |
| PUT | `/api/hikes/:id` | JWT | Update hike |
| DELETE | `/api/hikes/:id` | JWT | Delete hike |
| POST | `/api/hikes/:id/history` | JWT | Add history entry |
| PUT | `/api/hikes/:id/history/:entryId` | JWT | Update history entry |
| DELETE | `/api/hikes/:id/history/:entryId` | JWT | Delete history entry |
| POST | `/api/auth/login` | — | Returns JWT token |
| POST | `/api/upload` | JWT | Upload image to Cloudinary |
| GET | `/api/restaurants` | public | List all restaurants |
| POST | `/api/restaurants` | JWT | Create restaurant |
| PUT | `/api/restaurants/:id` | JWT | Update restaurant |
| DELETE | `/api/restaurants/:id` | JWT | Delete restaurant |
| GET | `/api/caves` | public | List all caves |
| GET | `/api/caves/:id` | public | Get single cave |
| POST | `/api/caves` | JWT | Create cave |
| PUT | `/api/caves/:id` | JWT | Update cave |
| DELETE | `/api/caves/:id` | JWT | Delete cave |
| POST | `/api/ai-search` | public | Natural language hike search via Claude Haiku |

---

## Features

### Public
- Hero section with **AI natural language search** (Claude Haiku) + regular text search + 5 filter dropdowns
- **RO/EN language switcher** in hero — language persisted in `localStorage`
- Card grid with hike thumbnails
- Auto-sliding carousel (hikes with photos)
- Detail page per hike (`/hike/:id`) with stats, markdown description, weather forecast, Mapy.cz trail map, history log, linked restaurants and caves
- Cave detail page (`/cave/:id`) with photo gallery grid, **lightbox**, coordinates (with Google Maps link), **weather forecast**, and linked hikes
- Stats page (`/stats`) with charts — total km, elevation, hours, status/difficulty breakdown, hiking by month, distance by mountains
- Driving distance from user location via OSRM (geolocation or city search)

### Admin (`/admin`)
- JWT login (8h token)
- CRUD table for hikes, restaurants, and caves (tab navigation)
- Edit form per hike with prev/next navigation arrows
- Unsaved changes guard (confirm dialog before leaving)
- Cloudinary image upload
- Markdown description editor with full toolbar
- Trail starting point via interactive Leaflet map
- Mapy.cz iframe embed field
- History entries per hike (add/edit/delete)
- Linked restaurants and caves via checklist
- Cave management: photos, rock type, development, vertical extent, altitude, entrance map with **location search** (Nominatim)

---

## License

MIT
