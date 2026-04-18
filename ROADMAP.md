# Hike'n'seek Family — Development Roadmap

Based on the market research: **no family-first hiking app exists in Europe**. Hike'n'Seek evolves from a personal tracker into a family hiking platform, launching in Romania and expanding across Europe.

---

## Current Foundation (Hike'n'Seek)

Already built and production-ready:
- Trail database (hikes, points of interest, restaurants) with full CRUD admin
- AI natural language search (Claude Haiku) — extended to support 25+ filter fields incl. all family/safety fields, highlights, signal, amenities
- RO/EN i18n system
- Leaflet maps + Mapy.cz embed + weather (Open-Meteo)
- OSRM driving distances from user location
- Cloudinary image hosting
- JWT admin auth, Cloudinary uploads, stats page
- **Multi-photo hikes** — `photos[]` + `mainPhoto` on Hike model
- **Family & Safety schema** — all fields live in DB and admin form
- **Trail markers** — 15 SVG markers (red/yellow/blue × 5 shapes), ordered multi-select in admin, displayed in hike detail
- **Family & Safety public UI** — card with suitability chips, highlights, amenities, safety indicators
- **Admin UX improvements** — TagMultiSelect for restaurants, datalist combos for mountains/zone, MarkerPicker for trail markers
- **HikeCard hover overlay** — stat bars (difficulty, distance, time, elevation), family-friendly + bear risk chips
- **Points of Interest (POI)** — generalized POI model replacing Cave, with `poiType`, slug, full admin CRUD, public detail page at `/poi/:slug`
- **URL slugs** — hikes and POIs have human-readable URL slugs; routes accept both slug and ObjectId
- **User accounts** — `User` model with email/password (bcrypt), children profiles, subscription tier; full register/login/profile API with 30d JWT
- **Server security** — `helmet` headers + `express-rate-limit` on login endpoints
- **Mountains API** — `/api/mountains` serves static Romanian mountain ranges list
- **New design** — redesigned public UI (HIK-22)
- **Static info pages** — About, Safety Tips, Gear Guide, Trail Map, Submit Trail, Report Issue, Family Friendly, Mountain Views; site footer + features section (HIK-23)
- **Google Analytics** — gtag.js in `index.html` (HIK-24)
- **JSON-LD structured data** — `TouristAttraction` schema in `HikeDetail` + `PoiDetail` (HIK-25)
- **Cookie consent banner** — GDPR `CookieBanner.jsx`; PWA manifest; CORS hardening (HIK-26)
- **Hike'n'Seek branding** — owl favicon, updated logo (HIK-27)
- **Swagger UI** — OpenAPI 3.0 spec at `/api-docs` via `swagger-ui-express`
- **Sitemap** — auto-generated `/sitemap.xml` from active hikes + POIs
- **Android Capacitor shell** — `android/` project bootstrapped, `com.hikenseek.app`, GPS + background geolocation plugins; `TrackedHike` model + `/api/tracked-hikes` REST API (HIK-28)
- **Hiking Calculator** — `/hiking-calculator` page using Naismith's Rule with pause-level selector and child-age time/distance estimation (HIK-29)
- **Drive duration on HikeCard** — shows driving time next to distance when OSRM data is available (HIK-29)
- **Multi-file photo upload** — AdminHikeForm + AdminPoiForm now accept multiple files at once with per-file progress counter (HIK-29)

This is the data layer and admin backend. Everything below builds on top of it.

---

## Phase 0 — Pre-MVP: Schema & API Foundations
**Duration: 2–3 weeks**
**Goal: Extend the data model to support all family features without breaking existing admin.**

### 0.1 Extend Hike schema (`server/models/Hike.js`)

Add the following fields:

