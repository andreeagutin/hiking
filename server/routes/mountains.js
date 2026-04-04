import { Router } from 'express';
import MOUNTAINS_RO from '../data/mountains-ro.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(MOUNTAINS_RO);
});

export default router;
