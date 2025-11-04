import { Router } from 'express';
import prisma from '../../clients/prisma';
import { authenticate, requireAdmin } from '../../middleware/auth.js';

const router = Router();

/**
 * GET /api/personalities
 * Get all personalities (public access, but filter hidden ones for non-admins)
 */
router.get('/', async (req, res) => {
  try {
    // Check if user is authenticated and is admin
    const isAdmin = req.header('authorization') ? false : false; // Will be set by middleware if needed

    const personalities = await prisma.personality.findMany({
      where: isAdmin ? {} : { isHidden: false },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(personalities);
  } catch (error) {
    console.error('Get personalities error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/personalities/:id
 * Get a specific personality by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const personality = await prisma.personality.findUnique({
      where: { id: parseInt(id) },
      include: {
        scenarios: true,
      },
    });

    if (!personality) {
      res.status(404).json({ message: 'Personality not found' });
      return;
    }

    res.status(200).json(personality);
  } catch (error) {
    console.error('Get personality error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * POST /api/personalities
 * Create a new personality (admin only)
 */
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      age,
      avatarUrl,
      gender,
      sex,
      voiceInstructions,
      elevenlabsVoiceId,
      openaiVoiceName,
      problemSummaryEn,
      personalityDescriptionEn,
      problemSummaryCs,
      personalityDescriptionCs,
      settingEn,
      settingCs,
      isHidden,
    } = req.body;

    // Validate required fields
    if (!name) {
      res.status(400).json({ message: 'Name is required' });
      return;
    }

    const personality = await prisma.personality.create({
      data: {
        name,
        age,
        avatarUrl,
        gender,
        sex,
        voiceInstructions,
        elevenlabsVoiceId,
        openaiVoiceName,
        problemSummaryEn,
        personalityDescriptionEn,
        problemSummaryCs,
        personalityDescriptionCs,
        settingEn,
        settingCs,
        isHidden: isHidden || false,
      },
    });

    res.status(201).json(personality);
  } catch (error) {
    console.error('Create personality error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * PUT /api/personalities/:id
 * Update a personality (admin only)
 */
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      age,
      avatarUrl,
      gender,
      sex,
      voiceInstructions,
      elevenlabsVoiceId,
      openaiVoiceName,
      problemSummaryEn,
      personalityDescriptionEn,
      problemSummaryCs,
      personalityDescriptionCs,
      settingEn,
      settingCs,
      isHidden,
    } = req.body;

    const personality = await prisma.personality.update({
      where: { id: parseInt(id) },
      data: {
        name,
        age,
        avatarUrl,
        gender,
        sex,
        voiceInstructions,
        elevenlabsVoiceId,
        openaiVoiceName,
        problemSummaryEn,
        personalityDescriptionEn,
        problemSummaryCs,
        personalityDescriptionCs,
        settingEn,
        settingCs,
        isHidden,
      },
    });

    res.status(200).json(personality);
  } catch (error) {
    console.error('Update personality error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * DELETE /api/personalities/:id
 * Delete a personality (admin only)
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.personality.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Personality deleted successfully' });
  } catch (error) {
    console.error('Delete personality error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