```js
// Family suitability
familyFriendly:       Boolean          // default: false
minAgeRecommended:    Number | null    // years (e.g. 3, 5, 8)
strollerAccessible:   Boolean          // default: false
toddlerFriendly:      Boolean          // default: false — flat, short, safe

// Kid engagement
kidEngagementScore:   Number | null    // 1–5 scale
highlights:           [String]         // e.g. ["waterfall", "stream crossing", "rock scramble", "marmots"]

// Amenities
hasRestAreas:         Boolean          // shade/seating spots along trail
restAreaCount:        Number | null    // approx number of rest spots
hasBathrooms:         Boolean          // any bathroom near trailhead/along trail
bathroomType:         String | null    // 'flush' | 'pit' | 'none'
hasPicknicArea:       Boolean
nearbyPlayground:     Boolean          // playground near trailhead

// Safety (Romania-specific)
bearRisk:             'low' | 'medium' | 'high' | null
sheepdogWarning:      Boolean          // shepherd dogs present in summer
safeWaterSource:      Boolean          // drinkable water on trail
mobileSignal:         'good' | 'partial' | 'none' | null

// Trail marking (Romania's 12-sign system)
trailMarkColor:       String | null    // 'red' | 'yellow' | 'blue'
trailMarkShape:       String | null    // 'stripe' | 'cross' | 'triangle' | 'dot'
salvamontPoint:       String | null    // nearest Salvamont post name/phone
```

### 0.2 Add User model (`server/models/User.js`)

```js
{
  email:        String (required, unique, lowercase)
  passwordHash: String (required)              // bcrypt
  name:         String
  children:     [{ name: String, birthYear: Number }]
  subscription: 'free' | 'explorer' | 'pro'   // default: 'free'
  subExpiresAt: Date | null
  createdAt:    Date
}
```

### 0.3 New API endpoints

```
POST /api/users/register    — create account
POST /api/users/login       — returns user JWT (separate from admin JWT)
GET  /api/users/me          — return profile (auth)
PUT  /api/users/me          — update profile + children (auth)
GET  /api/users/me/subscription — check tier + expiry (auth)
```

### 0.4 Update admin form (`AdminHikeForm.jsx`)

Add all new fields to the edit form, grouped in a "Family & Safety" collapsible section:
- Checkboxes: familyFriendly, strollerAccessible, toddlerFriendly, hasRestAreas, hasBathrooms, hasPicknicArea, nearbyPlayground, sheepdogWarning, safeWaterSource
- Number inputs: minAgeRecommended, restAreaCount, kidEngagementScore (1–5)
- Selects: bathroomType, bearRisk, mobileSignal, trailMarkColor, trailMarkShape
- Text: salvamontPoint
- Tags input: highlights (comma-separated)

### 0.5 Update AI search system prompt (`server/routes/aiSearch.js`)

Add to supported filter fields:
```
familyFriendly, strollerAccessible, toddlerFriendly, minAgeRecommended,
maxAgeRecommended, kidEngagementMin, bearRisk, maxElevation
```

Update `src/App.jsx` filtering logic to handle new fields.

### 0.6 Update i18n (`src/i18n.js`)

Add RO + EN keys for all new fields:
```
hike.familyFriendly, hike.minAge, hike.stroller, hike.kidScore,
hike.highlights, hike.bearRisk, hike.restAreas, hike.bathrooms,
hike.salvamontPoint, hike.trailMark, hike.mobileSignal,
filter.familyFriendly, filter.stroller, filter.minAge
```

**Deliverable:** Updated schema + admin form. All new fields visible in admin, filterable via AI search.

> ✅ **Phase 0 complete** — schema extended, admin form updated, public UI shows Family & Safety data and trail markers. Shipped in HIK-17 through HIK-21. Also includes: User model + auth API, POI (generalized points of interest replacing Cave), URL slugs on hikes + POIs, improved AI search with full family/safety filter support, server security (helmet, rate limiting).

---

## Phase 1 — MVP: Family Web App
**Duration: 6–8 weeks**
**Goal: Publicly launchable web app with the core differentiators. Users can browse, filter family trails, and see age-calibrated info without an account.**

### 1.1 Age-calibrated trail display

The single most important feature with no competitor equivalent.

