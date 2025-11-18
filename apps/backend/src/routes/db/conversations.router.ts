import { Request, Response, Router } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import prisma from '../../clients/prisma';
import { authenticate, requireAdmin } from '../../middleware/auth.js';
import {
  ConversationWithPersonality,
  CreateConversationRequest,
  ErrorResponse,
  MessageResponse,
} from '@repo/shared/types/dbRoutes.types';

// Path parameter types
interface ConversationIdParams extends ParamsDictionary {
  id: string;
}

interface UserIdParams extends ParamsDictionary {
  userId: string;
}

const router = Router();

// All conversation routes require authentication
router.use(authenticate);

/**
 * GET /api/conversations
 * Get conversations for current user
 */
router.get(
  '/',
  async (
    req: Request,
    res: Response<ConversationWithPersonality[] | ErrorResponse>,
  ) => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const conversations = await prisma.conversation.findMany({
        where: { userId: req.user.userId },
        include: {
          personality: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          scenario: {
            select: {
              id: true,
              situationDescriptionEn: true,
              situationDescriptionCs: true,
            },
          },
        },
        orderBy: { startTime: 'desc' },
      });

      res.status(200).json(conversations as ConversationWithPersonality[]);
    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

/**
 * POST /api/conversations
 * Create a new conversation
 */
router.post(
  '/',
  async (
    req: Request<ParamsDictionary, ConversationWithPersonality | ErrorResponse, CreateConversationRequest>,
    res: Response<ConversationWithPersonality | ErrorResponse>,
  ) => {
    try {
      const { personalityId, scenarioId, startTime, endTime, endedReason, messages, logs, conversationType, usedConfig } =
      req.body;

      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      // Validate required fields
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!startTime || !conversationType) {
        res.status(400).json({ message: 'personalityId, startTime, and conversationType are required' });
        return;
      }

      const conversation = await prisma.conversation.create({
        data: {
          userId: req.user.userId,
          personalityId,
          scenarioId: scenarioId ?? null,
          startTime: new Date(startTime),
          endTime: endTime ? new Date(endTime) : undefined,
          endedReason,
          messages: messages ?? [],
          logs: logs ?? [],
          conversationType,
          usedConfig: usedConfig,
        },
        include: {
          personality: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          scenario: {
            select: {
              id: true,
              situationDescriptionEn: true,
              situationDescriptionCs: true,
            },
          },
        },
      });

      // Transform the response to match ConversationWithPersonality type
      const response: ConversationWithPersonality = conversation as ConversationWithPersonality;

      res.status(201).json(response);
    } catch (error) {
      console.error('Create conversation error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

/**
 * DELETE /api/conversations/:id
 * Delete a conversation
 */
router.delete(
  '/:id',
  async (
    req: Request<ConversationIdParams>,
    res: Response<MessageResponse | ErrorResponse>,
  ) => {
    try {
      const { id } = req.params;

      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const conversation = await prisma.conversation.findUnique({
        where: { id: parseInt(id) },
      });

      if (!conversation) {
        res.status(404).json({ message: 'Conversation not found' });
        return;
      }

      // Users can only delete their own conversations unless they're admin/owner
      if (
        conversation.userId !== req.user.userId &&
      req.user.userRole !== 'admin' &&
      req.user.userRole !== 'owner'
      ) {
        res.status(403).json({ message: 'Insufficient permissions' });
        return;
      }

      await prisma.conversation.delete({
        where: { id: parseInt(id) },
      });

      res.status(200).json({ message: 'Conversation deleted successfully' });
    } catch (error) {
      console.error('Delete conversation error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

/**
 * GET /api/conversations/user/:userId
 * Get conversations for a specific user (admin only)
 */
router.get(
  '/user/:userId',
  requireAdmin,
  async (
    req: Request<UserIdParams>,
    res: Response<ConversationWithPersonality[] | ErrorResponse>,
  ) => {
    try {
      const { userId } = req.params;

      const conversations = await prisma.conversation.findMany({
        where: { userId },
        include: {
          personality: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          scenario: {
            select: {
              id: true,
              situationDescriptionEn: true,
              situationDescriptionCs: true,
            },
          },
        },
        orderBy: { startTime: 'desc' },
      });

      res.status(200).json(conversations as ConversationWithPersonality[]);
    } catch (error) {
      console.error('Get user conversations error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

export default router;
