import 'dotenv/config';
import mongoose from 'mongoose';
import Hike from '../server/models/Hike.js';

await mongoose.connect(process.env.MONGODB_URI);

const hikeResult = await Hike.updateMany({}, { $set: { active: true } });
console.log(`Updated ${hikeResult.modifiedCount} hikes → active: true`);

// Rename legacy Romanian field names in caves collection (if not yet renamed)
const cavesResult = await mongoose.connection.db.collection('caves').updateMany({}, { $rename: {
  dezvoltare: 'development',
  denivelare: 'verticalExtent',
  altitudine: 'altitude',
  roca: 'rockType',
} });
console.log(`Renamed cave fields in ${cavesResult.modifiedCount} caves`);

await mongoose.disconnect();