**Family Pacing Calculator** — utility function `src/utils/familyPacing.js`:
```js
// Multipliers on adult hiking time
// under 5: +100%, age 5–9: +50%, age 10–12: +25%
export function familyTime(adultHours, childrenAges) {
  if (!childrenAges?.length) return adultHours;
  const youngest = Math.min(...childrenAges);
  if (youngest < 5)  return adultHours * 2.0;
  if (youngest < 10) return adultHours * 1.5;
  if (youngest < 13) return adultHours * 1.25;
  return adultHours;
}

// Max recommended distance (1 mile per year of age, ~1.6 km, flat; halved with elevation)
export function recommendedDistanceKm(age, elevationGainM = 0) {
  const flat = age * 1.6;
  const elevationPenalty = elevationGainM > 300 ? 0.5 : 1;
  return +(flat * elevationPenalty).toFixed(1);
}
```

**In `HikeCard.jsx`:** if user has children set, show "~Xh with kids" instead of adult time.

**In `HikeDetail.jsx`:** show "Family time estimate" section with age breakdown table.

### 1.2 User registration & family profiles

New components:
- `src/components/auth/RegisterForm.jsx` — email + password + name
- `src/components/auth/LoginForm.jsx` — email + password (user login, NOT admin)
- `src/components/auth/FamilySetup.jsx` — add children (name + birth year), shown after first login
- `src/components/UserMenu.jsx` — avatar/name in hero top bar, links to profile

Routes (add to `App.jsx`):
```
/register    → RegisterForm
/login       → LoginForm
/profile     → ProfilePage (family members, subscription status)
```

User JWT stored in `localStorage` as `user_token` (separate from `admin_token`).

### 1.3 Family-specific HikeCard

When a hike has `familyFriendly: true`, show a family badge.

New visual elements in `HikeCard.jsx`:
- 👨‍👩‍👧 family badge (if `familyFriendly`)
- 🍼 stroller badge (if `strollerAccessible`)
- ⭐ kid engagement stars (1–5, if `kidEngagementScore` set)
- Age recommendation pill: "Ages 5+" (if `minAgeRecommended` set)

### 1.4 Family detail section in HikeDetail

New "For Families" section in `HikeDetail.jsx`, shown when any family field is set:

```
┌─────────────────────────────────────────┐
│  For Families                           │
│  ✓ Family-friendly  ✓ Ages 5+          │
│  ⭐⭐⭐⭐☆  Kid Engagement             │
│                                         │
│  🕐 With kids: ~3h (adult: 2h)         │
│  🚻 Flush bathrooms at trailhead       │
│  💧 Drinkable water at km 3            │
│  🌳 4 rest/shade areas                 │
│  🧸 Playground near parking            │
│                                         │
│  Trail highlights:                      │
│  🌊 Waterfall  🪨 Rock scramble        │
│  🐿 Marmots likely near ridge          │
│                                         │
│  ⚠ Bear activity: LOW in this area    │
│  📞 Salvamont Sinaia: 0XXXXXXX         │
└─────────────────────────────────────────┘
```

### 1.5 Family filter in hero

Add a quick-filter bar below the main search in `HeroSearch.jsx`:

```
[👨‍👩‍👧 Family friendly] [🍼 Stroller] [Ages 3+▼] [⭐ Kid score 4+]
```

These are toggle buttons that apply client-side filters on top of the existing dropdown filters.

### 1.6 Romania trail markings display

In `HikeDetail.jsx`, if `trailMarkColor` + `trailMarkShape` are set, render the Romanian trail marker visually using CSS/SVG:

```
Trail marking: ──●── (yellow dot) | ──▲── (red triangle)
```

Include a legend tooltip explaining Romania's 12-sign marking system.

### 1.7 Safety section

In `HikeDetail.jsx`, add a collapsible "Safety" section:

```
📶 Mobile signal: Partial  
🐻 Bear risk: Low (spring/summer: check with Salvamont)
🐕 Shepherd dogs: Possible July–September — carry a stick
📞 Salvamont: 0SALVAMONT
📍 Emergency coordinates: [copy what3words]
```

