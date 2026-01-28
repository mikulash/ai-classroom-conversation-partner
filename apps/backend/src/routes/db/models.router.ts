import express from 'express';
import type { Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import prisma from '../../clients/prisma';
import { authenticate, requireAdmin } from '../../middleware/auth';

import {
  ErrorResponse,
  MessageResponse,
  UpdateCustomModelSelectionRequest,
} from '@repo/shared/types/dbRoutes.types';
import type {
  ResponseModelDto,
  TtsModelDto,
  RealtimeModelDto,
  RealtimeTranscriptionModelDto,
  TimestampedTranscriptionModelDto,
  CustomSelectionWithModelsDto,
} from '@repo/shared/types/db/dto';
import {
  responseModelToDto,
  ttsModelToDto,
  realtimeModelToDto,
  realtimeTranscriptionModelToDto,
  timestampedTranscriptionModelToDto,
  customSelectionWithModelsToDto,
} from '@repo/shared/mappers/dtoMappers';

// Path parameter types
interface UserIdParams extends ParamsDictionary {
  userId: string;
}

const router = express.Router();

/**
 * GET /api/models/response
 * Get all response models
 */
router.get(
  '/response',
  async (
    req: Request,
    res: Response<ResponseModelDto[] | ErrorResponse>,
  ) => {
    try {
      const models = await prisma.responseModel.findMany({
        where: { isEnabled: true },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(models.map(responseModelToDto));
    } catch (error) {
      console.error('Get response models error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

/**
 * GET /api/models/tts
 * Get all TTS models
 */
router.get(
  '/tts',
  async (
    req: Request,
    res: Response<TtsModelDto[] | ErrorResponse>,
  ) => {
    try {
      const models = await prisma.ttsModel.findMany({
        where: { isEnabled: true },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(models.map(ttsModelToDto));
    } catch (error) {
      console.error('Get TTS models error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

/**
 * GET /api/models/realtime
 * Get all realtime models
 */
router.get(
  '/realtime',
  async (
    req: Request,
    res: Response<RealtimeModelDto[] | ErrorResponse>,
  ) => {
    try {
      const models = await prisma.realtimeModel.findMany({
        where: { isEnabled: true },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(models.map(realtimeModelToDto));
    } catch (error) {
      console.error('Get realtime models error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

/**
 * GET /api/models/realtime-transcription
 * Get all realtime transcription models
 */
router.get(
  '/realtime-transcription',
  async (
    req: Request,
    res: Response<RealtimeTranscriptionModelDto[] | ErrorResponse>,
  ) => {
    try {
      const models = await prisma.realtimeTranscriptionModel.findMany({
        where: { isEnabled: true },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(models.map(realtimeTranscriptionModelToDto));
    } catch (error) {
      console.error('Get realtime transcription models error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


/**
 * GET /api/models/timestamped-transcription
 * Get all timestamped transcription models
 */
router.get(
  '/timestamped-transcription',
  async (
    req: Request,
    res: Response<TimestampedTranscriptionModelDto[] | ErrorResponse>,
  ) => {
    try {
      const models = await prisma.timestampedTranscriptionModel.findMany({
        where: { isEnabled: true },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(models.map(timestampedTranscriptionModelToDto));
    } catch (error) {
      console.error('Get timestamped transcription models error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


/**
 * GET /api/models/custom-selection/:userId
 * Get admin custom model selection for a user (admin only)
 */
router.get(
  '/custom-selection/:userId',
  authenticate,
  requireAdmin,
  async (
    req: Request<UserIdParams>,
    res: Response<CustomSelectionWithModelsDto | null | ErrorResponse>,
  ) => {
    try {
      const { userId } = req.params;

      const selection = await prisma.adminUserCustomModelSelection.findUnique({
        where: { userId },
        include: {
          responseModel: true,
          ttsModel: true,
          realtimeModel: true,
          realtimeTranscriptionModel: true,
          timestampedTranscriptionModel: true,
        },
      });

      res.status(200).json(selection ? customSelectionWithModelsToDto(selection) : null);
    } catch (error) {
      console.error('Get admin model selection error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

/**
 * PUT /api/models/custom-selection/:userId
 * Update admin custom model selection for a user (admin only)
 */
router.put(
  '/custom-selection/:userId',
  authenticate,
  requireAdmin,
  async (
    req: Request<UserIdParams, CustomSelectionWithModelsDto | ErrorResponse, UpdateCustomModelSelectionRequest>,
    res: Response<CustomSelectionWithModelsDto | ErrorResponse>,
  ) => {
    try {
      const { userId } = req.params;
      const {
        responseModelId,
        ttsModelId,
        realtimeModelId,
        realtimeTranscriptionModelId,
        timestampedTranscriptionModelId,
      } = req.body;

      // Check if user exists
      const user = await prisma.profile.findUnique({
        where: { id: userId },
      });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Build data object with only the fields that are explicitly provided
      const updateData: Partial<{
        responseModelId: number | null;
        ttsModelId: number | null;
        realtimeModelId: number | null;
        realtimeTranscriptionModelId: number | null;
        timestampedTranscriptionModelId: number | null;
      }> = {};

      if (responseModelId !== undefined) updateData.responseModelId = responseModelId;
      if (ttsModelId !== undefined) updateData.ttsModelId = ttsModelId;
      if (realtimeModelId !== undefined) updateData.realtimeModelId = realtimeModelId;
      if (realtimeTranscriptionModelId !== undefined) updateData.realtimeTranscriptionModelId = realtimeTranscriptionModelId;
      if (timestampedTranscriptionModelId !== undefined) updateData.timestampedTranscriptionModelId = timestampedTranscriptionModelId;

      const selection = await prisma.adminUserCustomModelSelection.upsert({
        where: { userId },
        create: {
          userId,
          ...updateData,
        },
        update: updateData,
        include: {
          responseModel: true,
          ttsModel: true,
          realtimeModel: true,
          realtimeTranscriptionModel: true,
          timestampedTranscriptionModel: true,
        },
      });

      res.status(200).json(customSelectionWithModelsToDto(selection));
    } catch (error) {
      console.error('Update admin model selection error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

/**
 * DELETE /api/models/custom-selection/:userId
 * Delete admin custom model selection for a user (admin only)
 */
router.delete(
  '/custom-selection/:userId',
  authenticate,
  requireAdmin,
  async (
    req: Request<UserIdParams>,
    res: Response<MessageResponse | ErrorResponse>,
  ) => {
    try {
      const { userId } = req.params;

      await prisma.adminUserCustomModelSelection.delete({
        where: { userId },
      });

      res.status(200).json({ message: 'Admin model selection deleted successfully' });
    } catch (error) {
      console.error('Delete admin model selection error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

export default router;
