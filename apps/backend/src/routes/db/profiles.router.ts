import { Request, Response, Router } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import prisma from '../../clients/prisma';
import { authenticate, requireOwner } from '../../middleware/auth';
import {
  ErrorResponse,
  ProfileResponse,
  UpdateProfileRequest,
  UpdateUserRoleRequest,
} from '@repo/shared/types/dbRoutes.types';
import type { ProfileDto } from '@repo/shared/types/db/dto';
import { profileToDto } from '@repo/shared/mappers/dtoMappers';

// Path parameter types
interface ProfileIdParams extends ParamsDictionary {
    id: string;
}

const router = Router();

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
    res: Response<ProfileDto[] | ErrorResponse>,
  ) => {
    try {
      const users = await prisma.user.findMany({
        include: {
          profile: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const profiles = users
        .filter(user => user.profile !== null)
        .map(user => profileToDto({
          ...user.profile!,
          email: user.email,
          confirmedAt: user.confirmedAt,
        }));

      res.status(200).json(profiles);
    } catch (error) {
      console.error('Get profiles error:', error);
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
            ProfileDto | ErrorResponse,
            UpdateProfileRequest
        >,
    res: Response<ProfileDto | ErrorResponse>,
  ) => {
    try {
      const { id } = req.params;
      const { fullName, gender, conversationRole, bio } = req.body;

      // Users can only update their own profile unless they're admin/owner
      if (
        req.user?.userId !== id && req.user?.userRole !== 'admin' && req.user?.userRole !== 'owner'
      ) {
        res.status(403).json({ message: 'Insufficient permissions' });
        return;
      }

      // Update (or create) profile row
      await prisma.profile.upsert({
        where: { id: id },
        update: {
          fullName: fullName ?? '',
          gender: gender ?? '',
          conversationRole,
          bio: bio ?? '',
        },
        create: {
          id: id,
          fullName: fullName ?? '',
          gender: gender ?? '',
          conversationRole: conversationRole ?? '',
          bio: bio ?? '',
        },
      });

      // Fetch complete user + profile data
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          profile: true,
        },
      });

      if (!user || !user.profile) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const updatedProfile = profileToDto({
        ...user.profile,
        email: user.email,
        confirmedAt: user.confirmedAt,
      });

      res.status(200).json(updatedProfile);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
);

/**
 * PUT /api/profiles/:id/role
 * Update a user role (admin/owner only)
 *
 * NOTE: in your Prisma schema, userRole lives on the Profile model,
 * so we update Profile, not User.
 */
router.put(
  '/:id/role',
  requireOwner,
  async (
    req: Request<
            ProfileIdParams,
            ProfileResponse | ErrorResponse,
            UpdateUserRoleRequest
        >,
    res: Response<ProfileDto | ErrorResponse>,
  ) => {
    try {
      const { id } = req.params;
      const { userRole } = req.body;

      if (!['basic', 'admin', 'owner'].includes(userRole)) {
        res.status(400).json({ message: 'Invalid user role' });
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

      if (!user || !user.profile) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const updatedProfile = profileToDto({
        ...user.profile,
        email: user.email,
        confirmedAt: user.confirmedAt,
      });

      res.status(200).json(updatedProfile);
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
);

export default router;
