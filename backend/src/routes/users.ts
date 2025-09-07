import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/users/profile
router.get('/profile', (req, res) => {
  res.json({ message: 'User profile endpoint' });
});

// PUT /api/users/profile
router.put('/profile', (req, res) => {
  res.json({ message: 'Update user profile endpoint' });
});

// GET /api/users/:userId/profile - Get public profile data for team members
router.get('/:userId/profile', authenticateToken, async (req: any, res) => {
  try {
    const requesterId = req.userId;
    const targetUserId = req.params.userId;

    // First verify that both users are in the same team
    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
      select: { teamId: true }
    });

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        sessions: {
          orderBy: { date: 'desc' },
          take: 50 // Limit to recent sessions for performance
        }
      }
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Type assertion to ensure TypeScript knows about the role field
    const userWithRole = targetUser as typeof targetUser & { role: string };

    // Check if both users are in the same team
    if (!requester?.teamId || requester.teamId !== targetUser.teamId) {
      return res.status(403).json({ error: 'You can only view profiles of your team members' });
    }

    // Calculate user statistics
    const sessions = targetUser.sessions;
    const totalSessions = sessions.length;
    const totalDistance = sessions.reduce((sum: number, session: any) => sum + (session.distance || 0), 0);
    const totalDuration = sessions.reduce((sum: number, session: any) => sum + session.duration, 0);
    const avgDistance = totalSessions > 0 ? totalDistance / totalSessions : 0;

    // Calculate weekly stats (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklySessions = sessions.filter((session: any) => 
      new Date(session.date) >= oneWeekAgo
    );
    
    const weeklyDistance = weeklySessions.reduce((sum: number, session: any) => sum + (session.distance || 0), 0);
    const weeklySessionCount = weeklySessions.length;

    // Calculate workout type distribution
    const workoutTypes: { [key: string]: number } = {};
    sessions.forEach((session: any) => {
      if (session.workoutType) {
        workoutTypes[session.workoutType] = (workoutTypes[session.workoutType] || 0) + 1;
      }
    });

    console.log('Return public profile data')
    // Return public profile data
    const publicProfile = {
      id: targetUser.id,
      firstName: targetUser.firstName,
      lastName: targetUser.lastName,
      username: targetUser.username,
      avatar: targetUser.avatar,
      role: userWithRole.role,
      stats: {
        totalSessions,
        totalDistance,
        totalDuration,
        avgDistance,
        weeklyDistance,
        weeklySessionCount,
        workoutTypes
      },
      recentSessions: sessions.slice(0, 10).map((session: any) => ({
        id: session.id,
        title: session.title,
        date: session.date,
        distance: session.distance,
        duration: session.duration,
        workoutType: session.workoutType,
        intensity: session.intensity
      }))
    };

    res.json({ profile: publicProfile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