### 1.8 Update AI search for family queries

Extended system prompt handles queries like:
- "drumeție pentru copii de 4 ani" → `{ familyFriendly: true, toddlerFriendly: true, maxHikeHours: 2 }`
- "traseu cu cărucior" → `{ strollerAccessible: true }`
- "drumeție fără urși" → `{ bearRisk: 'low' }`

**MVP Deliverable:** Web app live at `hiking-high.netlify.app` with family features. Users can browse, filter, and see family-specific info without an account. Registration/login ready for Phase 1.5.

---

## Phase 1.5 — Freemium Gate + PWA
**Duration: 2–3 weeks**

### Subscription tiers

| Tier | Price | Gated features |
|------|-------|----------------|
| Free | €0 | Trail browsing, basic family info, AI search (5/day) |
| Family Explorer | €19.99/yr (~100 RON) | Offline maps (PWA), full AI search, family tracking, all safety data |
| Family Pro | €34.99/yr | Everything + gamification, meetup features, nature education |

### Payment integration

- **Stripe** for card payments (Stripe Checkout, no custom UI needed for MVP)
- `server/routes/stripe.js` — `POST /api/stripe/checkout`, `POST /api/stripe/webhook`
- Webhook updates `User.subscription` + `User.subExpiresAt` on payment success
- New component: `src/components/UpgradeModal.jsx` — shown when hitting a gated feature

### PWA (Progressive Web App)

Add to `vite.config.js` via `vite-plugin-pwa`:
- Service worker for offline caching of trail data + map tiles
- `manifest.json` — installable on Android/iOS home screen
- Cache strategy: trail list + details cached on first view, maps cached on trail open
- "Install app" prompt in hero for mobile users

**Note:** PWA covers ~80% of native app use cases for MVP. Full native apps come in Phase 2.

---

## Phase 2 — Native Mobile Apps (Android + iOS)
**Duration: 8–12 weeks**
**Stack: Capacitor 6 (wraps existing React/Vite app in a native shell)**

Capacitor chosen over React Native/Expo because:
- Zero framework rewrite — all 30+ components, i18n, admin, and AI search stay exactly as-is
- Leaflet maps already work in the WebView
- One build command (`npx cap sync`) syncs the Vite build into the native project
- Switches to React Native only if background GPS reliability becomes a blocker

**Already bootstrapped (HIK-28):**
- `android/` Capacitor project, bundle ID `com.hikenseek.app`
- `capacitor.config.json` with GPS + background geolocation plugin config
- `TrackedHike` Mongoose model + REST API at `/api/tracked-hikes`

**New screens to build (all React components, same as web):**

```
src/components/
├── HikeTracker.jsx    # /track — start/stop recording, live Leaflet map + polyline
├── TrackSave.jsx      # /track/save — name the track, link to hike, export GPX
└── TrackDetail.jsx    # /track/:id — elevation chart (Recharts), route map, stats
```

**New routes in App.jsx:** `/track`, `/track/save`, `/track/:id`

### 2.3 Maps

Leaflet (already in the web app) works as-is inside the Capacitor WebView — no Mapbox or native map library needed for the MVP. Leaflet renders the live tracking polyline, trailhead markers, and auto-pans to the user's position. Offline tile caching can be added later via a service worker if needed.

### 2.4 GPS tracking screen (`HikeTracker.jsx`)

- `@capacitor/geolocation` for foreground location; `@capacitor-community/background-geolocation` keeps recording when the screen is off
- `distanceFilter: 10` — only log a point if the user moved ≥10m (saves battery)
- Haversine distance accumulates as points come in
- Leaflet `Polyline` drawn from `trackPoints` array, auto-centered on current position
- Stats bar: elapsed time | distance (km) | elevation gain (m) | current speed
- "Stop & Save" → navigates to `TrackSave.jsx`
- `@capacitor/preferences` persists partial track so a crash/force-close doesn't lose data

### 2.5 GPX export

