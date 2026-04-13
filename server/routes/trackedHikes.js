import { Router } from 'express';
import TrackedHike from '../models/TrackedHike.js';
import { requireUserAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/tracked-hikes — save a completed track
router.post('/', requireUserAuth, async (req, res) => {
  try {
    const {
      name, linkedHike, notes,
      startedAt, endedAt, durationSec, distanceM, elevationGainM, elevationLossM,
      points,
    } = req.body;

    if (!Array.isArray(points) || points.length === 0) {
      return res.status(400).json({ error: 'Track must have at least one point' });
    }

    const track = await TrackedHike.create({
      user:           req.user.userId,
      linkedHike:     linkedHike || null,
      name:           name || 'Unnamed Track',
      notes:          notes || '',
      startedAt:      startedAt ? new Date(startedAt) : null,
      endedAt:        endedAt   ? new Date(endedAt)   : null,
      durationSec:    durationSec    ?? null,
      distanceM:      distanceM      ?? null,
      elevationGainM: elevationGainM ?? null,
      elevationLossM: elevationLossM ?? null,
      points: points.map(p => ({
        lat:      p.lat,
        lng:      p.lng,
        ele:      p.ele ?? 0,
        time:     p.time ? new Date(p.time) : null,
        speed:    p.speed ?? null,
        accuracy: p.accuracy ?? null,
      })),
    });

    return res.status(201).json(track);
  } catch (err) {
    console.error('[tracked-hikes/create] error:', err.message);
    return res.status(500).json({ error: 'Failed to save track' });
  }
});

// GET /api/tracked-hikes — list user's own tracks (no points, summary only)
router.get('/', requireUserAuth, async (req, res) => {
  try {
    const tracks = await TrackedHike.find({ user: req.user.userId })
      .select('-points')
      .sort({ createdAt: -1 })
      .populate('linkedHike', 'name slug');

    return res.json(tracks);
  } catch (err) {
    console.error('[tracked-hikes/list] error:', err.message);
    return res.status(500).json({ error: 'Failed to load tracks' });
  }
});

// GET /api/tracked-hikes/:id — get single track with all points
router.get('/:id', requireUserAuth, async (req, res) => {
  try {
    const track = await TrackedHike.findOne({ _id: req.params.id, user: req.user.userId })
      .populate('linkedHike', 'name slug distance time up');

    if (!track) return res.status(404).json({ error: 'Track not found' });
    return res.json(track);
  } catch (err) {
    console.error('[tracked-hikes/get] error:', err.message);
    return res.status(500).json({ error: 'Failed to load track' });
  }
});

// DELETE /api/tracked-hikes/:id — delete a track
router.delete('/:id', requireUserAuth, async (req, res) => {
  try {
    const track = await TrackedHike.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    if (!track) return res.status(404).json({ error: 'Track not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error('[tracked-hikes/delete] error:', err.message);
    return res.status(500).json({ error: 'Failed to delete track' });
  }
});

// GET /api/tracked-hikes/:id/gpx — stream GPX file generated from stored points
router.get('/:id/gpx', requireUserAuth, async (req, res) => {
  try {
    const track = await TrackedHike.findOne({ _id: req.params.id, user: req.user.userId });
    if (!track) return res.status(404).json({ error: 'Track not found' });

    const hikeName = track.name || 'My Hike';
    const gpx = generateGPX(track.points, hikeName, track.startedAt);

    const fileName = `${hikeName.replace(/[^a-z0-9]/gi, '_')}_${track._id}.gpx`;
    res.setHeader('Content-Type', 'application/gpx+xml');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.send(gpx);
  } catch (err) {
    console.error('[tracked-hikes/gpx] error:', err.message);
    return res.status(500).json({ error: 'Failed to generate GPX' });
  }
});

function generateGPX(points, hikeName, startedAt) {
  const metaTime = startedAt ? new Date(startedAt).toISOString() : new Date().toISOString();
  const dateLabel = new Date(metaTime).toLocaleDateString('ro-RO');

  const header = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Hike'n'Seek"
     xmlns="http://www.topografix.com/GPX/1/1"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${escapeXml(hikeName)} — ${dateLabel}</name>
    <desc>Recorded with Hike'n'Seek</desc>
    <time>${metaTime}</time>
  </metadata>
  <trk>
    <name>${escapeXml(hikeName)}</name>
    <trkseg>`;

  const trkpts = points.map(p => {
    const timeEl = p.time ? `\n        <time>${new Date(p.time).toISOString()}</time>` : '';
    const speedEl = p.speed != null ? `\n          <speed>${p.speed.toFixed(2)}</speed>` : '';
    const accEl   = p.accuracy != null ? `\n          <accuracy>${p.accuracy.toFixed(1)}</accuracy>` : '';
    const extEl   = speedEl || accEl
      ? `\n        <extensions>${speedEl}${accEl}\n        </extensions>`
      : '';
    return `
      <trkpt lat="${p.lat.toFixed(7)}" lon="${p.lng.toFixed(7)}">
        <ele>${(p.ele ?? 0).toFixed(1)}</ele>${timeEl}${extEl}
      </trkpt>`;
  }).join('');

  const footer = `
    </trkseg>
  </trk>
</gpx>`;

  return header + trkpts + footer;
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default router;
