import { Request, Response, Router } from 'express';
import prisma from '../../clients/prisma';
import { ErrorResponse } from '@repo/shared/types/dbRoutes.types';
import { ConversationRole } from '@repo/shared/types/db/entities';
import type { ConversationRoleDto } from '@repo/shared/types/db/dto';
import { conversationRoleToDto } from '@repo/shared/mappers/dtoMappers';

const router = Router();

/**
 * GET /api/conversation-roles
 * Get all conversation roles (public access)
 */
router.get(
  '/',
  async (
    req: Request,
    res: Response<ConversationRoleDto[] | ErrorResponse>,
  ) => {
    try {
      const roles = await prisma.conversationRole.findMany({
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json(roles.map(conversationRoleToDto));
    } catch (error) {
      console.error('Get conversation roles error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

export default router;
