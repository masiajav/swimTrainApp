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

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
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
      console.error('Supabase createUser error:', authError);
      // If the email already exists in Supabase, be friendly: try to sign in the user with provided password.
      if ((authError as any)?.code === 'email_exists') {
        // Try to sign in with the provided credentials; if successful, create local record if missing and return token.
        try {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) {
            // Password probably wrong; tell client to login or reset password
            return res.status(409).json({ error: 'Email already registered. Please login or reset your password.' });
          }

          const supabaseUserId = signInData?.user?.id || signInData?.session?.user?.id;
          if (!supabaseUserId) {
            return res.status(500).json({ error: 'Auth provider returned no user id after sign-in' });
          }

          // Ensure local user exists
          let existing = await prisma.user.findUnique({ where: { id: supabaseUserId } });
          if (!existing) {
            // If email already exists in our DB with different id, prefer finding by email
            const byEmail = await prisma.user.findUnique({ where: { email } as any });
            if (byEmail) {
              existing = byEmail;
            } else {
              try {
                existing = await prisma.user.create({ data: { id: supabaseUserId, email, username } });
              } catch (e: any) {
                if (e?.code === 'P2002') {
                  // Unique constraint (likely email) - find the record by email and use it
                  existing = await prisma.user.findUnique({ where: { email } as any });
                } else {
                  console.error('Failed to create local user after existing Supabase sign-in:', e);
                  return res.status(500).json({ error: 'Failed to create local user record' });
                }
              }
            }
          }

          // Ensure existing is available
          if (!existing) {
            console.error('Could not resolve existing user after sign-in flow');
            return res.status(500).json({ error: 'Failed to resolve existing user' });
          }

          // Generate JWT and return as if registered/logged in
          const token = generateToken(existing.id);
          return res.status(200).json({ message: 'Existing user signed in', token, user: { id: existing.id, email: existing.email, username: existing.username } });
        } catch (e) {
          console.error('Error handling existing email during register:', e);
          return res.status(500).json({ error: 'Failed to handle existing user registration' });
        }
      }

      return res.status(400).json({ error: authError.message || 'Failed to create user in auth provider' });
    }

    // Create user record in our database
    if (!authData || !authData.user || !authData.user.id) {
      console.error('Supabase returned no user after createUser', authData);
      return res.status(500).json({ error: 'Auth provider did not return user information' });
    }

    const user = await prisma.user.upsert({
      where: { id: authData.user.id },
      update: {
        email,
        username,
        firstName,
        lastName,
      },
      create: {
        id: authData.user.id,
        email,
        username,
        firstName,
        lastName,
      }
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
      console.error('Supabase signIn error:', authError);
      return res.status(401).json({ error: authError.message || 'Invalid email or password' });
    }

    // authData may contain { session, user }
    const supabaseUserId = authData?.user?.id || authData?.session?.user?.id;
    if (!supabaseUserId) {
      console.error('No user id returned from supabase on signIn', authData);
      return res.status(500).json({ error: 'Authentication provider returned no user id' });
    }

    // Get user from our database
    let user = await prisma.user.findUnique({
      where: { id: supabaseUserId },
    });

    if (!user) {
      // If the user exists in Supabase but not in our DB, create a local record.
      // This can happen if the user was created directly in Supabase admin or via OAuth.
      console.warn('User found in Supabase but not in prisma DB; creating local record for', supabaseUserId);
      // Try to get email/username from supabase auth data if available
      const emailFromSupabase = authData?.user?.email || authData?.session?.user?.email || email;
      const usernameFromSupabase = emailFromSupabase ? emailFromSupabase.split('@')[0] : `user_${Date.now()}`;
      try {
        // First, try to find any local user by email to avoid unique constraint errors
        if (emailFromSupabase) {
          const byEmail = await prisma.user.findUnique({ where: { email: emailFromSupabase } as any });
          if (byEmail) {
            user = byEmail;
          }
        }

        if (!user) {
          const created = await prisma.user.upsert({
            where: { id: supabaseUserId },
            update: {
              email: emailFromSupabase,
              username: usernameFromSupabase || `user_${Date.now()}`,
            },
            create: {
              id: supabaseUserId,
              email: emailFromSupabase,
              username: usernameFromSupabase || `user_${Date.now()}`,
            }
          });
          // assign the upserted record to `user`
          user = created;
        }
      } catch (createErr: any) {
        console.error('Failed to create local user record:', createErr);
        // If unique constraint failed, try to retrieve the record by email as a fallback
        if (createErr?.code === 'P2002' && emailFromSupabase) {
          const fallback = await prisma.user.findUnique({ where: { email: emailFromSupabase } as any });
          if (fallback) {
            user = fallback;
          } else {
            return res.status(500).json({ error: 'Unique constraint error and fallback lookup failed' });
          }
        } else {
          return res.status(500).json({ error: 'Failed to create local user record' });
        }
      }
    }

    // Ensure user exists at this point
    if (!user) {
      console.error('User missing after attempted creation for supabase id', supabaseUserId);
      return res.status(500).json({ error: 'User not available after authentication' });
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
      console.log('Creating new user from Google OAuth or upserting:', authUser.email);
      user = await prisma.user.upsert({
        where: { id: authUser.id },
        update: {
          email: authUser.email!,
          username: authUser.email!.split('@')[0],
          firstName: authUser.user_metadata?.full_name?.split(' ')[0] || '',
          lastName: authUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          avatar: authUser.user_metadata?.avatar_url,
        },
        create: {
          id: authUser.id,
          email: authUser.email!,
          username: authUser.email!.split('@')[0],
          firstName: authUser.user_metadata?.full_name?.split(' ')[0] || '',
          lastName: authUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          avatar: authUser.user_metadata?.avatar_url,
        }
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

// PUT /api/auth/change-password - Change user password
router.put('/change-password', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password with Supabase
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update password in Supabase
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (updateError) {
      return res.status(400).json({ error: 'Failed to update password' });
    }

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid password data' });
    }
    res.status(500).json({ error: 'Failed to change password' });
  }
});

export default router;
