import { Router } from 'express';
import Poi from '../models/Poi.js';
import { requireAuth } from '../middleware/auth.js';
import { uniqueSlug } from '../utils/slugify.js';

const router = Router();

const isObjectId = (s) => /^[a-f\d]{24}$/i.test(s);

function findPoi(param) {
  return isObjectId(param)
    ? Poi.findById(param)
    : Poi.findOne({ slug: param });
}

router.get('/', async (_req, res) => {
  try {
    const list = await Poi.find().sort({ name: 1 });
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const poi = await findPoi(req.params.id);
    if (!poi) return res.status(404).json({ error: 'Not found' });
    res.json(poi);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.name && !body.slug) {
      body.slug = await uniqueSlug(body.name, Poi);
    }
    const poi = await Poi.create(body);
    res.status(201).json(poi);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.name) {
      const current = await Poi.findById(req.params.id).lean();
      if (current && body.name !== current.name) {
        body.slug = await uniqueSlug(body.name, Poi, req.params.id);
      }
    }
    const poi = await Poi.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!poi) return res.status(404).json({ error: 'Not found' });
    res.json(poi);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const poi = await Poi.findByIdAndDelete(req.params.id);
    if (!poi) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
