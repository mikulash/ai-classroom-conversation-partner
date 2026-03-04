import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { UserRole } from '@repo/shared/types/generated/enums';

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

export class LogoutDto {
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

// ============================================================
// Response DTOs
// ============================================================

export class AuthProfileResponseDto {
  @ApiProperty({ description: 'User ID' })
    id!: string;

  @ApiProperty({ description: 'Created at timestamp' })
    createdAt!: string;

  @ApiProperty({ description: 'Updated at timestamp' })
    updatedAt!: string;

  @ApiProperty({ description: 'Full name' })
    fullName!: string;

  @ApiProperty({ description: 'Gender' })
    gender!: string;

  @ApiProperty({ description: 'User role', enum: UserRole })
    userRole!: UserRole;

  @ApiProperty({ description: 'Conversation role' })
    conversationRole!: string;

  @ApiProperty({ description: 'Bio' })
    bio!: string;

  @ApiProperty({ description: 'Email address' })
    email!: string;

  @ApiPropertyOptional({ description: 'Email confirmed at timestamp', type: String, nullable: true })
    confirmedAt!: string | null;
}

export class AuthRegisterResponseDto {
  @ApiProperty({ description: 'Registration result message' })
    message!: string;
}

export class AuthEmailVerificationResponseDto {
  @ApiProperty({ description: 'Access token' })
    accessToken!: string;

  @ApiProperty({ description: 'Refresh token' })
    refreshToken!: string;

  @ApiProperty({ description: 'User profile', type: AuthProfileResponseDto })
    user!: AuthProfileResponseDto;
}

export class AuthLoginResponseDto {
  @ApiProperty({ description: 'Access token' })
    accessToken!: string;

  @ApiProperty({ description: 'Refresh token' })
    refreshToken!: string;

  @ApiProperty({ description: 'User profile', type: AuthProfileResponseDto })
    user!: AuthProfileResponseDto;
}

export class AuthTokensResponseDto {
  @ApiProperty({ description: 'Access token' })
    accessToken!: string;

  @ApiProperty({ description: 'Refresh token' })
    refreshToken!: string;
}

export class AuthMessageResponseDto {
  @ApiProperty({ description: 'Response message' })
    message!: string;
}
