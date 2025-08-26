import { Router } from 'express';

const router = Router();

// GET /api/sessions
router.get('/', (req, res) => {
  res.json({ message: 'Get swimming sessions' });
});

// POST /api/sessions
router.post('/', (req, res) => {
  res.json({ message: 'Create new swimming session' });
});

// GET /api/sessions/:id
router.get('/:id', (req, res) => {
  res.json({ message: `Get session ${req.params.id}` });
});

export default router;