`generateGPX(trackPoints, hikeName)` utility builds standard GPX 1.1 XML compatible with Strava, Komoot, AllTrails. Saved to device via `@capacitor/filesystem`, shared via native share sheet (`@capacitor/share`).

### 2.6 Live family group tracking *(Phase 2 stretch goal)*

Backend: add `WebSocket` support via `ws` package in `server/index.js`:

```
WS /ws/hike-session/:sessionId
```

Session flow:
1. Family starts a hike → creates session (`POST /api/sessions`)
2. App opens WS connection, broadcasts GPS position every 10s
3. Other family members join session via shared link
4. Map shows all family member positions with name labels
5. Session ends when all leave or after 12h

### 2.7 Push notifications *(Phase 2 stretch goal)*

`@capacitor/push-notifications` handles both Android + iOS:
- "Turn-around reminder: 30 min until sunset"
- "Trail condition update for a trail you saved"

### 2.8 App Store deployment

**Android (Google Play) — first:**
- Google Play Console ($25 one-time)
- Sign APK: `keytool -genkey -v -keystore release.keystore ...`
- Build: `npm run build && npx cap sync && npx cap build android --release` (or Android Studio)
- Target SDK ≥ 35 (required as of 2025); data safety form must declare location collection
- Internal testing → closed testing → production rollout (~1–3 hours for updates)

**iOS (App Store) — requires Mac:**
- Apple Developer account ($99/yr)
- Xcode → archive → upload via Organizer or Transporter → App Store Connect
- Privacy Manifest (`PrivacyInfo.xcprivacy`) required since Feb 2025

---

## Phase 3 — Community + Gamification
**Duration: 8–10 weeks**

### 3.1 Trail reviews with family context

New `Review` model:
```js
{
  hike:           ObjectId (ref 'Hike')
  user:           ObjectId (ref 'User')
  rating:         Number (1–5)
  kidRating:      Number (1–5)       // separate kid-specific rating
  childrenAges:   [Number]           // ages at time of hike
  completedDate:  String
  body:           String (markdown)
  photos:         [String]           // Cloudinary URLs
  helpfulCount:   Number
  tags:           [String]           // e.g. ['stroller-ok', 'muddy-in-rain', 'bear-seen']
}
```

Display in `HikeDetail`: family reviews sorted by date, each showing child ages context — "We went with a 3-year-old and a 6-year-old."

### 3.2 Kid badges + achievements

New `Badge` model + `UserBadge` collection.

Badge categories:
- **Mountain groups**: complete all trails in Bucegi, Retezat, Piatra Craiului, etc.
- **Trail types**: first waterfall trail, first cave, first summit
- **Milestones**: 10 trails, 100 km hiked, 1000m elevation
- **Seasonal**: summer/winter/spring/fall hike
- **Romania-specific**: Via Transilvanica section, all national parks

Displayed in child's profile section. Shareable card generated server-side (canvas or Puppeteer).

### 3.3 Family meetups

New `Event` model:
```js
{
  title:         String
  hike:          ObjectId (ref 'Hike')
  organizer:     ObjectId (ref 'User')
  date:          Date
  description:   String
  maxFamilies:   Number
  participants:  [ObjectId (ref 'User')]
  minAge:        Number | null
  maxAge:        Number | null       // recommended age range for the event
}
```

- `/events` page: list of upcoming family hikes near you
- Auto-recommend trail based on youngest child across all registered families
- Organizer gets participant list; participants get reminder push notification day before

### 3.4 Ambassador program

- `isAmbassador: Boolean` field on User
- Ambassadors can submit trail corrections/additions (moderated by admin)
- Special badge in reviews + profile

---

## Phase 4 — Advanced Safety Intelligence
**Duration: 6–8 weeks**

### 4.1 Turn-around time warnings

Calculated in the tracking screen:
```js
// Warn when: remainingDistance / currentPace > (minutesUntilSunset - 30min safety buffer)
function shouldTurnAround(remainingKm, paceMinsPerKm, sunsetTime, childrenAges) {
  const timeNeeded = remainingKm * paceMinsPerKm * (familyMultiplier(childrenAges));
  const timeAvailable = (sunsetTime - Date.now()) / 60000 - 30;
  return timeNeeded > timeAvailable;
}
```

