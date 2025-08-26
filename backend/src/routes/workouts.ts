import { Router } from 'express';

const router = Router();

// GET /api/workouts
router.get('/', (req, res) => {
  res.json({ message: 'Get workouts' });
});

// POST /api/workouts
router.post('/', (req, res) => {
  res.json({ message: 'Create new workout' });
});

export default router;
