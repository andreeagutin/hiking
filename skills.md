# Hiking High — What Was Built & How

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

Fields: `name`, `time`, `distance`, `tip`, `up`, `down`, `difficulty`, `mountains`, `status`, `completed`, `zone`, `imageUrl`.

To seed the database:
```bash
npm run seed   # runs data/seed.js once
```

---

## 4. REST API (Express)

`server/routes/hikes.js`:
- `GET /api/hikes` — public, returns all hikes sorted by `createdAt`
- `POST /api/hikes` — protected
- `PUT /api/hikes/:id` — protected
- `DELETE /api/hikes/:id` — protected

Protected routes use the `requireAuth` middleware (`server/middleware/auth.js`) which validates the `Authorization: Bearer <token>` header.

---

## 5. JWT Authentication

**Server side** (`server/routes/auth.js`):
- `POST /api/auth/login` — compares credentials against `ADMIN_USER` / `ADMIN_PASS` from `.env`
- On success: signs a JWT with `JWT_SECRET`, expires in 8h
- Wrap `jwt.sign()` in try/catch — if `JWT_SECRET` is undefined it throws silently

**Client side** (`src/api/auth.js`):
- `login()` — POST to `/api/auth/login`, stores token in `localStorage`
- `isLoggedIn()` — decodes JWT payload (base64), checks `exp` against `Date.now()`
- `getToken()` — used by `src/api/hikes.js` to attach `Authorization` header

---

## 6. Public Interface (`/`)

**`App.jsx`** — checks `window.location.pathname`. If `/`, renders public view (read-only).

**`Controls.jsx`** — filter bar with search + 5 dropdowns (status, difficulty, mountains, zone, type). No Add button.

**`HikingTable.jsx`** — sortable table, all columns clickable. No edit functionality.

**`HikeRow.jsx`** — `ViewRow` only, no Edit button, no onClick handlers.

**Filtering** done client-side in `App.jsx` after fetching all hikes once on mount.

---

## 7. Carousel (`HikeCarousel.jsx`)

- Only renders if at least one hike has `imageUrl` set
- Shows gradient background cards as placeholders until real photos are added
- Auto-advances every 5 seconds via `setInterval` in `useEffect`
- Side peek cards show prev/next hike
- **Rules of Hooks:** early `return null` must come AFTER all `useState`/`useEffect`/`useCallback` calls

To add a photo to a hike: set `imageUrl` to any image URL in the Admin Panel or directly in Atlas.

---

## 8. Admin Panel (`/admin`)

Routing is handled without react-router — `App.jsx` reads `window.location.pathname`:

```jsx
const isAdminRoute = window.location.pathname === '/admin';
// evaluated once at module load, before any hooks
```

Flow:
1. Navigate to `/admin`
2. `isLoggedIn()` checks localStorage token expiry
3. If not logged in → `AdminLogin` form
4. On success → token saved → `AdminPanel` renders

**`AdminPanel.jsx`** — full CRUD table with an extra `imageUrl` column. Identical edit/save/delete logic to the original public table, but now protected.

**`AdminLogin.jsx`** — minimal centered form, uses `--forest-*` dark background, same design tokens.

---

## 9. Design System

All in `src/index.css`. No external CSS library.

Key sections:
- `:root` — design tokens (colors, radii, shadows, transitions)
- `.page-header` — dark gradient header with live stats (total trails, done count, km hiked)
- `.carousel-*` — carousel layout, side peeks, overlay, nav dots
- `.admin-login-*` — centered login card
- `.admin-*` — admin header, toolbar, table overrides
- `.badge` — pill badges for status and difficulty
- `.toast` — fixed bottom-right notification

---

## 10. Common Issues & Fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| `EADDRINUSE :3001` | Old Node process still running | `cmd //c "taskkill /F /IM node.exe"` |
| `Invalid namespace: /.hikes` | Missing DB name in URI | Add `/hikingDb` before `?` in `MONGODB_URI` |
| `.env` changes not picked up | nodemon only watches `server/` | Full restart: Ctrl+C → `npm run dev` |
| JWT sign empty response | `JWT_SECRET` undefined | Check `.env` has `JWT_SECRET=...`, restart server |
| Carousel hook order error | `return null` before hooks | Move early return AFTER all hook calls |
| `#` in password fails URI | `#` = fragment in URLs | Use `%23` in `MONGODB_URI`, plain `#` in `ADMIN_PASS` |
