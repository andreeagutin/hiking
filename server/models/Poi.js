import mongoose from 'mongoose';

const poiSchema = new mongoose.Schema(
  {
    name:           { type: String, required: true },
    slug:           { type: String, unique: true, sparse: true },
    poiType:        { type: String, default: null },
    photos:         { type: [String], default: [] },
    mainPhoto:      { type: String, default: null },
    mountains:      { type: String, default: null },
    development:    { type: Number, default: null },
    verticalExtent: { type: Number, default: null },
    altitude:       { type: Number, default: null },
    rockType:       { type: String, default: null },
    zone:           { type: String, default: null },
    address:        { type: String, default: null },
    link:           { type: String, default: null },
    notes:          { type: String, default: null },
    lat:            { type: Number, default: null },
    lng:            { type: Number, default: null },
    active:         { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Poi', poiSchema);
