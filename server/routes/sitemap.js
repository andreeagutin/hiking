import { Router } from 'express';
import Hike from '../models/Hike.js';
import Poi from '../models/Poi.js';

const router = Router();
const BASE_URL = 'https://hiking-high.netlify.app';

router.get('/', async (_req, res) => {
  try {
    const [hikes, pois] = await Promise.all([
      Hike.find({ active: { $ne: false } }, 'slug _id updatedAt').lean(),
      Poi.find({ active: { $ne: false } }, 'slug _id updatedAt').lean(),
    ]);

    const urls = [
      `<url><loc>${BASE_URL}/</loc></url>`,
      `<url><loc>${BASE_URL}/stats</loc></url>`,
      ...hikes.map((h) => {
        const seg = h.slug || h._id;
        const lastmod = h.updatedAt ? `<lastmod>${h.updatedAt.toISOString().slice(0, 10)}</lastmod>` : '';
        return `<url><loc>${BASE_URL}/hike/${seg}</loc>${lastmod}</url>`;
      }),
      ...pois.map((p) => {
        const seg = p.slug || p._id;
        const lastmod = p.updatedAt ? `<lastmod>${p.updatedAt.toISOString().slice(0, 10)}</lastmod>` : '';
        return `<url><loc>${BASE_URL}/poi/${seg}</loc>${lastmod}</url>`;
      }),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

export default router;
