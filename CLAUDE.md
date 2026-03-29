# Trail Mix — Project Guide for Claude

## Overview
A full-stack hiking trail tracker. Users browse hikes publicly (read-only). An admin at `/admin` manages all data (CRUD) behind JWT authentication.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite |
| Backend | Node.js, Express (ESM) |
| Database | MongoDB Atlas via Mongoose |
| Auth | JWT (`jsonwebtoken`) |
| Dev runner | `concurrently` + `nodemon` |
| Styling | Plain CSS (no framework) |

## Project Structure
```text
hiking/
├── server/
│   ├── index.js              # Express entry point
│   ├── db.js                 # MongoDB connection
│   ├── middleware/
│   │   └── auth.js           # JWT requireAuth middleware
│   ├── models/
│   │   └── Hike.js           # Mongoose schema
│   └── routes/
│       ├── auth.js           # POST /api/auth/login
│       ├── hikes.js          # GET/POST/PUT/DELETE /api/hikes
│       └── upload.js         # POST /api/upload (Cloudinary)
├── src/
│   ├── App.jsx               # Root — routes / vs /admin vs /hike/:id
│   ├── index.css             # All styles (design tokens + components)
│   ├── api/
│   │   ├── auth.js           # login(), getToken(), isLoggedIn()
│   │   ├── hikes.js          # fetchHikes(), fetchHike(), createHike(), updateHike(), deleteHike()
│   │   └── upload.js         # uploadImage()
│   └── components/
│       ├── HeroSearch.jsx    # Hero section with search + filters (public)
│       ├── Controls.jsx      # Filter bar (public, read-only)
│       ├── HikingTable.jsx   # Sortable card grid (public, read-only)
│       ├── HikeRow.jsx       # ViewRow only (public)
│       ├── HikeDetail.jsx    # Full hike detail page (/hike/:id)
│       ├── HikeCarousel.jsx  # Auto-sliding carousel (hikes with imageUrl)
│       └── admin/
│           ├── AdminLogin.jsx   # Login form
│           ├── AdminPanel.jsx   # Full CRUD table with image thumbnails
│           └── AdminHikeForm.jsx # Edit/create hike form with prev/next nav
├── public/
│   └── favicon.svg           # SVG hiker icon
├── data/
│   └── seed.js               # One-time DB seed script
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
| GET | `/api/hikes/:id` | public | Get single hike |
| POST | `/api/hikes` | Bearer JWT | Create hike |
| PUT | `/api/hikes/:id` | Bearer JWT | Update hike |
| DELETE | `/api/hikes/:id` | Bearer JWT | Delete hike |
| POST | `/api/auth/login` | — | Returns JWT token |
| POST | `/api/upload` | Bearer JWT | Upload image to Cloudinary |

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
- `/admin` → `AdminLogin` → `AdminPanel` (if token valid)
- `/admin/hike/:id/edit` → `AdminHikeForm` (edit existing)
- `/admin/hike/new` → `AdminHikeForm` (create new)

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
  completed:   String | null   // format: dd/mm/yyyy
  zone:        String | null
  imageUrl:    String | null
  description: String | null   // free-text trail description
}
```

## Carousel
- Only shows hikes that have `imageUrl` set
- Gradient placeholder shown when no image
- Auto-advances every 5 seconds
- To add a photo: upload via Admin Panel (Cloudinary) or set `imageUrl` directly in Atlas

## Admin Panel Features
- **Table** with image thumbnails (88×56px) as first column
- **Edit form** (`AdminHikeForm`) opens at `/admin/hike/:id/edit`
- **Prev/Next navigation** in edit form header — arrows to move between hikes in order
- **Unsaved changes guard** — confirm dialog if navigating away with dirty form
- **Image upload** via Cloudinary (`/api/upload`)
- **Description** textarea field (free text, stored in DB)

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
