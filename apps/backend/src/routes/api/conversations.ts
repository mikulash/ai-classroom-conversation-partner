import { Router } from 'express';
import prisma from "@repo/shared/prisma/client";
import { authenticate, requireAdmin } from '../../middleware/auth.js';

const router = Router();

// All conversation routes require authentication
router.use(authenticate);

/**
 * GET /api/conversations
 * Get conversations for current user
 */
router.get('/', async (req, res) => {
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
            situationDescriptionCz: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });

    res.status(200).json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/conversations/:id
 * Get a specific conversation by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: parseInt(id) },
      include: {
        personality: true,
        scenario: true,
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    if (!conversation) {
      res.status(404).json({ message: 'Conversation not found' });
      return;
    }

    // Users can only view their own conversations unless they're admin/owner
    if (
      conversation.userId !== req.user.userId &&
      req.user.userRole !== 'admin' &&
      req.user.userRole !== 'owner'
    ) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * POST /api/conversations
 * Create a new conversation
 */
router.post('/', async (req, res) => {
  try {
    const { personalityId, scenarioId, startTime, endTime, endedReason, messages, logs, conversationType, usedConfig } =
      req.body;

    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    // Validate required fields
    if (!personalityId || !startTime || !conversationType) {
      res.status(400).json({ message: 'personalityId, startTime, and conversationType are required' });
      return;
    }

    const conversation = await prisma.conversation.create({
      data: {
        userId: req.user.userId,
        personalityId,
        scenarioId: scenarioId || null,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        endedReason,
        messages,
        logs,
        conversationType,
        usedConfig,
      },
      include: {
        personality: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * DELETE /api/conversations/:id
 * Delete a conversation
 */
router.delete('/:id', async (req, res) => {
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
router.get('/user/:userId', requireAdmin, async (req, res) => {
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
            situationDescriptionCz: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });

    res.status(200).json(conversations);
  } catch (error) {
    console.error('Get user conversations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
