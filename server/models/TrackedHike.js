import mongoose from 'mongoose';

const trackPointSchema = new mongoose.Schema({
  lat:      Number,
  lng:      Number,
  ele:      Number,
  time:     Date,
  speed:    Number,
  accuracy: Number,
}, { _id: false });

const trackedHikeSchema = new mongoose.Schema({
  user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  linkedHike:     { type: mongoose.Schema.Types.ObjectId, ref: 'Hike', default: null },
  name:           { type: String, default: 'Unnamed Track' },
  startedAt:      Date,
  endedAt:        Date,
  durationSec:    Number,
  distanceM:      Number,
  elevationGainM: Number,
  elevationLossM: Number,
  points:         [trackPointSchema],
  gpxUrl:         String,
  notes:          String,
  createdAt:      { type: Date, default: Date.now },
});

export default mongoose.model('TrackedHike', trackedHikeSchema);
