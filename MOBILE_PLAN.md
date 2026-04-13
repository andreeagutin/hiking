# Hike'n'Seek — Mobile App Plan (Android + iOS)
## GPS Live Tracking + GPX Export

> **Purpose:** This document is a vibe-coding guide for building a mobile companion app to the existing Hike'n'Seek web app. Read this before starting any code in VS Code with Claude.

---

## 1. What "making a mobile app" actually means for your stack

Your current app is a **React/Vite SPA + Express/MongoDB backend**. You have two realistic paths to get it onto phones:

### Option A — Capacitor (Recommended for you)

**What it is:** Capacitor wraps your *existing* React/Vite web app into a native shell. You keep your codebase, add a thin native layer, and compile it into an `.apk` (Android) or `.ipa` (iOS).

**Why it's the right call for Hike'n'Seek:**
- Zero framework rewrite. Your 30+ components, i18n system, admin panel, all stay.
- You add `@capacitor/core` and a few plugins, then run one build command.
- The GPS tracking screen is a new React component, same as any other.
- Leaflet maps already work in a WebView.

**Tradeoffs:**
- Runs in a WebView, not fully native rendering (fine for a hiking/trail app)
- Background geolocation needs a community plugin (well-supported)
- Android HTTP throttles WebView after 5 min background — needs native HTTP plugin for sending location updates (only matters if you want server-side live tracking)

### Option B — Expo / React Native (Full rewrite)

New project from scratch in React Native. Better native performance and background GPS reliability, but you'd rebuild every component. Only worth it if you later need highly polished native UX (animations, camera, etc.).

**Verdict: Start with Capacitor. If you hit walls with background GPS reliability after shipping, migrate the tracker screen to a React Native module.** Most well-known hiking apps (AllTrails-style) use a hybrid approach exactly like this.

---

## 2. What you'll need before writing a line of code

### Accounts & Fees
| Requirement | Cost | Notes |
|---|---|---|
| Apple Developer Account | $99/year | Needed to publish to App Store + test on real iOS device |
| Google Play Developer Account | $25 one-time | Needed to publish to Play Store |
| Mac with Xcode | required for iOS | Can't build iOS without a Mac. No way around this. |
| Android Studio | free | For Android builds; works on Windows/Mac/Linux |
| Expo account (optional) | free | Only needed if you switch to Expo later |

### Tools to install
```bash
npm install -g @capacitor/cli
# Android
# → Install Android Studio, set ANDROID_HOME env var
# iOS (Mac only)
# → Install Xcode from App Store, install cocoapods: sudo gem install cocoapods
```

---

## 3. Capacitor Integration — Step by Step

### Step 1: Add Capacitor to the existing project

```bash
cd hiking/
npm install @capacitor/core @capacitor/cli
npx cap init "HikeNSeek" "com.hikenSeek.app" --web-dir=dist
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios   # Mac only
```

This creates `android/` and `ios/` folders. Your `dist/` (Vite build output) becomes the web layer.

### Step 2: Update vite.config.js for mobile

```js
// vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    // Point API calls at your real backend when running in native shell
    proxy: {
      '/api': 'https://your-production-url.com'
    }
  }
})
```

**Important:** In the mobile app, all API calls must go to your production Express server (or a local tunnel like ngrok during dev). The app cannot call `localhost` — the phone doesn't know what that means.

### Step 3: Build and sync

```bash
npm run build          # Vite builds to dist/
npx cap sync           # Copies dist/ into android/assets/ and ios/
npx cap open android   # Opens Android Studio
npx cap open ios       # Opens Xcode (Mac only)
```

Run from Android Studio or Xcode to get your app on a device/simulator.

---

## 4. GPS Live Tracking — Architecture

### How it works on mobile

```
User taps "Start Hike" 
   → App requests location permission (foreground + background)
   → GPS starts collecting points every ~5 seconds
   → Points stored in-memory as an array: [{lat, lng, ele, time}, ...]
   → Map shows live trail drawn behind the user's dot
   → User taps "Stop" → GPX file generated from array → uploaded or saved locally
```

### Required Capacitor plugins

```bash
npm install @capacitor/geolocation
npm install @capacitor-community/background-geolocation
# For saving files on device
npm install @capacitor/filesystem
# For native HTTP (avoids Android background throttle)
npm install @capacitor/preferences   # key-value storage, for persisting partial tracks
```

### Permissions to add

**Android** — in `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
```

**iOS** — in `ios/App/App/Info.plist`:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Hike'n'Seek needs your location to track your hike route.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Hike'n'Seek tracks your location in the background to record your complete hike.</string>
<key>UIBackgroundModes</key>
<array>
  <string>location</string>
