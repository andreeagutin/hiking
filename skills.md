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

Fields: `name`, `time`, `distance`, `tip`, `up`, `down`, `difficulty`, `mountains`, `status`, `completed`, `zone`, `imageUrl`, `description`.

- All fields except `name` are optional (default `null`)
- `description` — free-text String, shown on the public detail page
- `imageUrl` — Cloudinary URL, used in carousel and detail hero

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

## 11. Favicon

`public/favicon.svg` — custom SVG of a hiker with backpack and hiking stick, in forest green palette. Referenced in `index.html` as `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`. Also used inline in `HeroSearch.jsx` as `<img src="/favicon.svg">` next to the app name.

---

## 12. Common Issues & Fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| `EADDRINUSE :3001` | Old Node process still running | `cmd //c "taskkill /F /IM node.exe"` |
| `Invalid namespace: /.hikes` | Missing DB name in URI | Add `/hikingDb` before `?` in `MONGODB_URI` |
| `.env` changes not picked up | nodemon only watches `server/` | Full restart: Ctrl+C → `npm run dev` |
| JWT sign empty response | `JWT_SECRET` undefined | Check `.env` has `JWT_SECRET=...`, restart server |
| Carousel hook order error | `return null` before hooks | Move early return AFTER all hook calls |
| `#` in password fails URI | `#` = fragment in URLs | Use `%23` in `MONGODB_URI`, plain `#` in `ADMIN_PASS` |
| Number input validation error | `step` attribute restricts values | Use `step="any"` to allow any decimal |
