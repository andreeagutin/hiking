import mongoose from 'mongoose';

const childSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    birthYear: { type: Number, default: null },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: { type: String, required: true },
  name: { type: String, default: '' },
  children: { type: [childSchema], default: [] },
  subscription: {
    type: String,
    enum: ['free', 'explorer', 'pro'],
    default: 'free',
  },
  subExpiresAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  savedHikes:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hike' }],
  savedRestaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }],
  savedPois:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'Poi' }],
});

export default mongoose.model('User', userSchema);
