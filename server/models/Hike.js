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
    slug:       { type: String, unique: true, sparse: true },
    time:       { type: Number, default: null },
    distance:   { type: Number, default: null },
    tip:        { type: String, enum: ['Dus-intors', 'Dus', null], default: null },
    up:         { type: Number, default: null },
    difficulty: { type: String, enum: ['easy', 'medium', null], default: null },
    mountains:  { type: String, default: null },
    zone:       { type: String, default: null },
    imageUrl:    { type: String, default: null },
    photos:      { type: [String], default: [] },
    mainPhoto:   { type: String, default: null },
    description: { type: String, default: null },
    startLat:    { type: Number, default: null },
    startLng:    { type: Number, default: null },
    mapUrl:      { type: String, default: null },
    familyFriendly:     { type: Boolean, default: false },
    minAgeRecommended:  { type: Number, min: 0, default: null },
    strollerAccessible: { type: Boolean, default: false },
    toddlerFriendly:    { type: Boolean, default: false },
    kidEngagementScore: { type: Number, min: 1, max: 5, default: null },
    highlights:         { type: [String], default: [] },
    hasRestAreas:       { type: Boolean, default: false },
    restAreaCount:      { type: Number, min: 0, default: null },
    hasBathrooms:       { type: Boolean, default: false },
    bathroomType:       { type: String, enum: ['flush', 'pit', 'none', null], default: null },
    hasPicknicArea:     { type: Boolean, default: false },
    nearbyPlayground:   { type: Boolean, default: false },
    bearRisk:           { type: String, enum: ['low', 'medium', 'high', null], default: null },
    sheepdogWarning:    { type: Boolean, default: false },
    safeWaterSource:    { type: Boolean, default: false },
    mobileSignal:       { type: String, enum: ['good', 'partial', 'none', null], default: null },
    trailMarkColor:     { type: String, enum: ['red', 'yellow', 'blue', null], default: null },
    trailMarkShape:     { type: String, enum: ['stripe', 'cross', 'triangle', 'dot', null], default: null },
    trailMarkers:       { type: [String], default: [] },
    salvamontPoint:     { type: String, default: null },
    sources:     { type: [String], default: [] },
    active:      { type: Boolean, default: true },
    history:     { type: [historySchema], default: [] },
    pois: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Poi' }],
  },
  { timestamps: true }
);

export default mongoose.model('Hike', hikeSchema);
