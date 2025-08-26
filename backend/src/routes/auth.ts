import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, username, password, firstName, lastName } = registerSchema.parse(req.body);
    
    // TODO: Implement user registration with Supabase
    res.status(201).json({ 
      message: 'User registered successfully',
      user: { email, username, firstName, lastName }
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid registration data' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    // TODO: Implement user authentication with Supabase
    res.json({ 
      message: 'Login successful',
      token: 'mock-jwt-token',
      user: { email }
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid login credentials' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

export default router;
