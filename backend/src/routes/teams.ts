import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
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
    const team = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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

    // Get team statistics. Count sessions/distance for sessions created by any team member
    // OR explicitly assigned to the team (teamId). This ensures individual member sessions
    // are included even if teamId wasn't set on the session record.
    const memberCountPromise = prisma.user.count({ where: { teamId: user.teamId } });

    const sessionWhereForMembersOrTeam = {
      OR: [
        { teamId: user.teamId },
        { user: { teamId: user.teamId } }
      ]
    } as any;

    const sessionCountPromise = prisma.session.count({ where: sessionWhereForMembersOrTeam });

    const totalDistancePromise = prisma.session.aggregate({
      where: sessionWhereForMembersOrTeam,
      _sum: { distance: true }
    });

    const [memberCount, sessionCount, totalDistance] = await Promise.all([
      memberCountPromise,
      sessionCountPromise,
      totalDistancePromise,
    ]);

    // Get this week's statistics
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const sessionWhereWeekly = {
      AND: [
        { createdAt: { gte: oneWeekAgo } },
        sessionWhereForMembersOrTeam,
      ]
    } as any;

    const [weeklySessionCount, weeklyDistance] = await Promise.all([
      prisma.session.count({ where: sessionWhereWeekly }),
      prisma.session.aggregate({ where: sessionWhereWeekly, _sum: { distance: true } }),
    ]);

    const stats = {
      members: memberCount,
      totalSessions: sessionCount,
      totalDistance: totalDistance._sum.distance || 0,
      weeklySessions: weeklySessionCount,
      weeklyDistance: weeklyDistance._sum.distance || 0,
    };

    // Compute most common stroke for the team (by session count)
    try {
      const strokeGroups = await prisma.session.groupBy({
        by: ['stroke'],
        where: sessionWhereForMembersOrTeam,
        _count: { stroke: true },
      });

      if (strokeGroups && strokeGroups.length > 0) {
        // Find the group with the highest count where stroke is not null
        const filtered = strokeGroups.filter(sg => sg.stroke !== null);
        if (filtered.length > 0) {
          filtered.sort((a, b) => (b._count.stroke || 0) - (a._count.stroke || 0));
          (stats as any).mostCommonStroke = filtered[0].stroke;
        } else {
          (stats as any).mostCommonStroke = null;
        }
      } else {
        (stats as any).mostCommonStroke = null;
      }
    } catch (e) {
      console.warn('Failed to compute mostCommonStroke', e);
      (stats as any).mostCommonStroke = null;
    }

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching team stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
