import mongoose from 'mongoose';

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
    imageUrl:   { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Hike', hikeSchema);
