import 'dotenv/config';
import mongoose from 'mongoose';
import Poi from '../server/models/Poi.js';
import { uniqueSlug } from '../server/utils/slugify.js';

await mongoose.connect(process.env.MONGODB_URI);

const pois = await Poi.find({ slug: { $exists: false } }).lean();
console.log(`Found ${pois.length} POIs without slugs`);

let updated = 0;
for (const poi of pois) {
  const slug = await uniqueSlug(poi.name, Poi, poi._id);
  await Poi.updateOne({ _id: poi._id }, { $set: { slug } });
  console.log(`  ${poi.name} → ${slug}`);
  updated++;
}

console.log(`\nDone. Updated ${updated} POIs.`);
await mongoose.disconnect();
