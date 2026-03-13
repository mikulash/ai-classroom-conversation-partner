import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  comparePassword,
  generatePasswordResetToken,
  generateRefreshToken,
  generateToken,
  hashPassword,
  revokeRefreshToken,
  storeRefreshToken,
  verifyPasswordResetToken,
  verifyRefreshToken,
} from '../utils/auth';
import prisma from '../clients/prisma';
import jwt from 'jsonwebtoken';
import { sendPasswordResetEmail, sendVerificationEmail } from '../utils/email';
import { isValidUniversityEmail } from '@repo/shared/utils/isValidUniversityEmail';
import { APP_FRONTEND_URL, getJwtSecret } from '../constants/constants';
import { ConfigProvider } from '../utils/configProvider';
import { AuthGuard } from '../common/guards/auth.guard';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  LoginDto,
  LogoutDto,
  RefreshTokenDto,
  RegisterUserDto,
  RequestPasswordResetDto,
  ResendVerificationDto,
  ResetPasswordDto,
  UpdatePasswordDto,
  AuthProfileResponseDto,
  AuthRegisterResponseDto,
  AuthEmailVerificationResponseDto,
  AuthLoginResponseDto,
  AuthTokensResponseDto,
} from '../dtos/auth.dto';
import { profileEntityToDto } from '../utils/entityToDtoMappers';
import { ErrorResponseDto, MessageResponseDto } from '../dtos/common.dto';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  /**
   * Validate if email belongs to allowed domains
   */
  private generateEmailVerificationToken(userId: string, email: string): string {
    return jwt.sign(
      { userId, email },
      getJwtSecret(),
      { expiresIn: '10m' },
    );
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOkResponse({ description: 'Current user profile', type: AuthProfileResponseDto })
  async me(
    @Req() req: Request,
    @Res() res: Response<AuthProfileResponseDto | ErrorResponseDto>,
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: { profile: true },
      });

      if (!user || !user.profile) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const userData = profileEntityToDto({
        ...user.profile,
        email: user.email,
        confirmedAt: user.confirmedAt,
      });

      res.status(200).json(userData);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  @Post('register')
  @ApiBody({ description: 'Register a new user', type: RegisterUserDto })
  @ApiOkResponse({ description: 'Registration accepted', type: AuthRegisterResponseDto })
  async register(
    @Body() body: RegisterUserDto,
    @Res() res: Response<AuthRegisterResponseDto | ErrorResponseDto>,
  ): Promise<void> {
    try {
      const { email, password, fullName, gender } = body;

      if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
      }

      const configProvider = await ConfigProvider.getInstance();
      const { allowedDomains } = configProvider.getAppConfig();

      if (allowedDomains.length > 0 && !isValidUniversityEmail(email, allowedDomains)) {
        res.status(400).json({
          message: `Email must end with one of the following domains: ${allowedDomains.join(', ')}`,
        });
        return;
      }

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        res.status(200).json({
          message: 'Registration request received. If this email can be registered, you will receive a verification link.',
        });
        return;
      }

      const hashedPassword = await hashPassword(password);

      const userProfile = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
          },
        });

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

      const emailVerifyToken = this.generateEmailVerificationToken(userProfile.id, userProfile.email);

      const frontendBaseUrl = APP_FRONTEND_URL.replace(/\/$/, '');
      const verifyUrl = `${frontendBaseUrl}/email-validated?token=${encodeURIComponent(emailVerifyToken)}`;

      await sendVerificationEmail(userProfile.email, verifyUrl);

      res.status(200).json({
        message: 'Registration request received. If this email can be registered, you will receive a verification link.',
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  @Get('verify-email')
  @ApiOkResponse({ description: 'Email verification result', type: AuthEmailVerificationResponseDto })
  async verifyEmail(
    @Query('token') token: string | undefined,
    @Res() res: Response<AuthEmailVerificationResponseDto | ErrorResponseDto>,
  ): Promise<void> {
    try {
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

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: { profile: true },
      });

      if (!user || !user.profile) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

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

      const accessToken = generateToken({
        userId: verifiedUser.id,
        email: verifiedUser.email,
        userRole: verifiedUser.profile.userRole,
      });

      const refreshToken = generateRefreshToken();

      await storeRefreshToken(verifiedUser.id, refreshToken);

      const profile = profileEntityToDto({
        ...verifiedUser.profile,
        email: verifiedUser.email,
        confirmedAt: verifiedUser.confirmedAt,
      });

      res.status(200).json({
        accessToken,
        refreshToken,
        user: profile,
      });
    } catch (error) {
      console.error('Verification error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  @Post('login')
  @ApiBody({ description: 'Login request', type: LoginDto })
  @ApiOkResponse({ description: 'Login response with tokens', type: AuthLoginResponseDto })
  async login(
    @Body() body: LoginDto,
    @Res() res: Response<AuthLoginResponseDto | ErrorResponseDto>,
  ): Promise<void> {
    try {
      const { email, password } = body;

      if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { email },
        include: { profile: true },
      });

      if (!user || !user.profile || !(await comparePassword(password, user.password))) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      if (!user.confirmedAt) {
        res.status(403).json({ message: 'Please verify your email before logging in' });
        return;
      }

      const accessToken = generateToken({
        userId: user.id,
        email: user.email,
        userRole: user.profile.userRole,
      });

      const refreshToken = generateRefreshToken();
      await storeRefreshToken(user.id, refreshToken);

      const profile = profileEntityToDto({
        ...user.profile,
        email: user.email,
        confirmedAt: user.confirmedAt,
      });

      res.status(200).json({
        accessToken,
        refreshToken,
        user: profile,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  @Post('refresh')
  @ApiBody({ description: 'Refresh token exchange', type: RefreshTokenDto })
  @ApiOkResponse({ description: 'New access token', type: AuthTokensResponseDto })
  async refresh(
    @Body() body: RefreshTokenDto,
    @Res() res: Response<AuthTokensResponseDto | ErrorResponseDto>,
  ): Promise<void> {
    try {
      const { refreshToken } = body;

      if (!refreshToken) {
        res.status(400).json({ message: 'Refresh token is required' });
        return;
      }

      const userId = await verifyRefreshToken(refreshToken);
      if (!userId) {
        res.status(401).json({ message: 'Invalid refresh token' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      if (!user || !user.profile) {
        res.status(401).json({ message: 'Invalid refresh token' });
        return;
      }

      const newAccessToken = generateToken({
        userId: user.id,
        email: user.email,
        userRole: user.profile.userRole,
      });

      res.status(200).json({
        accessToken: newAccessToken,
        refreshToken,
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  @Post('logout')
  @ApiBody({ description: 'Logout request', type: LogoutDto })
  @ApiOkResponse({ description: 'Logout acknowledgement', type: MessageResponseDto })
  async logout(
    @Body() body: LogoutDto,
    @Res() res: Response<MessageResponseDto | ErrorResponseDto>,
  ): Promise<void> {
    try {
      const { refreshToken } = body;

      if (!refreshToken) {
        res.status(400).json({ message: 'Refresh token is required' });
        return;
      }

      await revokeRefreshToken(refreshToken);

      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  @UseGuards(AuthGuard)
  @Post('update-password')
  @ApiBearerAuth()
  @ApiBody({ description: 'Update password request', type: UpdatePasswordDto })
  @ApiOkResponse({ description: 'Password updated', type: MessageResponseDto })
  async updatePassword(
    @Req() req: Request & { user?: { userId: string } },
    @Body() body: UpdatePasswordDto,
    @Res() res: Response<MessageResponseDto | ErrorResponseDto>,
  ): Promise<void> {
    try {
      const { currentPassword, newPassword } = body;

      if (!req.user?.userId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const user = await prisma.user.findUnique({ where: { id: req.user.userId } });

      if (!user || !(await comparePassword(currentPassword, user.password))) {
        res.status(401).json({ message: 'Current password is incorrect' });
        return;
      }

      const hashedPassword = await hashPassword(newPassword);

      await prisma.user.update({
        where: { id: req.user.userId },
        data: { password: hashedPassword },
      });

      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Update password error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  @Post('request-password-reset')
  @ApiBody({ description: 'Request password reset', type: RequestPasswordResetDto })
  @ApiOkResponse({ description: 'Password reset email queued', type: MessageResponseDto })
  async requestPasswordReset(
    @Body() body: RequestPasswordResetDto,
    @Res() res: Response<MessageResponseDto | ErrorResponseDto>,
  ): Promise<void> {
    try {
      const { email } = body;

      if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
      }

      const user = await prisma.user.findUnique({ where: { email } });

      if (user) {
        const resetToken = generatePasswordResetToken(user.id);
        await sendPasswordResetEmail(email, resetToken);
      }

      res.status(200).json({
        message: 'If an account exists with this email, you will receive password reset instructions.',
      });
    } catch (error) {
      console.error('Request password reset error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  @Post('reset-password')
  @ApiBody({ description: 'Reset password using token', type: ResetPasswordDto })
  @ApiOkResponse({ description: 'Password reset confirmation', type: MessageResponseDto })
  async resetPassword(
    @Body() body: ResetPasswordDto,
    @Res() res: Response<MessageResponseDto | ErrorResponseDto>,
  ): Promise<void> {
    try {
      const { token, newPassword } = body;

      if (!token || !newPassword) {
        res.status(400).json({ message: 'Token and new password are required' });
        return;
      }

      const userId = verifyPasswordResetToken(token);
      if (!userId) {
        res.status(400).json({ message: 'Invalid or expired reset token' });
        return;
      }

      const hashedPassword = await hashPassword(newPassword);

      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  @Post('resend-verification')
  @ApiBody({ description: 'Resend verification email', type: ResendVerificationDto })
  @ApiOkResponse({ description: 'Verification email resent', type: MessageResponseDto })
  async resendVerification(
    @Body() body: ResendVerificationDto,
    @Res() res: Response<MessageResponseDto | ErrorResponseDto>,
  ): Promise<void> {
    try {
      const { email } = body;

      if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
      }

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        res.status(200).json({ message: 'Verification email sent if account exists' });
        return;
      }

      const emailVerifyToken = this.generateEmailVerificationToken(user.id, user.email);

      const frontendBaseUrl = APP_FRONTEND_URL.replace(/\/$/, '');
      const verifyUrl = `${frontendBaseUrl}/email-validated?token=${encodeURIComponent(emailVerifyToken)}`;

      await sendVerificationEmail(user.email, verifyUrl);

      res.status(200).json({ message: 'Verification email sent' });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
