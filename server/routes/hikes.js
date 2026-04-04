import { Router } from 'express';
import Hike from '../models/Hike.js';
import { requireAuth } from '../middleware/auth.js';
import { uniqueSlug } from '../utils/slugify.js';

const router = Router();

const isObjectId = (s) => /^[a-f\d]{24}$/i.test(s);

function findHike(param) {
  return isObjectId(param)
    ? Hike.findById(param)
    : Hike.findOne({ slug: param });
}

// GET all hikes
router.get('/', async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { active: { $ne: false } };
    const hikes = await Hike.find(filter).sort({ createdAt: 1 });
    res.json(hikes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single hike — accepts ObjectId or slug
router.get('/:id', async (req, res) => {
  try {
    const hike = await findHike(req.params.id).populate('pois');
    if (!hike) return res.status(404).json({ error: 'Not found' });
    res.json(hike);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create hike
router.post('/', requireAuth, async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.name && !body.slug) {
      body.slug = await uniqueSlug(body.name, Hike);
    }
    const hike = await Hike.create(body);
    res.status(201).json(hike);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update hike — regenerate slug if name changed
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.name) {
      const current = await Hike.findById(req.params.id).lean();
      if (current && body.name !== current.name) {
        body.slug = await uniqueSlug(body.name, Hike, req.params.id);
      }
    }
    const hike = await Hike.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!hike) return res.status(404).json({ error: 'Not found' });
    res.json(hike);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST add history entry
router.post('/:id/history', requireAuth, async (req, res) => {
  try {
    const hike = await Hike.findById(req.params.id);
    if (!hike) return res.status(404).json({ error: 'Not found' });
    hike.history.push(req.body);
    await hike.save();
    res.status(201).json(hike.history[hike.history.length - 1]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update history entry
router.put('/:id/history/:entryId', requireAuth, async (req, res) => {
  try {
    const hike = await Hike.findById(req.params.id);
    if (!hike) return res.status(404).json({ error: 'Not found' });
    const entry = hike.history.id(req.params.entryId);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    Object.assign(entry, req.body);
    await hike.save();
    res.json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE history entry
router.delete('/:id/history/:entryId', requireAuth, async (req, res) => {
  try {
    const hike = await Hike.findById(req.params.id);
    if (!hike) return res.status(404).json({ error: 'Not found' });
    hike.history.pull(req.params.entryId);
    await hike.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE hike
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const hike = await Hike.findByIdAndDelete(req.params.id);
    if (!hike) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
