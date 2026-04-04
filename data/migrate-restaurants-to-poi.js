import 'dotenv/config';
import mongoose from 'mongoose';

await mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection.db;
const restaurantsCol = db.collection('restaurants');
const poisCol        = db.collection('pois');
const hikesCol       = db.collection('hikes');

// 1. Copy all restaurants → pois with poiType: 'restaurant'
const restaurants = await restaurantsCol.find({}).toArray();
console.log(`Found ${restaurants.length} restaurants to migrate`);

if (restaurants.length > 0) {
  const poisToInsert = restaurants.map(({ _id, type, ...rest }) => ({
    _id,
    ...rest,
    poiType: 'restaurant',
    // map restaurant 'type' (Cabana, Pensiune etc.) into notes if set
    notes: rest.notes
      ? (type ? `${type} · ${rest.notes}` : rest.notes)
      : (type || null),
  }));

  const insertResult = await poisCol.insertMany(poisToInsert, { ordered: false }).catch((err) => {
    if (err.code === 11000) {
      console.log('Some restaurants already exist in pois — skipping duplicates');
      return { insertedCount: err.result?.nInserted ?? 0 };
    }
    throw err;
  });
  console.log(`Inserted ${insertResult.insertedCount} restaurants into pois`);
}

// 2. For each hike, merge restaurants array into pois array, then remove restaurants field
const hikes = await hikesCol.find({ restaurants: { $exists: true, $not: { $size: 0 } } }).toArray();
console.log(`Found ${hikes.length} hikes with restaurants to merge`);

for (const hike of hikes) {
  const existingPois = (hike.pois || []).map((id) => id.toString());
  const newPois = (hike.restaurants || [])
    .map((id) => id.toString())
    .filter((id) => !existingPois.includes(id));

  await hikesCol.updateOne(
    { _id: hike._id },
    {
      $push: { pois: { $each: newPois.map((id) => new mongoose.Types.ObjectId(id)) } },
      $unset: { restaurants: '' },
    }
  );
}
console.log(`Merged restaurants into pois for ${hikes.length} hikes`);

// 3. Remove restaurants field from hikes that had empty array
await hikesCol.updateMany({ restaurants: { $exists: true } }, { $unset: { restaurants: '' } });
console.log('Removed restaurants field from remaining hikes');

await mongoose.disconnect();
console.log('Migration complete.');
