import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '@repo/shared/types/generated/enums';

export class UpdateProfileDto {
  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
    fullName?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
    gender?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
    conversationRole?: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
    bio?: string | null;
}

export class UpdateUserRoleDto {
  @ApiPropertyOptional({ enum: UserRole })
  @IsEnum(UserRole)
    userRole!: UserRole;
}


// ============================================================
// Response DTOs
// ============================================================

export class ProfileDto {
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
