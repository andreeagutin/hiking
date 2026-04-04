import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true },
    type:      { type: String, enum: ['Restaurant', 'Cabana', 'Pensiune', 'Cafenea', null], default: null },
    mountains: { type: String, default: null },
    zone:      { type: String, default: null },
    address:   { type: String, default: null },
    link:      { type: String, default: null },
    notes:     { type: String, default: null },
    active:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Restaurant', restaurantSchema);
