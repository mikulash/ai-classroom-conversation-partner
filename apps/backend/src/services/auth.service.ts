import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { isValidUniversityEmail } from '@repo/shared/utils/isValidUniversityEmail';
import { PrismaService } from '../core/prisma/prisma.service';
import { EnvConfigService } from '../core/config/env-config.service';
import { ConfigProvider } from '../utils/configProvider';
import {
  AuthEmailVerificationResponseDto,
  AuthLoginResponseDto,
  AuthTokensResponseDto,
  LoginDto,
  RefreshTokenDto,
  RegisterUserDto,
  RequestPasswordResetDto,
  ResendVerificationDto,
  ResetPasswordDto,
  UpdatePasswordDto,
} from '../dtos/auth.dto';
import { MessageResponseDto } from '../dtos/common.dto';
import { ProfileDto } from '../dtos/profiles.dto';
import { profileEntityToDto } from '../utils/entityToDtoMappers';
import { JWTPayload } from '../utils/auth';
import { TokenService } from './token.service';
import { MailService } from './mail.service';
import { Profile } from '../generated/prisma/client';

const GENERIC_REGISTRATION_MESSAGE =
  'Registration request received. If this email can be registered, you will receive a verification link.';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: EnvConfigService,
    private readonly configProvider: ConfigProvider,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
  ) {}

  async me(currentUser: JWTPayload): Promise<ProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.userId },
      include: { profile: true },
    });

    if (!user?.profile) {
      throw new NotFoundException('User not found');
    }

    return profileEntityToDto({
      ...user.profile,
      email: user.email,
      confirmedAt: user.confirmedAt,
    });
  }

  async register(body: RegisterUserDto): Promise<MessageResponseDto> {
    const { email, password, fullName, gender } = body;
    const { allowedDomains } = await this.configProvider.getAppConfig();

    if (allowedDomains.length > 0 && !isValidUniversityEmail(email, allowedDomains)) {
      throw new BadRequestException(
        `Email must end with one of the following domains: ${allowedDomains.join(', ')}`,
      );
    }

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { message: GENERIC_REGISTRATION_MESSAGE };
    }

    const hashedPassword = await this.tokenService.hashPassword(password);
    const userProfile = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      await tx.profile.create({
        data: {
          id: user.id,
          fullName,
          gender,
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

    const emailVerifyToken = this.tokenService.generateEmailVerificationToken(userProfile.id, userProfile.email);
    const verifyUrl = `${this.config.appFrontendUrl}/email-validated?token=${encodeURIComponent(emailVerifyToken)}`;

    await this.mailService.sendVerificationEmail(userProfile.email, verifyUrl);

    return { message: GENERIC_REGISTRATION_MESSAGE };
  }

  async verifyEmail(token: string): Promise<AuthEmailVerificationResponseDto> {
    const payload = this.tokenService.verifyEmailVerificationToken(token);
    if (!payload) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      include: { profile: true },
    });

    if (!user?.profile) {
      throw new NotFoundException('User not found');
    }

    const verifiedUser = await this.prisma.user.update({
      where: { id: payload.userId },
      data: {
        confirmedAt: user.confirmedAt ?? new Date(),
      },
      include: { profile: true },
    });

    if (!verifiedUser.profile) {
      throw new InternalServerErrorException('Failed to confirm user');
    }

    return this.buildAuthenticatedUserResponse({
      ...verifiedUser,
      profile: verifiedUser.profile,
    });
  }

  async login(body: LoginDto): Promise<AuthLoginResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
      include: { profile: true },
    });

    if (!user?.profile || !(await this.tokenService.comparePassword(body.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.confirmedAt) {
      throw new ForbiddenException('Please verify your email before logging in');
    }

    return this.buildAuthenticatedUserResponse({
      ...user,
      profile: user.profile,
    });
  }

  async refresh(body: RefreshTokenDto): Promise<AuthTokensResponseDto> {
    const rotatedToken = await this.tokenService.rotateRefreshToken(body.refreshToken);
    if (!rotatedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: rotatedToken.userId },
      include: { profile: true },
    });

    if (!user?.profile) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return {
      accessToken: this.tokenService.generateAccessToken({
        userId: user.id,
        email: user.email,
        userRole: user.profile.userRole,
      }),
      refreshToken: rotatedToken.refreshToken,
    };
  }

  async logout(body: RefreshTokenDto): Promise<MessageResponseDto> {
    await this.tokenService.revokeRefreshToken(body.refreshToken);
    return { message: 'Logged out successfully' };
  }

  async updatePassword(currentUser: JWTPayload, body: UpdatePasswordDto): Promise<MessageResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id: currentUser.userId } });

    if (!user || !(await this.tokenService.comparePassword(body.currentPassword, user.password))) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await this.tokenService.hashPassword(body.newPassword);
    await this.prisma.user.update({
      where: { id: currentUser.userId },
      data: { password: hashedPassword },
    });
    await this.tokenService.revokeAllRefreshTokensForUser(currentUser.userId);

    return { message: 'Password updated successfully' };
  }

  async requestPasswordReset(body: RequestPasswordResetDto): Promise<MessageResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { email: body.email } });

    if (user) {
      const resetToken = await this.tokenService.createPasswordResetToken(user.id);
      const resetUrl = `${this.config.appFrontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
      await this.mailService.sendPasswordResetEmail(body.email, resetUrl);
    }

    return {
      message: 'If an account exists with this email, you will receive password reset instructions.',
    };
  }

  async resetPassword(body: ResetPasswordDto): Promise<MessageResponseDto> {
    const userId = await this.tokenService.consumePasswordResetToken(body.token);
    if (!userId) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await this.tokenService.hashPassword(body.newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    await this.tokenService.revokeAllRefreshTokensForUser(userId);

    return { message: 'Password reset successfully' };
  }

  async resendVerification(body: ResendVerificationDto): Promise<MessageResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { email: body.email } });

    if (!user) {
      return { message: 'Verification email sent if account exists' };
    }

    const emailVerifyToken = this.tokenService.generateEmailVerificationToken(user.id, user.email);
    const verifyUrl = `${this.config.appFrontendUrl}/email-validated?token=${encodeURIComponent(emailVerifyToken)}`;

    await this.mailService.sendVerificationEmail(user.email, verifyUrl);

    return { message: 'Verification email sent' };
  }

  private async buildAuthenticatedUserResponse(
    user: {
      id: string;
      email: string;
      confirmedAt: Date | null;
      profile: Profile;
    },
  ): Promise<AuthLoginResponseDto> {
    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
      userRole: user.profile.userRole,
    });
    const refreshToken = await this.tokenService.createRefreshToken(user.id);
    const profile = profileEntityToDto({
      ...user.profile,
      email: user.email,
      confirmedAt: user.confirmedAt,
    });

    return { accessToken, refreshToken, user: profile };
  }
}
