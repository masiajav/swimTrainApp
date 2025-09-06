import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/teams - Get user's team
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        team: {
          include: {
            members: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
                role: true,
                createdAt: true,
              }
            },
            sessions: {
              take: 5,
              orderBy: { createdAt: 'desc' },
              include: {
                user: {
                  select: {
                    username: true,
                    firstName: true,
                    lastName: true,
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user?.team) {
      return res.json({ team: null });
    }

    res.json({ team: user.team });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/teams - Create new team
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.userId;
    const { name, description, avatar } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    // Check if user is already in a team
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { teamId: true }
    });

    if (user?.teamId) {
      return res.status(400).json({ error: 'You are already a member of a team' });
    }

    // Create team and update user
    const team = await prisma.$transaction(async (tx) => {
      const newTeam = await tx.team.create({
        data: {
          name,
          description,
          avatar,
        }
      });

      await tx.user.update({
        where: { id: userId },
        data: { 
          teamId: newTeam.id,
          role: 'CAPTAIN' // Creator becomes captain
        }
      });

      return newTeam;
    });

    res.status(201).json({ team });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/teams/join - Join team with invite code
router.post('/join', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.userId;
    const { inviteCode } = req.body;

    if (!inviteCode) {
      return res.status(400).json({ error: 'Invite code is required' });
    }

    // Check if user is already in a team
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { teamId: true }
    });

    if (user?.teamId) {
      return res.status(400).json({ error: 'You are already a member of a team' });
    }

    // Find team by invite code
    const team = await prisma.team.findUnique({
      where: { inviteCode },
      include: {
        members: {
          select: { id: true }
        }
      }
    });

    if (!team) {
      return res.status(404).json({ error: 'Invalid invite code' });
    }

    // Update user to join team
    await prisma.user.update({
      where: { id: userId },
      data: { 
        teamId: team.id,
        role: 'MEMBER'
      }
    });

    res.json({ 
      message: 'Successfully joined team',
      team: {
        id: team.id,
        name: team.name,
        description: team.description,
      }
    });
  } catch (error) {
    console.error('Error joining team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/teams/leave - Leave team
router.delete('/leave', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { teamId: true, role: true }
    });

    if (!user?.teamId) {
      return res.status(400).json({ error: 'You are not a member of any team' });
    }

    // Check if user is the last captain
    if (user.role === 'CAPTAIN') {
      const teamCaptains = await prisma.user.count({
        where: { 
          teamId: user.teamId,
          role: 'CAPTAIN'
        }
      });

      const teamMembers = await prisma.user.count({
        where: { teamId: user.teamId }
      });

      if (teamCaptains === 1 && teamMembers > 1) {
        return res.status(400).json({ 
          error: 'You must promote another member to captain before leaving' 
        });
      }
    }

    // Remove user from team
    await prisma.user.update({
      where: { id: userId },
      data: { 
        teamId: null,
        role: 'MEMBER'
      }
    });

    res.json({ message: 'Successfully left team' });
  } catch (error) {
    console.error('Error leaving team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/teams/stats - Get team statistics
router.get('/stats', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { teamId: true }
    });

    if (!user?.teamId) {
      return res.status(400).json({ error: 'You are not a member of any team' });
    }

    // Get team statistics
    const [memberCount, sessionCount, totalDistance] = await Promise.all([
      prisma.user.count({
        where: { teamId: user.teamId }
      }),
      prisma.session.count({
        where: { teamId: user.teamId }
      }),
      prisma.session.aggregate({
        where: { teamId: user.teamId },
        _sum: { distance: true }
      })
    ]);

    // Get this week's statistics
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [weeklySessionCount, weeklyDistance] = await Promise.all([
      prisma.session.count({
        where: { 
          teamId: user.teamId,
          createdAt: { gte: oneWeekAgo }
        }
      }),
      prisma.session.aggregate({
        where: { 
          teamId: user.teamId,
          createdAt: { gte: oneWeekAgo }
        },
        _sum: { distance: true }
      })
    ]);

    const stats = {
      members: memberCount,
      totalSessions: sessionCount,
      totalDistance: totalDistance._sum.distance || 0,
      weeklySessions: weeklySessionCount,
      weeklyDistance: weeklyDistance._sum.distance || 0,
    };

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching team stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
