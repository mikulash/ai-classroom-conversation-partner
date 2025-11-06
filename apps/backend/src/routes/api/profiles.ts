import { Router, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import prisma from '../../clients/prisma';
import { authenticate, requireAdmin, requireOwner } from '../../middleware/auth.js';
import { Profile, ProfileExtended } from '@repo/shared/types/db/entities';
import { ErrorResponse } from '@repo/shared/types/apiFigurantClient';
import { UserRole } from '@repo/shared/types/db/enums';
// Path parameter types
interface ProfileIdParams extends ParamsDictionary {
    id: string;
}

const router = Router();


// small helper to unify the shape
function mapUserToProfileExtended(user: {
    id: string;
    email: string;
    confirmedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    profile: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        fullName: string | null;
        gender: string | null;
        conversationRole: string;
        userRole: UserRole;
        bio: string | null;
    } | null;
}): ProfileExtended {
  // if profile is missing, synthesize it from user
  return {
    id: user.id, // you can also keep profile.id if you want; but for API it’s nice to have stable id
    createdAt: user.profile?.createdAt ?? user.createdAt,
    updatedAt: user.profile?.updatedAt ?? user.updatedAt,
    fullName: user.profile?.fullName ?? null,
    gender: user.profile?.gender ?? null,
    conversationRole: user.profile?.conversationRole ?? '',
    bio: user.profile?.bio ?? null,
    email: user.email,
    userRole: user.profile?.userRole ?? 'basic',
    confirmedAt: user.confirmedAt ?? null,
  };
}

// All profile routes require authentication
router.use(authenticate);

/**
 * GET /api/profiles
 * Get all profiles (owner only)
 */
router.get(
  '/',
  requireOwner,
  async (
    req: Request,
    res: Response<ProfileExtended[] | ErrorResponse>,
  ) => {
    try {
      const users = await prisma.user.findMany({
        include: {
          profile: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const profiles = users.map(mapUserToProfileExtended);

      res.status(200).json(profiles);
    } catch (error) {
      console.error('Get profiles error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
);

/**
 * GET /api/profiles/:id
 * Get a specific profile by user ID
 */
router.get(
  '/:id',
  async (
    req: Request<ProfileIdParams>,
    res: Response<ProfileExtended | ErrorResponse>,
  ) => {
    try {
      const { id } = req.params;

      // Users can only view their own profile unless they're admin/owner
      if (
        req.user?.userId !== id &&
                req.user?.userRole !== 'admin' &&
                req.user?.userRole !== 'owner'
      ) {
        res.status(403).json({ message: 'Insufficient permissions' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          profile: true,
        },
      });

      if (!user) {
        res.status(404).json({ message: 'Profile not found' });
        return;
      }

      const profileExtended = mapUserToProfileExtended(user);

      res.status(200).json(profileExtended);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
);

/**
 * PUT /api/profiles/:id
 * Update a profile
 */
router.put(
  '/:id',
  async (
    req: Request<
            ProfileIdParams,
            ProfileExtended | ErrorResponse,
            Profile
        >,
    res: Response<ProfileExtended | ErrorResponse>,
  ) => {
    try {
      const { id } = req.params;
      const { fullName, gender, conversationRole, bio } = req.body;

      // Users can only update their own profile unless they're admin/owner
      if (
        req.user?.userId !== id &&
                req.user?.userRole !== 'admin' &&
                req.user?.userRole !== 'owner'
      ) {
        res.status(403).json({ message: 'Insufficient permissions' });
        return;
      }

      // Update (or create) profile row
      await prisma.profile.upsert({
        where: { id: id },
        update: {
          fullName,
          gender,
          conversationRole,
          bio,
        },
        create: {
          id: id,
          fullName: fullName ?? null,
          gender: gender ?? null,
          conversationRole: conversationRole ?? '',
          bio: bio ?? null,
        },
      });

      // Fetch complete user + profile data
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          profile: true,
        },
      });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const updatedProfile = mapUserToProfileExtended(user);

      res.status(200).json(updatedProfile);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
);

/**
 * PUT /api/profiles/:id/role
 * Update user role (admin/owner only)
 *
 * NOTE: in your Prisma schema, userRole lives on the Profile model,
 * so we update Profile, not User.
 */
router.put(
  '/:id/role',
  requireAdmin,
  async (
    req: Request<
            ProfileIdParams,
            ProfileExtended | ErrorResponse,
            UserRole
        >,
    res: Response<ProfileExtended | ErrorResponse>,
  ) => {
    try {
      const { id } = req.params;
      const userRole = req.body;

      if (!['basic', 'admin', 'owner'].includes(userRole)) {
        res.status(400).json({ message: 'Invalid user role' });
        return;
      }

      // Only owners can create other owners
      if (userRole === 'owner' && req.user?.userRole !== 'owner') {
        res.status(403).json({ message: 'Only owners can assign owner role' });
        return;
      }

      // make sure profile exists, then update role
      await prisma.profile.upsert({
        where: { id: id },
        update: { userRole },
        create: {
          id: id,
          userRole,
          conversationRole: '',
        },
      });

      const user = await prisma.user.findUnique({
        where: { id },
        include: { profile: true },
      });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const updatedProfile = mapUserToProfileExtended(user);

      res.status(200).json(updatedProfile);
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
);

/**
 * DELETE /api/profiles/:id
 * Delete a user (owner only)
 */
router.delete(
  '/:id',
  requireOwner,
  async (
    req: Request<ProfileIdParams>,
    res: Response<{ message: string } | ErrorResponse>,
  ) => {
    try {
      const { id } = req.params;

      await prisma.user.delete({
        where: { id },
      });

      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
);

export default router;
