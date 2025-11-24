import { Request, Response, Router } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { authenticate, requireOwner } from '../../middleware/auth';
import prisma from '../../clients/prisma';
import { ErrorResponse } from '@repo/shared/types/dbRoutes.types';
import {appConfigToDto} from '@repo/shared/mappers/dtoMappers';
import {AppConfigDto} from '@repo/shared/types/db/dto';
import { AppConfigCreate } from '@repo/shared/types/db/entities';

const router = Router();

/**
 * GET /api/app-config
 * Get app configuration (public access)
 */
router.get(
  '/',
  async (
    _req: Request<ParamsDictionary, AppConfigDto | ErrorResponse>,
    res: Response<AppConfigDto | ErrorResponse>,
  ) => {
    try {
      const config = await prisma.appConfig.findFirst();

      if (!config) {
        res.status(404).json({ message: 'App configuration not found' });
        return;
      }

      res.status(200).json(appConfigToDto(config));
    } catch (error) {
      console.error('Get app config error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

/**
 * PUT /api/app-config
 * Update app configuration (owner only)
 */
router.put(
  '/',
  authenticate,
  requireOwner,
  async (
    req: Request<ParamsDictionary, AppConfigDto | ErrorResponse, AppConfigCreate>,
    res: Response<AppConfigDto | ErrorResponse>,
  ) => {
    try {
      const {
        responseModelId,
        ttsModelId,
        realtimeModelId,
        realtimeTranscriptionModelId,
        timestampedTranscriptionModelId,
        silenceTimeoutInSeconds,
        maxConversationDurationInSeconds,
        appName,
        allowedDomains,
      } = req.body;

      // Get the first config or create if doesn't exist
      const existingConfig = await prisma.appConfig.findFirst();

      const config = await prisma.appConfig.upsert({
        where: { id: existingConfig?.id ?? 1 },
        create: {
          responseModelId,
          ttsModelId,
          realtimeModelId,
          realtimeTranscriptionModelId,
          timestampedTranscriptionModelId,
          silenceTimeoutInSeconds: silenceTimeoutInSeconds ?? 30,
          maxConversationDurationInSeconds: maxConversationDurationInSeconds ?? 300,
          appName: appName ?? 'AI FIGURANT',
          allowedDomains: allowedDomains ?? [],
          editedAt: new Date(),
        },
        update: {
          responseModelId,
          ttsModelId,
          realtimeModelId,
          realtimeTranscriptionModelId,
          timestampedTranscriptionModelId,
          silenceTimeoutInSeconds,
          maxConversationDurationInSeconds,
          appName,
          allowedDomains,
          editedAt: new Date(),
        },
      });

      res.status(200).json(appConfigToDto(config));
    } catch (error) {
      console.error('Update app config error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

export default router;
