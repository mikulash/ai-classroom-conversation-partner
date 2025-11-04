import { Router } from 'express';
import prisma from '../../clients/prisma';
import { authenticate, requireAdmin, requireOwner } from '../../middleware/auth.js';

const router = Router();

// All profile routes require authentication
router.use(authenticate);

/**
 * GET /api/profiles
 * Get all profiles (admin/owner only)
 */
router.get('/', requireOwner, async (req, res) => {
  try {
    const profiles = await prisma.profile.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        gender: true,
        conversationRole: true,
        bio: true,
        userRole: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(profiles);
  } catch (error) {
    console.error('Get profiles error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/profiles/:id
 * Get a specific profile by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Users can only view their own profile unless they're admin/owner
    if (req.user?.userId !== id && req.user?.userRole !== 'admin' && req.user?.userRole !== 'owner') {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    const profile = await prisma.profile.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        gender: true,
        conversationRole: true,
        bio: true,
        userRole: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * PUT /api/profiles/:id
 * Update a profile
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, gender, conversationRole, bio } = req.body;

    // Users can only update their own profile unless they're admin/owner
    if (req.user?.userId !== id && req.user?.userRole !== 'admin' && req.user?.userRole !== 'owner') {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    const updatedProfile = await prisma.profile.update({
      where: { id },
      data: {
        fullName,
        gender,
        conversationRole,
        bio,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        gender: true,
        conversationRole: true,
        bio: true,
        userRole: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * PUT /api/profiles/:id/role
 * Update user role (admin/owner only)
 */
router.put('/:id/role', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { userRole } = req.body;

    if (!['basic', 'admin', 'owner'].includes(userRole)) {
      res.status(400).json({ message: 'Invalid user role' });
      return;
    }

    // Only owners can create other owners
    if (userRole === 'owner' && req.user?.userRole !== 'owner') {
      res.status(403).json({ message: 'Only owners can assign owner role' });
      return;
    }

    const updatedProfile = await prisma.profile.update({
      where: { id },
      data: { userRole },
      select: {
        id: true,
        email: true,
        fullName: true,
        gender: true,
        conversationRole: true,
        bio: true,
        userRole: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * DELETE /api/profiles/:id
 * Delete a profile (owner only)
 */
router.delete('/:id', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.profile.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
