import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  time:      { type: Number, default: null },
  is_hike:   { type: Boolean, default: true },
  distance:  { type: Number, default: null },
  up:        { type: Number, default: null },
  down:      { type: Number, default: null },
  updatedAt: { type: Date, default: Date.now },
});

const hikeSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true },
    time:       { type: Number, default: null },
    distance:   { type: Number, default: null },
    tip:        { type: String, enum: ['Dus-intors', 'Dus', null], default: null },
    up:         { type: Number, default: null },
    down:       { type: Number, default: null },
    difficulty: { type: String, enum: ['easy', 'medium', null], default: null },
    mountains:  { type: String, default: null },
    status:     { type: String, enum: ['Done', 'In progress', 'Not started'], default: 'Not started' },
    completed:  { type: String, default: null },
    zone:       { type: String, default: null },
    imageUrl:    { type: String, default: null },
    description: { type: String, default: null },
    startLat:    { type: Number, default: null },
    startLng:    { type: Number, default: null },
    history:     { type: [historySchema], default: [] },
    restaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }],
  },
  { timestamps: true }
);

export default mongoose.model('Hike', hikeSchema);
