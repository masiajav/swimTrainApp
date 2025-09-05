import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import jwt from 'jsonwebtoken';

const router = Router();

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.userId = user.userId;
    next();
  });
};

// Validation schema for session creation
const createSessionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  date: z.string().datetime(),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  distance: z.number().optional(),
  workoutType: z.enum(['WARMUP', 'MAIN_SET', 'COOLDOWN', 'TECHNIQUE', 'SPRINT', 'ENDURANCE', 'KICK', 'PULL']).optional(),
  stroke: z.enum(['FREESTYLE', 'BACKSTROKE', 'BREASTSTROKE', 'BUTTERFLY', 'INDIVIDUAL_MEDLEY', 'MIXED']).optional(),
  intensity: z.enum(['EASY', 'MODERATE', 'HARD', 'RACE_PACE']).optional(),
});

// GET /api/sessions - Get user's sessions
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const sessions = await prisma.session.findMany({
      where: { userId: req.userId },
      include: {
        workouts: true,
      },
      orderBy: { date: 'desc' },
    });

    res.json({ data: sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// POST /api/sessions - Create new session
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    console.log('Session creation request body:', req.body);
    console.log('Request content-type:', req.headers['content-type']);
    
    const { title, description, date, duration, distance, workoutType, stroke, intensity } = createSessionSchema.parse(req.body);

    const session = await prisma.session.create({
      data: {
        title,
        description,
        date: new Date(date),
        duration,
        distance,
        workoutType,
        stroke,
        intensity,
        userId: req.userId,
      },
      include: {
        workouts: true,
      },
    });

    res.status(201).json({
      message: 'Session created successfully',
      data: session,
    });
  } catch (error: any) {
    console.error('Create session error:', error);
    if (error.errors) {
      return res.status(400).json({ error: 'Invalid session data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// GET /api/sessions/:id - Get specific session
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const session = await prisma.session.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId, // Ensure user can only access their own sessions
      },
      include: {
        workouts: true,
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

export default router;