Push notification + in-app warning banner.

### 4.2 Trail geofencing

Using `expo-location` task manager (background):
- Define trail corridor as a polyline + buffer (e.g. ±100m)
- Background task checks if any family member exits corridor
- Alert sent to all family group members: "[Name] may be off trail"

### 4.3 Seasonal hazard layers

Backend: `server/routes/hazards.js`
- Serve GeoJSON polygons for:
  - Bear activity zones (Carpathian data, updated seasonally)
  - High-water crossing risk (spring snowmelt)
  - Flash flood corridors
  - Avalanche zones (winter)
- Display as map overlay toggle in mobile app + web

### 4.4 Cell coverage map

Integrate ANCOM (Romania's telecom regulator) coverage data or crowd-sourced signal reports:
- User reports signal strength at GPS point → stored in `SignalReport` collection
- Heatmap overlay on trail map showing coverage quality
- Used for "download offline maps" prompt: shown automatically when trail enters low-coverage zone

### 4.5 what3words integration

On the tracking screen:
- Always display current what3words address (3-word location)
- "SOS" button: copies what3words + dials Salvamont emergency number (0-SALVAMONT / 112)
- Offline what3words lookup (downloadable word grid for Romania, ~15MB)

---

## Phase 5 — European Expansion
**Duration: ongoing**

### Country packs

Modular expansion starting with hiking-heavy neighbors:
1. **Bulgaria** — Rila, Pirin, Rhodopes (large Romanian diaspora, similar language)
2. **Hungary** — Bükk, Mátra, Zemplén
3. **Czech Republic** — Šumava, Krkonoše
4. **Austria / Swiss Alps** — premium market, high willingness to pay

Each country pack:
- Trail marking system documented + displayed
- Emergency service integration (local mountain rescue numbers)
- Language pack added to i18n
- Local hazard data (wildlife, weather patterns)

### Komoot migration play

Komoot's Bending Spoons acquisition drove user backlash. Strategy:
- "Import your Komoot trails" feature (GPX import)
- Targeted ads to European hiking communities
- Positioning: "The family hiking app Komoot will never build"

---

## Technical Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTS                                   │
│  Web (React/Vite)    Android App        iOS App (planned)   │
│  hiking-high.netlify  Google Play        App Store           │
│                    (Capacitor 6 — same React/Vite codebase) │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST + WebSocket
┌──────────────────────────▼──────────────────────────────────┐
│                 EXPRESS API (Render)                         │
│  /api/hikes  /api/users  /api/events  /api/reviews          │
│  /api/ai-search  /api/sessions  /api/stripe  /api/hazards   │
│  WS /ws/hike-session/:id                                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   MongoDB Atlas                              │
│  Hike  Cave  Restaurant  User  Review  Badge                 │
│  UserBadge  Event  Session  HazardZone  SignalReport         │
└─────────────────────────────────────────────────────────────┘

External services:
  Anthropic Claude Haiku  — AI search
  Stripe                  — payments
  Cloudinary              — image hosting
  Mapbox                  — mobile maps + offline tiles
  Open-Meteo              — weather (free)
  OSRM                    — driving distances (free)
  Nominatim               — geocoding (free)
  what3words API          — emergency location
  Expo EAS                — mobile builds + OTA updates
```

---

## Prioritized Backlog (GitHub Issues)

### MVP sprint (Phase 0 + 1)
- [x] HIK-17: Extend Hike schema with family + safety fields + multi-photo + trail markers
- [x] HIK-18: HikeCard hover overlay with stat bars + kid engagement stars; User model
- [x] HIK-19: Points of interest (generalized POI replacing Cave), URL slugs, remove status field
- [x] HIK-20: Bug fixes across admin, POI, and family fields
- [x] HIK-21: Improve AI search — extend system prompt with 25+ filter fields (amenities, signal, highlights, sheepdogFree, elevation range)
- [x] HIK-22: New design — redesigned public UI
- [x] HIK-23: Static info pages (About, Safety Tips, Gear Guide, Trail Map, Submit Trail, Report Issue, Family Friendly, Mountain Views) + site footer + features section
- [x] HIK-24: Google Analytics (gtag.js)
- [x] HIK-25: JSON-LD TouristAttraction structured data on HikeDetail + PoiDetail
- [x] HIK-26: Cookie consent banner (GDPR), PWA manifest, CORS hardening
- [x] HIK-27: Hike'n'Seek branding — owl favicon + updated logo
- [x] HIK-28: Age quick-filter section (AgeFilter component with 5 age groups, integrated in App.jsx); TrackedHike model + `/api/tracked-hikes` CRUD routes; Android Capacitor shell (`android/`, `capacitor.config.json`, GPS + background geolocation plugin config)
- [x] HIK-29: Hiking Calculator page (`/hiking-calculator`) — Naismith's Rule time estimator with pause-level selector and child-age estimation; drive duration shown on HikeCard ("X km · 30 min 🚗"); multi-file photo upload with progress counter in AdminHikeForm + AdminPoiForm

### Freemium sprint (Phase 1.5)
- [ ] HIK-30: Stripe integration (checkout + webhook)
- [ ] HIK-31: Subscription gating middleware
- [ ] HIK-32: UpgradeModal component
- [ ] HIK-33: PWA offline cache (vite-plugin-pwa, service worker, offline trail data)

### Mobile sprint (Phase 2) — Capacitor Android (in progress)
- [x] HIK-34: Capacitor shell — `android/` project created, `com.hikenseek.app` bundle ID, GPS + background geolocation plugins configured
- [x] HIK-34b: TrackedHike backend — `server/models/TrackedHike.js` schema + `server/routes/trackedHikes.js` (CRUD + GPX endpoint); registered in `server/index.js`
- [ ] HIK-35: `HikeTracker.jsx` GPS tracking screen — foreground + background location, live Leaflet map with polyline, elapsed time / distance / elevation stats
- [ ] HIK-36: GPX export — `generateGPX()` + `@capacitor/filesystem` save + native share sheet
- [ ] HIK-37: Track detail screen (`TrackDetail.jsx`) — elevation profile (Recharts), full route map, compare to official trail
- [ ] HIK-38: Battery optimization prompt (Android manufacturer kill, deep-link to battery settings)
- [ ] HIK-39: App icon, splash screen, production API URL wired in Capacitor
- [ ] HIK-40: Google Play submission (Android first — easier review cycle)
- [ ] HIK-41: iOS build via Xcode + App Store submission (requires Mac + Apple Developer account)

---

## Timeline Overview

```
Month 1–2   Phase 0: Schema + admin form extensions        ✅ DONE
Month 2–4   Phase 1: MVP family web app (public launch)    ✅ DONE (HIK-17–29)
Month 4–5   Phase 1.5: Freemium + PWA                      (HIK-30–33, upcoming)
Month 5–8   Phase 2: Android/iOS via Capacitor             🔄 IN PROGRESS (HIK-28 shell done)
Month 8–11  Phase 3: Community + gamification
Month 11–13 Phase 4: Advanced safety
Month 14+   Phase 5: European expansion
```

---

## Current state

Phase 0 and Phase 1 are complete. Phase 2 (Android) has the backend and shell in place; the GPS tracking UI is next.

**Next tracks:**
- **HIK-35**: `HikeTracker.jsx` GPS tracking screen — the next Android milestone, unlocks Play Store submission
- **HIK-30–33**: Freemium sprint (Stripe + PWA offline cache)

**Android app status:** Capacitor shell built, GPS plugins configured, `TrackedHike` backend ready. The tracking UI (`HikeTracker.jsx`) is the next code task before the first APK can be tested end-to-end. See `MOBILE_PLAN.md` for the full step-by-step build order.
