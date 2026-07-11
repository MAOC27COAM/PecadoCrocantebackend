import { Router } from 'express';
import { getDeliveryZoneConfig } from '../services/distance.js';

const router = Router();

router.get('/zone', (_req, res) => {
  res.json(getDeliveryZoneConfig());
});

export default router;
