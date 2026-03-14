import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ProfileDto } from './profiles.dto';

export class RegisterUserDto {
  @ApiProperty({ example: 'student@example.edu' })
  @IsEmail()
    email!: string;

  @ApiProperty({ example: 'strong-password' })
  @IsString()
  @IsNotEmpty()
    password!: string;

  @ApiProperty({ example: 'Ada Lovelace' })
  @IsString()
  @IsNotEmpty()
    fullName!: string;

  @ApiProperty({ example: 'female' })
  @IsString()
  @IsNotEmpty()
    gender!: string;
}

export class LoginDto {
  @ApiProperty({ example: 'student@example.edu' })
  @IsEmail()
    email!: string;

  @ApiProperty({ example: 'strong-password' })
  @IsString()
  @IsNotEmpty()
    password!: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    refreshToken!: string;
}

export class UpdatePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    currentPassword!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    newPassword!: string;
}

export class RequestPasswordResetDto {
  @ApiProperty({ example: 'student@example.edu' })
  @IsEmail()
    email!: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    token!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    newPassword!: string;
}

export class ResendVerificationDto {
  @ApiProperty({ example: 'student@example.edu' })
  @IsEmail()
    email!: string;
}

export class VerifyEmailQueryDto {
  @ApiProperty({ description: 'Email verification token' })
  @IsString()
  @IsNotEmpty()
    token!: string;
}

// ============================================================
// Response DTOs
// ============================================================

export class AuthEmailVerificationResponseDto {
  @ApiProperty({ description: 'Access token' })
    accessToken!: string;

  @ApiProperty({ description: 'Refresh token' })
    refreshToken!: string;

  @ApiProperty({ description: 'User profile', type: ProfileDto })
    user!: ProfileDto;
}

export class AuthLoginResponseDto {
  @ApiProperty({ description: 'Access token' })
    accessToken!: string;

  @ApiProperty({ description: 'Refresh token' })
    refreshToken!: string;

  @ApiProperty({ description: 'User profile', type: ProfileDto })
    user!: ProfileDto;
}

export class AuthTokensResponseDto {
  @ApiProperty({ description: 'Access token' })
    accessToken!: string;

  @ApiProperty({ description: 'Refresh token' })
    refreshToken!: string;
}