</array>
```

---

## 5. The New Tracking Screen — React Component Plan

Create `src/components/HikeTracker.jsx`. This is a **new route** in App.jsx: `/track`.

### Component state
```js
const [tracking, setTracking] = useState(false);       // is recording?
const [trackPoints, setTrackPoints] = useState([]);    // [{lat, lng, ele, time, speed, accuracy}]
const [elapsedTime, setElapsedTime] = useState(0);     // seconds
const [distance, setDistance] = useState(0);           // meters, running total
const [watchId, setWatchId] = useState(null);          // Capacitor watch ID
const [linkedHike, setLinkedHike] = useState(null);    // optional: which hike from DB this matches
```

### Core tracking logic (pseudocode)
```js
import { Geolocation } from '@capacitor/geolocation';
import { BackgroundGeolocation } from '@capacitor-community/background-geolocation';

async function startTracking() {
  // 1. Request permissions
  const perms = await Geolocation.requestPermissions({ location: 'always' });
  if (perms.location !== 'granted') return showError('Location permission denied');

  // 2. Start background watcher
  const id = await BackgroundGeolocation.addWatcher(
    {
      backgroundMessage: "Recording your hike...",
      backgroundTitle: "Hike'n'Seek",
      requestPermissions: true,
      stale: false,
      distanceFilter: 10,   // only log if moved 10+ meters (saves battery)
    },
    (location, error) => {
      if (error) return;
      const point = {
        lat: location.latitude,
        lng: location.longitude,
        ele: location.altitude ?? 0,
        time: new Date().toISOString(),
        speed: location.speed,
        accuracy: location.accuracy,
      };
      setTrackPoints(prev => [...prev, point]);
      // Update running distance
      setDistance(prev => prev + haversineDistance(prev_point, point));
    }
  );
  setWatchId(id);
  setTracking(true);
}

async function stopTracking() {
  if (watchId) await BackgroundGeolocation.removeWatcher({ id: watchId });
  setTracking(false);
  // → show save/export screen
}
```

### Haversine distance helper
```js
function haversineDistance(p1, p2) {
  // Returns meters between two {lat, lng} points
  const R = 6371000;
  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLng = (p2.lng - p1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + 
            Math.cos(p1.lat * Math.PI/180) * Math.cos(p2.lat * Math.PI/180) * 
            Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
```

### Live map on the tracking screen

Use Leaflet (already installed). The tracking screen renders a Leaflet map with:
- A `Polyline` drawn from all `trackPoints`
- A `Marker` at the current position
- Auto-pan to keep user centered

This already works in your WebView since Leaflet is a JS library.

---

## 6. GPX File Format — Full Spec

GPX is standard XML. Every hiking app (Strava, Komoot, Wikiloc, AllTrails) imports GPX. Your generated files will be compatible with all of them.

### Full GPX structure your app should generate

```xml
<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Hike'n'Seek App"
     xmlns="http://www.topografix.com/GPX/1/1"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>Retezat - Lacul Bucura - 2026-04-13</name>
    <desc>Recorded with Hike'n'Seek</desc>
    <time>2026-04-13T09:00:00Z</time>
  </metadata>
  <trk>
    <name>My Hike</name>
    <trkseg>
      <trkpt lat="45.3761" lon="22.8912">
        <ele>1420.5</ele>
        <time>2026-04-13T09:00:05Z</time>
        <extensions>
          <speed>1.2</speed>
          <accuracy>4.5</accuracy>
        </extensions>
      </trkpt>
      <!-- ... more trackpoints ... -->
    </trkseg>
  </trk>
</gpx>
```

### JavaScript function to generate GPX from your trackPoints array

```js
function generateGPX(trackPoints, hikeName = "My Hike") {
  const header = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Hike'n'Seek"
     xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${hikeName} — ${new Date().toLocaleDateString()}</name>
    <desc>Recorded with Hike'n'Seek</desc>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>${hikeName}</name>
    <trkseg>`;

  const points = trackPoints.map(p => `
      <trkpt lat="${p.lat.toFixed(7)}" lon="${p.lng.toFixed(7)}">
        <ele>${(p.ele ?? 0).toFixed(1)}</ele>
        <time>${p.time}</time>
      </trkpt>`).join('');

  const footer = `
    </trkseg>
  </trk>
</gpx>`;

  return header + points + footer;
}
```

### Saving the GPX file to the device

```js
import { Filesystem, Directory } from '@capacitor/filesystem';

async function saveGPX(trackPoints, hikeName) {
  const gpxContent = generateGPX(trackPoints, hikeName);
  const fileName = `${hikeName.replace(/\s+/g, '_')}_${Date.now()}.gpx`;

  await Filesystem.writeFile({
    path: fileName,
    data: gpxContent,
    directory: Directory.Documents,
    encoding: 'utf8',
  });

  // Show share sheet (iOS/Android native share)
  await Share.share({
    title: hikeName,
    text: 'My hike recorded with Hike\'n\'Seek',
    url: `file://${filePath}`,
    dialogTitle: 'Share your GPX track',
  });
}
```

---

## 7. Backend Changes Needed

Your existing Express backend needs these additions:

### New: Tracked Hike Schema (add to `server/models/TrackedHike.js`)

```js
// server/models/TrackedHike.js
import mongoose from 'mongoose';

const trackPointSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  ele: Number,
  time: Date,
  speed: Number,
  accuracy: Number,
}, { _id: false });

const trackedHikeSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  linkedHike:  { type: mongoose.Schema.Types.ObjectId, ref: 'Hike', default: null },
  name:        { type: String, default: 'Unnamed Track' },
  startedAt:   Date,
  endedAt:     Date,
  durationSec: Number,
  distanceM:   Number,        // total meters
  elevationGainM: Number,
  points:      [trackPointSchema],
  gpxUrl:      String,        // optional: Cloudinary URL if uploaded
  notes:       String,
  createdAt:   { type: Date, default: Date.now },
});

export default mongoose.model('TrackedHike', trackedHikeSchema);
```

### New API routes (add to `server/routes/trackedHikes.js`)

```
POST   /api/tracked-hikes          → save a completed track (user JWT)
GET    /api/tracked-hikes          → list user's own tracks (user JWT)
GET    /api/tracked-hikes/:id      → get single track with all points (user JWT)
DELETE /api/tracked-hikes/:id      → delete a track (user JWT)
GET    /api/tracked-hikes/:id/gpx  → download GPX file (user JWT)
```

The `/gpx` endpoint generates and streams the GPX XML on the fly from stored points — no need to store the file unless you also want Cloudinary upload.

---

## 8. Battery & Accuracy Optimization

| Setting | Recommended value | Why |
|---|---|---|
| `distanceFilter` | 10m | Don't log if barely moved. Reduces points by ~60% on slow hikes. |
| GPS accuracy | Balanced (not Highest) | "Highest" drains battery fast; Balanced is fine for trails |
| Update interval | Every 5-10 seconds | Hiking speed means more frequent = redundant data |
| Pause detection | pause if speed < 0.3 m/s for 30s | Don't log when standing still at a viewpoint |
| Batch uploads | Every 50 points | If syncing to server live, batch — don't hit API per point |

On Android, some manufacturers (Xiaomi, Huawei, Samsung with aggressive battery saver) kill background processes. You'll need to tell users to disable battery optimization for your app. Show an in-app prompt that deep-links to the battery settings screen.

---

## 9. New UI Screens to Build

### Screen 1: Tracker Home (`/track`)
- "Start New Hike" button (big, green)
- List of past recorded hikes (pull from backend or device storage)
- Each item shows: name, date, distance, duration, elevation gain

### Screen 2: Active Tracking (`/track/active`)
- Live Leaflet map with drawn trail
- Stats bar: elapsed time | distance | elevation gain | current speed
- "Pause / Resume" button
- "Stop & Save" button (red)
- Warning if GPS accuracy is poor (> 20m accuracy)

### Screen 3: Save Track (`/track/save`)
- Input field: name the hike
- Optional: link to an existing hike from the DB (dropdown)
- Notes field
- Preview map (static, showing the full route)
- Buttons: "Save to Profile" | "Export GPX" | "Discard"

### Screen 4: Track Detail (`/track/:id`)
- Elevation profile chart (Recharts — already installed!)
- Full route on map
- Stats: total distance, duration, pace, elevation gain/loss
- "Export GPX" button
- "Compare to Official Route" (if linked to a hike from DB)

---

## 10. App Store Publishing Checklist

### Before submitting to either store

- [ ] App icon: 1024×1024px PNG (no alpha/transparency on iOS)
- [ ] Splash screen configured in Capacitor
- [ ] Privacy policy URL (required by both stores — can be a page on your site)
- [ ] Location usage justification in both manifests (already listed above)
- [ ] Version number in `capacitor.config.json`
- [ ] Production API URL configured (not localhost)
- [ ] Test on real devices, not just emulators (GPS behaves differently)

### Google Play (Android)
- [ ] Sign APK with a release keystore (`keytool -genkey -v -keystore release.keystore ...`)
- [ ] Target SDK ≥ 35 (Android 15) — required as of 2025
- [ ] Data safety form filled out in Play Console (declare location collection)
- [ ] Build with `npx cap build android --release` or Android Studio

### App Store (iOS — Mac required)
- [ ] Apple Developer account ($99/year)
- [ ] App ID registered in Apple Developer portal
- [ ] Provisioning profile + signing certificate set up in Xcode
- [ ] Privacy Manifest (`PrivacyInfo.xcprivacy`) — required since Feb 2025
- [ ] Build with Xcode → archive → upload via Xcode Organizer or Transporter
- [ ] Submit through App Store Connect

---

## 11. Recommended Build Order (for Vibe Coding)

Work in this order — each phase produces something runnable:

**Phase 1 — Capacitor shell (1-2 hours)**
1. `npm install @capacitor/core @capacitor/cli`
2. `npx cap init` + `npx cap add android`
3. `npm run build && npx cap sync`
4. Open Android Studio, run on emulator — existing web app should appear

**Phase 2 — GPS permission + foreground tracking (2-3 hours)**
1. Install `@capacitor/geolocation`
2. Create `HikeTracker.jsx` with a "Start" button
3. Request location permission on button tap
4. Log GPS points to state, show lat/lng on screen
5. Add to App.jsx router at `/track`

**Phase 3 — Live map (1-2 hours)**
1. Add Leaflet map to tracker screen
2. Draw Polyline from `trackPoints` array
3. Auto-center map on current position

**Phase 4 — Background tracking (1-2 hours)**
1. Install `@capacitor-community/background-geolocation`
2. Update AndroidManifest.xml with background location permissions
3. Swap foreground watcher for background watcher
4. Test by minimizing the app during a walk

**Phase 5 — GPX export (1 hour)**
1. Add `generateGPX()` function
2. Install `@capacitor/filesystem` and `@capacitor/share`
3. "Export GPX" button saves file and opens share sheet
4. Test by importing the .gpx file into Google Maps or Komoot

**Phase 6 — Backend + save to profile (2-3 hours)**
1. Add `TrackedHike` model to server
2. Add `/api/tracked-hikes` routes
3. "Save to Profile" button POSTs track to backend
4. Track history list on `/track` screen

**Phase 7 — Polish + publish (variable)**
1. App icon, splash screen
2. Battery optimization prompt on Android
3. Elevation profile chart (Recharts)
4. Sign and publish to Play Store (Android first — easier)
5. iOS build via Xcode + submit to App Store

---

## 12. Key Files to Create / Modify

| File | Action | What |
|---|---|---|
| `capacitor.config.json` | CREATE | App ID, name, webDir config |
| `android/` | AUTO-CREATED by cap | Don't manually edit; sync via cap CLI |
| `ios/` | AUTO-CREATED by cap | Mac only |
| `src/components/HikeTracker.jsx` | CREATE | Main tracking screen |
| `src/components/TrackDetail.jsx` | CREATE | Track detail + elevation chart |
| `src/App.jsx` | MODIFY | Add `/track` and `/track/:id` routes |
| `server/models/TrackedHike.js` | CREATE | Mongoose schema for tracks |
| `server/routes/trackedHikes.js` | CREATE | CRUD + GPX endpoint |
| `server/index.js` | MODIFY | Register new routes |
| `android/app/src/main/AndroidManifest.xml` | MODIFY | Location permissions |
| `ios/App/App/Info.plist` | MODIFY | Location usage strings |

---

## 13. Prompts to Use When Vibe Coding with Claude

Copy-paste these when you're ready:

**Phase 1:**
> "Add Capacitor to my existing React/Vite/Express project at [path]. The app id should be `com.hikenseek.app` and web dir is `dist`. Show me every command to run and every file to create. Don't touch existing source files."

**Phase 2:**
> "Create `src/components/HikeTracker.jsx` for my Hike'n'Seek app. It should use `@capacitor/geolocation` to request 'always' location permission, then start collecting GPS points into a React state array on button tap. Show lat/lng/elevation in real time. Use my existing i18n system with `t()` calls and the app's CSS classes."

**Phase 4:**
> "Replace the foreground geolocation watcher in `HikeTracker.jsx` with `@capacitor-community/background-geolocation`. The watcher config should set `distanceFilter: 10`, show a notification 'Recording your hike...' and use the app name 'Hike'n'Seek'. Also show me what to add to AndroidManifest.xml."

**Phase 5:**
> "Add a `generateGPX(trackPoints, hikeName)` function to my HikeTracker component and wire up a 'Export GPX' button. Use `@capacitor/filesystem` to save to the Documents directory, then open the native share sheet with `@capacitor/share`."

**Phase 6:**
> "Create `server/models/TrackedHike.js` and `server/routes/trackedHikes.js` for my Express/Mongoose backend (ESM modules). TrackedHike should store: userId ref, optional linked hike ref, name, startedAt, endedAt, durationSec, distanceM, elevationGainM, and an array of {lat, lng, ele, time} points. Routes: POST (save), GET list (own tracks), GET single, DELETE, and GET /gpx (stream GPX file). All routes use the existing `requireUserAuth` middleware."

---

*Last updated: April 2026 — research based on Capacitor 6, React 18, Android SDK 35, iOS 18.*
