import { Request, Response, Router } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import prisma from '../../clients/prisma';
import { authenticate, requireAdmin } from '../../middleware/auth.js';
import {
  RealtimeModel,
  RealtimeTranscriptionModel,
  ResponseModel,
  TimestampedTranscriptionModel,
  TtsModel,
} from '@repo/shared/types/db/entities';
import {
  AdminSelectionWithModels,
  ErrorResponse,
  MessageResponse,
  UpdateAdminSelectionRequest,
} from '@repo/shared/types/dbRoutes.types';

// Path parameter types
interface UserIdParams extends ParamsDictionary {
  userId: string;
}

const router = Router();

// ============================================
// Response Models
// ============================================

/**
 * GET /api/models/response
 * Get all response models
 */
router.get(
  '/response',
  async (
    req: Request,
    res: Response<ResponseModel[] | ErrorResponse>,
  ) => {
    try {
      const models = await prisma.responseModel.findMany({
        where: { isEnabled: true },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(models);
    } catch (error) {
      console.error('Get response models error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

// ============================================
// TTS Models
// ============================================

/**
 * GET /api/models/tts
 * Get all TTS models
 */
router.get(
  '/tts',
  async (
    req: Request,
    res: Response<TtsModel[] | ErrorResponse>,
  ) => {
    try {
      const models = await prisma.ttsModel.findMany({
        where: { isEnabled: true },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(models);
    } catch (error) {
      console.error('Get TTS models error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

// ============================================
// Realtime Models
// ============================================

/**
 * GET /api/models/realtime
 * Get all realtime models
 */
router.get(
  '/realtime',
  async (
    req: Request,
    res: Response<RealtimeModel[] | ErrorResponse>,
  ) => {
    try {
      const models = await prisma.realtimeModel.findMany({
        where: { isEnabled: true },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(models);
    } catch (error) {
      console.error('Get realtime models error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

// ============================================
// Realtime Transcription Models
// ============================================

/**
 * GET /api/models/realtime-transcription
 * Get all realtime transcription models
 */
router.get(
  '/realtime-transcription',
  async (
    req: Request,
    res: Response<RealtimeTranscriptionModel[] | ErrorResponse>,
  ) => {
    try {
      const models = await prisma.realtimeTranscriptionModel.findMany({
        where: { isEnabled: true },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(models);
    } catch (error) {
      console.error('Get realtime transcription models error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

// ============================================
// Timestamped Transcription Models
// ============================================

/**
 * GET /api/models/timestamped-transcription
 * Get all timestamped transcription models
 */
router.get(
  '/timestamped-transcription',
  async (
    req: Request,
    res: Response<TimestampedTranscriptionModel[] | ErrorResponse>,
  ) => {
    try {
      const models = await prisma.timestampedTranscriptionModel.findMany({
        where: { isEnabled: true },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(models);
    } catch (error) {
      console.error('Get timestamped transcription models error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

// ============================================
// Admin Custom Model Selection
// ============================================

/**
 * GET /api/models/admin-selection/:userId
 * Get admin custom model selection for a user (admin only)
 */
router.get(
  '/admin-selection/:userId',
  authenticate,
  requireAdmin,
  async (
    req: Request<UserIdParams>,
    res: Response<AdminSelectionWithModels | null | ErrorResponse>,
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

      res.status(200).json(selection);
    } catch (error) {
      console.error('Get admin model selection error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

/**
 * PUT /api/models/admin-selection/:userId
 * Update admin custom model selection for a user (admin only)
 */
router.put(
  '/admin-selection/:userId',
  authenticate,
  requireAdmin,
  async (
    req: Request<UserIdParams, AdminSelectionWithModels | ErrorResponse, UpdateAdminSelectionRequest>,
    res: Response<AdminSelectionWithModels | ErrorResponse>,
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

      const selection = await prisma.adminUserCustomModelSelection.upsert({
        where: { userId },
        create: {
          userId,
          responseModelId,
          ttsModelId,
          realtimeModelId,
          realtimeTranscriptionModelId,
          timestampedTranscriptionModelId,
        },
        update: {
          responseModelId,
          ttsModelId,
          realtimeModelId,
          realtimeTranscriptionModelId,
          timestampedTranscriptionModelId,
        },
        include: {
          responseModel: true,
          ttsModel: true,
          realtimeModel: true,
          realtimeTranscriptionModel: true,
          timestampedTranscriptionModel: true,
        },
      });

      res.status(200).json(selection);
    } catch (error) {
      console.error('Update admin model selection error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

/**
 * DELETE /api/models/admin-selection/:userId
 * Delete admin custom model selection for a user (admin only)
 */
router.delete(
  '/admin-selection/:userId',
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
