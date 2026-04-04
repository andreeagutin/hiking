import 'dotenv/config';
import mongoose from 'mongoose';
import Hike from '../server/models/Hike.js';
import { uniqueSlug } from '../server/utils/slugify.js';

await mongoose.connect(process.env.MONGODB_URI);

const hikes = await Hike.find({ slug: { $exists: false } }).lean();
console.log(`Found ${hikes.length} hikes without slugs`);

let updated = 0;
for (const hike of hikes) {
  const slug = await uniqueSlug(hike.name, Hike, hike._id);
  await Hike.updateOne({ _id: hike._id }, { $set: { slug } });
  console.log(`  ${hike.name} → ${slug}`);
  updated++;
}

console.log(`\nDone. Updated ${updated} hikes.`);
await mongoose.disconnect();
