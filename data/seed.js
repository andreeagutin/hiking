import 'dotenv/config';
import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Inline schema to avoid circular imports from server/
const hikeSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true },
    time:       { type: Number, default: null },
    distance:   { type: Number, default: null },
    tip:        { type: String, default: null },
    up:         { type: Number, default: null },
    down:       { type: Number, default: null },
    difficulty: { type: String, default: null },
    mountains:  { type: String, default: null },
    status:     { type: String, default: 'Not started' },
    completed:  { type: String, default: null },
    zone:       { type: String, default: null },
  },
  { timestamps: true }
);

const Hike = mongoose.model('Hike', hikeSchema);

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set in .env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB Atlas');

  const data = JSON.parse(readFileSync(join(__dirname, 'hikes.json'), 'utf-8'));

  await Hike.deleteMany({});
  console.log('Cleared existing hikes');

  const inserted = await Hike.insertMany(data);
  console.log(`Inserted ${inserted.length} hikes`);

  await mongoose.disconnect();
  console.log('Done');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
