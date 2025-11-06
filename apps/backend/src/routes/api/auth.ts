import { Router, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  storeRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
} from '../../utils/auth.js';
import { authenticate } from '../../middleware/auth.js';
import prisma from '../../clients/prisma';
import { ProfileExtended } from '@repo/shared/types/db/entities';
import {
  AuthResponse,
  AuthTokensResponse,
  ErrorResponse,
  LoginRequest,
  LogoutRequest,
  MessageResponse,
  ProfileResponse,
  RefreshTokenRequest,
  RegisterRequest,
  UpdatePasswordRequest,
} from '@repo/shared/types/api';

const router = Router();

/**
 * Validate if email belongs to allowed domains
 */
function isValidUniversityEmail(email: string, allowedDomains: string[]): boolean {
  return allowedDomains.some((domain) => email.endsWith(domain));
}

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  async (
    req: Request<ParamsDictionary, AuthResponse | ErrorResponse, RegisterRequest>,
    res: Response<AuthResponse | ErrorResponse>,
  ) => {
    try {
      const { email, password, fullName, gender } = req.body;

      // Validate required fields
      if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
      }

      // Get allowed domains from app config
      const appConfig = await prisma.appConfig.findFirst();
      const allowedDomains = appConfig?.allowedDomains || [];

      // Validate university email
      if (allowedDomains.length > 0 && !isValidUniversityEmail(email, allowedDomains)) {
        res.status(400).json({
          message: `Email must end with one of the following domains: ${allowedDomains.join(', ')}`,
        });
        return;
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        res.status(400).json({ message: 'User with this email already exists' });
        return;
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user and profile in a transaction
      const userProfile = await prisma.$transaction(async (tx): Promise<ProfileResponse> => {
        // Create user with credentials
        const user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
          },
        });

        // Create profile with editable information
        const profile = await tx.profile.create({
          data: {
            id: user.id,
            fullName: fullName ?? null,
            gender: gender ?? null,
            conversationRole: '',
            bio: null,
            userRole: 'basic',
          },
        });

        const response: ProfileResponse = {
          id: user.id,
          email: user.email,
          fullName: profile.fullName,
          gender: profile.gender,
          conversationRole: profile.conversationRole,
          bio: profile.bio,
          userRole: profile.userRole,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
          confirmedAt: user.confirmedAt ?? null,
        };

        return response;
      });

      // Generate JWT access token and refresh token
      const accessToken = generateToken({
        userId: userProfile.id,
        email: userProfile.email || '',
        userRole: userProfile.userRole,
      });

      const refreshToken = generateRefreshToken();
      await storeRefreshToken(userProfile.id, refreshToken);

      res.status(201).json({
        user: userProfile,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

/**
 * POST /api/auth/login
 * Login user and return JWT token
 */
router.post(
  '/login',
  async (
    req: Request<ParamsDictionary, AuthResponse | ErrorResponse, LoginRequest>,
    res: Response<AuthResponse | ErrorResponse>,
  ) => {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
      }

      // Find user with their profile
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          profile: true,
        },
      });

      if (!user || !user.profile) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.password);

      if (!isValidPassword) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      // Generate JWT access token and refresh token
      const accessToken = generateToken({
        userId: user.id,
        email: user.email,
        userRole: user.profile.userRole,
      });

      if (!user.confirmedAt) {
        res.status(403).json({ message: 'Please confirm your email before logging in.' });
        return;
      }

      const refreshToken = generateRefreshToken();
      await storeRefreshToken(user.id, refreshToken);

      // Return combined user + profile data (without password)
      const userProfile: ProfileResponse = {
        id: user.id,
        email: user.email,
        fullName: user.profile.fullName,
        gender: user.profile.gender,
        conversationRole: user.profile.conversationRole,
        bio: user.profile.bio,
        userRole: user.profile.userRole,
        createdAt: user.profile.createdAt,
        updatedAt: user.profile.updatedAt,
        confirmedAt: user.confirmedAt,
      };

      res.status(200).json({
        user: userProfile,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

/**
 * GET /api/auth/me
 * Get current user profile (requires authentication)
 */
router.get(
  '/me',
  authenticate,
  async (
    req: Request,
    res: Response<ProfileResponse | ErrorResponse>,
  ) => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: {
          profile: true,
        },
      });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      if (!user.profile) {
        res.status(404).json({ message: 'User profile not found' });
        return;
      }

      // Return combined user + profile data
      const userData: ProfileResponse = {
        id: user.id,
        email: user.email,
        fullName: user.profile.fullName,
        gender: user.profile.gender,
        conversationRole: user.profile.conversationRole,
        bio: user.profile.bio,
        userRole: user.profile.userRole,
        createdAt: user.profile.createdAt,
        updatedAt: user.profile.updatedAt,
        confirmedAt: user.confirmedAt,
      };

      res.status(200).json(userData);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post(
  '/refresh',
  async (
    req: Request<ParamsDictionary, AuthTokensResponse | ErrorResponse, RefreshTokenRequest>,
    res: Response<AuthTokensResponse | ErrorResponse>,
  ) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ message: 'Refresh token is required' });
        return;
      }

      // Verify the refresh token
      const userId = await verifyRefreshToken(refreshToken);

      if (!userId) {
        res.status(401).json({ message: 'Invalid or expired refresh token' });
        return;
      }

      // Get user data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          profile: true,
        },
      });

      if (!user || !user.profile) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Generate new access token
      const accessToken = generateToken({
        userId: user.id,
        email: user.email,
        userRole: user.profile.userRole,
      });

      // Optionally rotate refresh token (revoke old one and issue new one)
      // This is more secure but requires client to update both tokens
      const newRefreshToken = generateRefreshToken();
      await revokeRefreshToken(refreshToken);
      await storeRefreshToken(user.id, newRefreshToken);

      res.status(200).json({
        accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

/**
 * POST /api/auth/logout
 * Logout user and revoke refresh token
 */
router.post(
  '/logout',
  async (
    req: Request<ParamsDictionary, MessageResponse | ErrorResponse, LogoutRequest>,
    res: Response<MessageResponse | ErrorResponse>,
  ) => {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        await revokeRefreshToken(refreshToken);
      }

      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

/**
 * POST /api/auth/logout-all
 * Logout user from all devices (revoke all refresh tokens)
 */
router.post(
  '/logout-all',
  authenticate,
  async (
    req: Request,
    res: Response<MessageResponse | ErrorResponse>,
  ) => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      await revokeAllUserRefreshTokens(req.user.userId);

      res.status(200).json({ message: 'Logged out from all devices successfully' });
    } catch (error) {
      console.error('Logout all error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

/**
 * PUT /api/auth/password
 * Update user password
 */
router.put(
  '/password',
  authenticate,
  async (
    req: Request<ParamsDictionary, MessageResponse | ErrorResponse, UpdatePasswordRequest>,
    res: Response<MessageResponse | ErrorResponse>,
  ) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      if (!currentPassword || !newPassword) {
        res.status(400).json({ message: 'Current password and new password are required' });
        return;
      }

      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
      });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Verify current password
      const isValidPassword = await comparePassword(currentPassword, user.password);

      if (!isValidPassword) {
        res.status(401).json({ message: 'Current password is incorrect' });
        return;
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: req.user.userId },
        data: { password: hashedPassword },
      });

      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Password update error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

export default router;
