/**
 * Migration: seed SEO keywords for all existing hikes and POIs.
 * Run once: node data/migrate-keywords.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import Hike from '../server/models/Hike.js';
import Poi from '../server/models/Poi.js';

await mongoose.connect(process.env.MONGODB_URI);

// ── Helpers ──────────────────────────────────────────────────────────────────

function hikeKeywords(hike) {
  const kw = new Set([
    'hiking trails Romania',
    'drumeții montane România',
    'trasee montane',
    'Carpathian hiking',
    'trekking Romania',
    'outdoor adventure Romania',
  ]);

  if (hike.name) kw.add(hike.name);
  if (hike.mountains) {
    kw.add(hike.mountains);
    kw.add(`${hike.mountains} hiking`);
    kw.add(`${hike.mountains} trails`);
  }
  if (hike.zone) kw.add(hike.zone);

  if (hike.difficulty === 'easy') {
    kw.add('easy hike Romania');
    kw.add('easy hiking trails');
    kw.add('best hikes beginners Romania');
  } else if (hike.difficulty === 'medium') {
    kw.add('moderate hike Romania');
    kw.add('intermediate hiking trails');
  }

  if (hike.familyFriendly) {
    kw.add('family hiking Romania');
    kw.add('family friendly hiking');
    kw.add('hiking with kids Romania');
    kw.add('family friendly Carpathians');
  }
  if (hike.toddlerFriendly) kw.add('toddler friendly hiking');
  if (hike.strollerAccessible) kw.add('stroller accessible trail');

  if (hike.bearRisk) kw.add('bear safety mountains');
  if (hike.hasBathrooms) kw.add('hiking trail with facilities');
  if (hike.hasPicknicArea) kw.add('picnic hiking trail');

  if (hike.distance && hike.distance <= 5) kw.add('short hiking trail Romania');
  if (hike.distance && hike.distance >= 15) kw.add('long distance hiking Romania');
  if (hike.up && hike.up >= 500) kw.add('elevation gain hiking');

  (hike.highlights || []).forEach((h) => kw.add(h));

  if (hike.startLat && hike.startLng) kw.add('GPS hiking trail Romania');
  if (hike.trailMarkers && hike.trailMarkers.length) kw.add('trail markers hiking');

  return [...kw];
}

function poiKeywords(poi) {
  const kw = new Set([
    'points of interest Romania',
    'trasee montane România',
    'outdoor Romania',
  ]);

  if (poi.name) kw.add(poi.name);
  if (poi.mountains) {
    kw.add(poi.mountains);
    kw.add(`${poi.mountains} hiking`);
  }
  if (poi.zone) kw.add(poi.zone);

  const type = (poi.poiType || '').toLowerCase();
  if (type === 'cave') {
    kw.add('cave tours Romania');
    kw.add('peșteri România');
    kw.add('Apuseni caves');
    kw.add('cave hiking Romania');
  } else if (type === 'waterfall') {
    kw.add('waterfall hikes Romania');
    kw.add('cascade România');
    kw.add('cascades hiking trails');
  } else if (type === 'viewpoint') {
    kw.add('mountain viewpoints Romania');
    kw.add('scenic viewpoints Carpathians');
    kw.add('panoramic view hiking');
  } else if (type === 'lake') {
    kw.add('mountain lake Romania');
    kw.add('lac munte drumeție');
  } else if (type === 'gorge') {
    kw.add('gorge hiking Romania');
    kw.add('cheile drumeție');
  }

  if (poi.altitude && poi.altitude >= 1500) kw.add('high altitude hiking Romania');
  if (poi.lat && poi.lng) kw.add('GPS hiking trail Romania');

  return [...kw];
}

// ── Hikes ─────────────────────────────────────────────────────────────────────

const hikes = await Hike.find({});
let hikeUpdated = 0;

for (const hike of hikes) {
  const existing = hike.keywords || [];
  if (existing.length > 0) {
    console.log(`  skip hike "${hike.name}" — already has ${existing.length} keywords`);
    continue;
  }
  const keywords = hikeKeywords(hike);
  await Hike.updateOne({ _id: hike._id }, { $set: { keywords } });
  console.log(`  hike "${hike.name}" → ${keywords.length} keywords`);
  hikeUpdated++;
}
console.log(`\nHikes updated: ${hikeUpdated} / ${hikes.length}`);

// ── POIs ──────────────────────────────────────────────────────────────────────

const pois = await Poi.find({});
let poiUpdated = 0;

for (const poi of pois) {
  const existing = poi.keywords || [];
  if (existing.length > 0) {
    console.log(`  skip POI "${poi.name}" — already has ${existing.length} keywords`);
    continue;
  }
  const keywords = poiKeywords(poi);
  await Poi.updateOne({ _id: poi._id }, { $set: { keywords } });
  console.log(`  POI "${poi.name}" → ${keywords.length} keywords`);
  poiUpdated++;
}
console.log(`\nPOIs updated: ${poiUpdated} / ${pois.length}`);

await mongoose.disconnect();
console.log('\nDone.');
