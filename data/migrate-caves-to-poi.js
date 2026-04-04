import 'dotenv/config';
import mongoose from 'mongoose';

await mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection.db;
const cavesCol = db.collection('caves');
const poisCol  = db.collection('pois');
const hikesCol = db.collection('hikes');

// 1. Copy all documents from caves → pois, setting poiType: 'cave'
const caves = await cavesCol.find({}).toArray();
console.log(`Found ${caves.length} caves to migrate`);

if (caves.length > 0) {
  const poisToInsert = caves.map(({ _id, ...rest }) => ({
    _id,
    ...rest,
    poiType: rest.poiType || 'cave',
  }));

  const insertResult = await poisCol.insertMany(poisToInsert, { ordered: false }).catch((err) => {
    // ignore duplicate key errors (already migrated)
    if (err.code === 11000) {
      console.log('Some documents already exist in pois — skipping duplicates');
      return { insertedCount: err.result?.nInserted ?? 0 };
    }
    throw err;
  });
  console.log(`Inserted ${insertResult.insertedCount} documents into pois`);
}

// 2. Rename caves → pois field in hikes collection
const hikesResult = await hikesCol.updateMany(
  { caves: { $exists: true } },
  { $rename: { caves: 'pois' } }
);
console.log(`Renamed caves → pois field in ${hikesResult.modifiedCount} hikes`);

await mongoose.disconnect();
console.log('Migration complete.');
