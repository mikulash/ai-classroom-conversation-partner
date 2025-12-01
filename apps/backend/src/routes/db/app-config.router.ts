import { Request, Response, Router } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { authenticate, requireOwner } from '../../middleware/auth';
import prisma from '../../clients/prisma';
import { ErrorResponse } from '@repo/shared/types/dbRoutes.types';
import { appConfigToDto } from '@repo/shared/mappers/dtoMappers';
import { AppConfigDto } from '@repo/shared/types/db/dto';
import { AppConfigCreate } from '@repo/shared/types/db/entities';
import { ConfigProvider } from '../../utils/configProvider';

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
      const configProvider = await ConfigProvider.getInstance();
      const config = configProvider.getAppConfig();

      res.status(200).json(appConfigToDto(config));
    } catch (error) {
      console.error('Get app config error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

/**
 * PUT /api/app-config
 * Update app configuration (owner only)
 * Creates a new versioned config and invalidates the old one
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
      } = req.body;

      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const now = new Date();
      const configProvider = await ConfigProvider.getInstance();
      const currentConfig = configProvider.getAppConfig();

      // Use a transaction to atomically invalidate the current config and create a new one
      const config = await prisma.$transaction(async (tx) => {
        // Get the currently active config

        await tx.appConfig.update({
          where: { id: currentConfig.id },
          data: { validTo: now },
        });

        const dataToCreate = {
          ...Object.fromEntries(
            Object.entries(currentConfig).filter(
              ([key]) => !['id', 'validFrom', 'validTo'].includes(key),
            ),
          ),
          userId: req.user!.userId,
          validFrom: now,
          validTo: null,
          responseModelId,
          ttsModelId,
          realtimeModelId,
          realtimeTranscriptionModelId,
          timestampedTranscriptionModelId,
        };

        return tx.appConfig.create({
          data: dataToCreate,
        });
      });

      // Refresh cache with the new config
      await configProvider.refreshAppConfig();

      res.status(200).json(appConfigToDto(config));
    } catch (error) {
      console.error('Update app config error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

export default router;
