import express from 'express';
import type { Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import prisma from '../../clients/prisma';
import { authenticate, requireAdmin } from '../../middleware/auth';
import {
  CreateScenarioRequest,
  ErrorResponse,
  MessageResponse,
  UpdateScenarioRequest,
} from '@repo/shared/types/dbRoutes.types';
import type { ScenarioWithPersonalityDto } from '@repo/shared/types/db/dto';
import { scenarioWithPersonalityToDto } from '@repo/shared/mappers/dtoMappers';

// Path parameter types
interface ScenarioIdParams extends ParamsDictionary {
  id: string;
}

const router = express.Router();

/**
 * GET /api/scenarios
 * Get all scenarios (public access)
 */
router.get(
  '/',
  async (
    req: Request,
    res: Response<ScenarioWithPersonalityDto[] | ErrorResponse>,
  ) => {
    try {
      const scenarios = await prisma.scenario.findMany({
        include: {
          personality: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json(scenarios.map(scenarioWithPersonalityToDto));
    } catch (error) {
      console.error('Get scenarios error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

/**
 * POST /api/scenarios
 * Create a new scenario (admin only)
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  async (
    req: Request<ParamsDictionary, ScenarioWithPersonalityDto | ErrorResponse, CreateScenarioRequest>,
    res: Response<ScenarioWithPersonalityDto | ErrorResponse>,
  ) => {
    try {
      const { involvedPersonalityId, situationDescriptionEn, settingEn, situationDescriptionCs, settingCs } = req.body;

      console.log('scenarion new', req.body);
      // Validate required fields
      if (!involvedPersonalityId) {
        res.status(400).json({ message: 'involvedPersonalityId is required' });
        return;
      }

      // Check if personality exists
      const personality = await prisma.personality.findUnique({
        where: { id: involvedPersonalityId },
      });

      console.log('found personality', personality);

      if (!personality) {
        res.status(404).json({ message: 'Personality not found' });
        return;
      }

      const scenario = await prisma.scenario.create({
        data: {
          involvedPersonalityId,
          situationDescriptionEn,
          settingEn,
          situationDescriptionCs,
          settingCs,
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

      console.log('created scenario', scenario);

      res.status(201).json(scenarioWithPersonalityToDto(scenario));
    } catch (error) {
      console.error('Create scenario error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

/**
 * PUT /api/scenarios/:id
 * Update a scenario (admin only)
 */
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  async (
    req: Request<ScenarioIdParams, ScenarioWithPersonalityDto | ErrorResponse, UpdateScenarioRequest>,
    res: Response<ScenarioWithPersonalityDto | ErrorResponse>,
  ) => {
    try {
      const { id } = req.params;
      const { involvedPersonalityId, situationDescriptionEn, settingEn, situationDescriptionCs, settingCs } = req.body;

      // If personality is being updated, check if it exists
      if (involvedPersonalityId) {
        const personality = await prisma.personality.findUnique({
          where: { id: involvedPersonalityId },
        });

        if (!personality) {
          res.status(404).json({ message: 'Personality not found' });
          return;
        }
      }

      const scenario = await prisma.scenario.update({
        where: { id: parseInt(id) },
        data: {
          involvedPersonalityId,
          situationDescriptionEn,
          settingEn,
          situationDescriptionCs,
          settingCs,
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

      res.status(200).json(scenarioWithPersonalityToDto(scenario));
    } catch (error) {
      console.error('Update scenario error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

/**
 * DELETE /api/scenarios/:id
 * Delete a scenario (admin only)
 */
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  async (
    req: Request<ScenarioIdParams>,
    res: Response<MessageResponse | ErrorResponse>,
  ) => {
    try {
      const { id } = req.params;

      await prisma.scenario.delete({
        where: { id: parseInt(id) },
      });

      res.status(200).json({ message: 'Scenario deleted successfully' });
    } catch (error) {
      console.error('Delete scenario error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

export default router;
