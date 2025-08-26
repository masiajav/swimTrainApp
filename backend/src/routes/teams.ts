import { Router } from 'express';

const router = Router();

// GET /api/teams
router.get('/', (req, res) => {
  res.json({ message: 'Get teams' });
});

// POST /api/teams
router.post('/', (req, res) => {
  res.json({ message: 'Create new team' });
});

export default router;
