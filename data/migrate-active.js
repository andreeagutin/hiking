import 'dotenv/config';
import mongoose from 'mongoose';
import Hike from '../server/models/Hike.js';
import Cave from '../server/models/Cave.js';

await mongoose.connect(process.env.MONGODB_URI);

const hikeResult = await Hike.updateMany({}, { $set: { active: true } });
console.log(`Updated ${hikeResult.modifiedCount} hikes → active: true`);

const caveResult = await Cave.updateMany({}, { $rename: {
  dezvoltare: 'development',
  denivelare: 'verticalExtent',
  altitudine: 'altitude',
  roca: 'rockType',
} });
console.log(`Renamed cave fields in ${caveResult.modifiedCount} caves`);

await mongoose.disconnect();
