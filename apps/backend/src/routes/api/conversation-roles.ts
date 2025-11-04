import { Router } from 'express';
import prisma from '../../clients/prisma';

const router = Router();

/**
 * GET /api/conversation-roles
 * Get all conversation roles (public access)
 */
router.get('/', async (req, res) => {
  try {
    const roles = await prisma.conversationRole.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(roles);
  } catch (error) {
    console.error('Get conversation roles error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/conversation-roles/:id
 * Get a specific conversation role by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const role = await prisma.conversationRole.findUnique({
      where: { id: parseInt(id) },
    });

    if (!role) {
      res.status(404).json({ message: 'Conversation role not found' });
      return;
    }

    res.status(200).json(role);
  } catch (error) {
    console.error('Get conversation role error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
