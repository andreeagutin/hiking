import mongoose from 'mongoose';

const caveSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true },
    photos:      { type: [String], default: [] },
    mainPhoto:   { type: String, default: null },
    mountains:   { type: String, default: null },
    development:   { type: Number, default: null },
    verticalExtent: { type: Number, default: null },
    altitude:      { type: Number, default: null },
    rockType:      { type: String, default: null },
    lat:         { type: Number, default: null },
    lng:         { type: Number, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Cave', caveSchema);
