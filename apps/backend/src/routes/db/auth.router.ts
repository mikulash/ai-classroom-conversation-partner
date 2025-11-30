import { Request, Response, Router } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import {
  comparePassword,
  generateRefreshToken,
  generateToken,
  hashPassword,
  revokeRefreshToken,
  storeRefreshToken,
  verifyRefreshToken,
  generatePasswordResetToken,
  storePasswordResetToken,
  verifyAndConsumePasswordResetToken,
} from '../../utils/auth';
import { authenticate } from '../../middleware/auth';
import prisma from '../../clients/prisma';
import {
  AuthTokensResponse,
  ErrorResponse,
  LoginRequest,
  LogoutRequest,
  MessageResponse,
  RefreshTokenRequest,
  RegisterResponse,
  RegisterUserRequest,
  RequestPasswordResetRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  UpdatePasswordRequest,
} from '@repo/shared/types/dbRoutes.types';
import { EmailVerificationResponseDto, LoginResponseDto, ProfileDto } from '@repo/shared/types/db/dto';
import { profileToDto } from '@repo/shared/mappers/dtoMappers';
import jwt from 'jsonwebtoken';
import { sendPasswordResetEmail, sendVerificationEmail } from '../../utils/email';
import { isValidUniversityEmail } from '@repo/shared/utils/isValidUniversityEmail';
import { APP_FRONTEND_URL, getJwtSecret } from '../../constants/constants';

const router = Router();

/**
 * Validate if email belongs to allowed domains
 */
function generateEmailVerificationToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    getJwtSecret(),
    { expiresIn: '10m' }, // 10 minutes to verify
  );
}

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  async (
    req: Request<ParamsDictionary, RegisterResponse | ErrorResponse, RegisterUserRequest>,
    res: Response<RegisterResponse | ErrorResponse>,
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
      const allowedDomains = appConfig?.allowedDomains ?? [];

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
        // Use generic message to prevent account enumeration
        res.status(200).json({
          message: 'Registration request received. If this email can be registered, you will receive a verification link.',
        });
        return;
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user and profile in a transaction
      const userProfile = await prisma.$transaction(async (tx) => {
        // Create user with credentials
        const user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            // confirmedAt stays null until email verification
          },
        });

        // Create profile with editable information
        await tx.profile.create({
          data: {
            id: user.id,
            fullName: fullName,
            gender: gender,
            conversationRole: '',
            bio: '',
            userRole: 'basic',
          },
        });

        return {
          id: user.id,
          email: user.email,
        };
      });

      // NEW: generate email verification token
      const emailVerifyToken = generateEmailVerificationToken(userProfile.id, userProfile.email);

      // Construct verification URL that points to the frontend confirmation page
      const frontendBaseUrl = APP_FRONTEND_URL.replace(/\/$/, '');
      const verifyUrl = `${frontendBaseUrl}/email-validated?token=${encodeURIComponent(emailVerifyToken)}`;

      // Send the email

      await sendVerificationEmail(userProfile.email, verifyUrl);

      res.status(200).json({
        message: 'Registration request received. If this email can be registered, you will receive a verification link.',
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

router.get(
  '/verify-email',
  async (
    req: Request,
    res: Response<EmailVerificationResponseDto | ErrorResponse>,
  ) => {
    try {
      const token = req.query.token as string | undefined;
      if (!token) {
        res.status(400).json({ message: 'Verification token is required' });
        return;
      }

      let payload: { userId: string; email: string };
      try {
        payload = jwt.verify(token, getJwtSecret()) as { userId: string; email: string };
      } catch {
        res.status(400).json({ message: 'Invalid or expired verification token' });
        return;
      }

      // Retrieve the user with their profile information
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: { profile: true },
      });

      if (!user || !user.profile) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Mark user as confirmed (idempotent)
      const verifiedUser = await prisma.user.update({
        where: { id: payload.userId },
        data: {
          confirmedAt: user.confirmedAt ?? new Date(),
        },
        include: { profile: true },
      });

      if (!verifiedUser.profile) {
        res.status(500).json({ message: 'Failed to confirm user' });
        return;
      }

      // Generate tokens for automatic sign-in
      const accessToken = generateToken({
        userId: verifiedUser.id,
        email: verifiedUser.email,
        userRole: verifiedUser.profile.userRole,
      });

      const refreshToken = generateRefreshToken();
      await storeRefreshToken(verifiedUser.id, refreshToken);

      const userProfile = profileToDto({
        ...verifiedUser.profile,
        email: verifiedUser.email,
        confirmedAt: verifiedUser.confirmedAt,
      });

      res.status(200).json({
        user: userProfile,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
);

router.post(
  '/resend-verification',
  async (
    req: Request<ParamsDictionary, MessageResponse | ErrorResponse, ResendVerificationRequest>,
    res: Response<MessageResponse | ErrorResponse>,
  ) => {
    try {
      const email = req.body.email.trim();

      if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
      }

      const genericMessage =
        'If an account exists for that email, a new verification link has been sent.';

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || user.confirmedAt) {
        res.status(200).json({ message: genericMessage });
        return;
      }

      const emailVerifyToken = generateEmailVerificationToken(user.id, user.email);

      const verifyUrl = `${APP_FRONTEND_URL.replace(/\/$/, '')}/email-validated?token=${encodeURIComponent(emailVerifyToken)}`;

      await sendVerificationEmail(user.email, verifyUrl);

      res.status(200).json({ message: genericMessage });
    } catch (error) {
      console.error('Resend verification email error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
);


/**
 * POST /api/auth/login
 * Login user and return JWT token
 */
router.post(
  '/login',
  async (
    req: Request<ParamsDictionary, LoginResponseDto| ErrorResponse, LoginRequest>,
    res: Response<LoginResponseDto | ErrorResponse>,
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
        console.log('User not confirmed:');
        res.status(403).json({ message: 'Please confirm your email before logging in.' });
        return;
      }

      const refreshToken = generateRefreshToken();
      await storeRefreshToken(user.id, refreshToken);

      // Return combined user + profile data (without password)
      const userProfile = profileToDto({
        ...user.profile,
        email: user.email,
        confirmedAt: user.confirmedAt,
      });

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
    res: Response<ProfileDto | ErrorResponse>,
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
      const userData = profileToDto({
        ...user.profile,
        email: user.email,
        confirmedAt: user.confirmedAt,
      });

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

      if (!user?.profile) {
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

/**
 * POST /api/auth/request-password-reset
 * Request a password reset email
 */
router.post(
  '/request-password-reset',
  async (
    req: Request<ParamsDictionary, MessageResponse | ErrorResponse, RequestPasswordResetRequest>,
    res: Response<MessageResponse | ErrorResponse>,
  ) => {
    try {
      const email = req.body.email.trim();

      if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
      }

      // Use generic message for security (don't reveal if email exists)
      const genericMessage =
        'If an account exists for that email, a password reset link has been sent.';

      const user = await prisma.user.findUnique({
        where: { email },
      });

      // Send generic response even if user doesn't exist (security)
      if (!user) {
        res.status(200).json({ message: genericMessage });
        return;
      }

      // Generate and store password reset token (expires in 1 hour)
      const resetToken = generatePasswordResetToken();
      await storePasswordResetToken(user.id, resetToken);

      // Construct reset URL that points to the frontend reset page
      const frontendBaseUrl = APP_FRONTEND_URL.replace(/\/$/, '');
      const resetUrl = `${frontendBaseUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

      // Send the email
      await sendPasswordResetEmail(user.email, resetUrl);

      res.status(200).json({ message: genericMessage });
    } catch (error) {
      console.error('Request password reset error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
);

/**
 * POST /api/auth/reset-password
 * Reset password using a reset token
 */
router.post(
  '/reset-password',
  async (
    req: Request<ParamsDictionary, MessageResponse | ErrorResponse, ResetPasswordRequest>,
    res: Response<MessageResponse | ErrorResponse>,
  ) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        res.status(400).json({ message: 'Token and new password are required' });
        return;
      }

      // Verify and consume the reset token (one-time use)
      const userId = await verifyAndConsumePasswordResetToken(token);

      if (!userId) {
        res.status(400).json({ message: 'Invalid or expired reset token' });
        return;
      }

      // Get the user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
);

export default router;
