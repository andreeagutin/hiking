import { Router } from 'express';
import Hike from '../models/Hike.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET all hikes
router.get('/', async (req, res) => {
  try {
    const hikes = await Hike.find().sort({ createdAt: 1 });
    res.json(hikes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single hike
router.get('/:id', async (req, res) => {
  try {
    const hike = await Hike.findById(req.params.id);
    if (!hike) return res.status(404).json({ error: 'Not found' });
    res.json(hike);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create hike
router.post('/', requireAuth, async (req, res) => {
  try {
    const hike = await Hike.create(req.body);
    res.status(201).json(hike);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update hike
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const hike = await Hike.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!hike) return res.status(404).json({ error: 'Not found' });
    res.json(hike);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE hike
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const hike = await Hike.findByIdAndDelete(req.params.id);
    if (!hike) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
