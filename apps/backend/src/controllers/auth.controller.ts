import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { RateLimit } from '../common/decorators/rate-limit.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  LoginDto,
  RefreshTokenDto,
  RegisterUserDto,
  RequestPasswordResetDto,
  ResendVerificationDto,
  ResetPasswordDto,
  UpdatePasswordDto,
  AuthEmailVerificationResponseDto,
  AuthLoginResponseDto,
  AuthTokensResponseDto,
  VerifyEmailQueryDto,
} from '../dtos/auth.dto';
import { ProfileDto } from '../dtos/profiles.dto';
import { MessageResponseDto } from '../dtos/common.dto';
import { AuthService } from '../services/auth.service';
import type { JWTPayload } from '../utils/auth';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOkResponse({ description: 'Current user profile', type: ProfileDto })
  me(@CurrentUser() user: JWTPayload): Promise<ProfileDto> {
    return this.authService.me(user);
  }

  @Post('register')
  @HttpCode(200)
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 5, windowMs: 15 * 60 * 1000 })
  @ApiBody({ description: 'Register a new user', type: RegisterUserDto })
  @ApiOkResponse({ description: 'Registration accepted', type: MessageResponseDto })
  register(@Body() body: RegisterUserDto): Promise<MessageResponseDto> {
    return this.authService.register(body);
  }

  @Get('verify-email')
  @ApiOkResponse({ description: 'Email verification result', type: AuthEmailVerificationResponseDto })
  verifyEmail(@Query() query: VerifyEmailQueryDto): Promise<AuthEmailVerificationResponseDto> {
    return this.authService.verifyEmail(query.token);
  }

  @Post('login')
  @HttpCode(200)
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 10, windowMs: 15 * 60 * 1000 })
  @ApiBody({ description: 'Login request', type: LoginDto })
  @ApiOkResponse({ description: 'Login response with tokens', type: AuthLoginResponseDto })
  login(@Body() body: LoginDto): Promise<AuthLoginResponseDto> {
    return this.authService.login(body);
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiBody({ description: 'Refresh token exchange', type: RefreshTokenDto })
  @ApiOkResponse({ description: 'New access token', type: AuthTokensResponseDto })
  refresh(@Body() body: RefreshTokenDto): Promise<AuthTokensResponseDto> {
    return this.authService.refresh(body);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiBody({ description: 'Logout request', type: RefreshTokenDto })
  @ApiOkResponse({ description: 'Logout acknowledgement', type: MessageResponseDto })
  logout(@Body() body: RefreshTokenDto): Promise<MessageResponseDto> {
    return this.authService.logout(body);
  }

  @UseGuards(AuthGuard)
  @Post('update-password')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiBody({ description: 'Update password request', type: UpdatePasswordDto })
  @ApiOkResponse({ description: 'Password updated', type: MessageResponseDto })
  updatePassword(
    @CurrentUser() user: JWTPayload,
    @Body() body: UpdatePasswordDto,
  ): Promise<MessageResponseDto> {
    return this.authService.updatePassword(user, body);
  }

  @Post('request-password-reset')
  @HttpCode(200)
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 5, windowMs: 15 * 60 * 1000 })
  @ApiBody({ description: 'Request password reset', type: RequestPasswordResetDto })
  @ApiOkResponse({ description: 'Password reset email queued', type: MessageResponseDto })
  requestPasswordReset(@Body() body: RequestPasswordResetDto): Promise<MessageResponseDto> {
    return this.authService.requestPasswordReset(body);
  }

  @Post('reset-password')
  @HttpCode(200)
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 10, windowMs: 15 * 60 * 1000 })
  @ApiBody({ description: 'Reset password using token', type: ResetPasswordDto })
  @ApiOkResponse({ description: 'Password reset confirmation', type: MessageResponseDto })
  resetPassword(@Body() body: ResetPasswordDto): Promise<MessageResponseDto> {
    return this.authService.resetPassword(body);
  }

  @Post('resend-verification')
  @HttpCode(200)
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 5, windowMs: 15 * 60 * 1000 })
  @ApiBody({ description: 'Resend verification email', type: ResendVerificationDto })
  @ApiOkResponse({ description: 'Verification email resent', type: MessageResponseDto })
  resendVerification(@Body() body: ResendVerificationDto): Promise<MessageResponseDto> {
    return this.authService.resendVerification(body);
  }
}
