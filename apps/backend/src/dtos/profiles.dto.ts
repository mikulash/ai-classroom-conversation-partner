import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '@repo/shared/types/generated/enums';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
    fullName?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
    gender?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
    conversationRole?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
    bio?: string | null;
}

export class UpdateUserRoleDto {
  @ApiPropertyOptional({ enum: UserRole })
  @IsEnum(UserRole)
    userRole!: UserRole;
}
