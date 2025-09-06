import { Router } from 'express';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '../index';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().min(3),
  avatar: z.string().optional(),
});

// Helper function to generate JWT
const generateToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, username, password, firstName, lastName } = registerSchema.parse(req.body);
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Create user record in our database
    const user = await prisma.user.create({
      data: {
        id: authData.user!.id,
        email,
        username,
        firstName,
        lastName,
      },
    });

    // Generate JWT token
    const token = generateToken(user.id);

    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    console.error('Registration error:', error);
    res.status(400).json({ error: 'Invalid registration data' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Get user from our database
    const user = await prisma.user.findUnique({
      where: { id: authData.user!.id },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({ 
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: 'Invalid login credentials' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Google token is required' });
    }

    // Get user info from Supabase using the access token
    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError) {
      console.error('Supabase auth error:', authError);
      return res.status(401).json({ error: authError.message });
    }

    const authUser = authData.user;
    
    if (!authUser) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Check if user exists in our database
    let user = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    // Create user if doesn't exist (first-time Google login)
    if (!user) {
      console.log('Creating new user from Google OAuth:', authUser.email);
      user = await prisma.user.create({
        data: {
          id: authUser.id,
          email: authUser.email!,
          username: authUser.email!.split('@')[0], // Use email prefix as username
          firstName: authUser.user_metadata?.full_name?.split(' ')[0] || '',
          lastName: authUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          avatar: authUser.user_metadata?.avatar_url,
        },
      });
    } else {
      console.log('Existing user Google login:', user.email);
    }

    // Generate JWT token
    const jwtToken = generateToken(user.id);

    res.json({
      message: 'Google authentication successful',
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// GET /api/auth/profile - Get current user profile
router.get('/profile', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        createdAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.userId;
    const { firstName, lastName, username, avatar } = updateProfileSchema.parse(req.body);
    
    // Check if username is already taken (excluding current user)
    const existingUser = await prisma.user.findFirst({
      where: {
        username,
        NOT: { id: userId }
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        username,
        avatar,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
      }
    });

    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid profile data' });
    }
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
