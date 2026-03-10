import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateScenarioDto {
  @ApiPropertyOptional({ description: 'Personality ID' })
  @IsInt()
    involvedPersonalityId?: number;

  @ApiPropertyOptional({ description: 'Situation description in English' })
  @IsOptional()
  @IsString()
    situationDescriptionEn?: string;

  @ApiPropertyOptional({ description: 'Setting in English' })
  @IsOptional()
  @IsString()
    settingEn?: string;

  @ApiPropertyOptional({ description: 'Situation description in Czech' })
  @IsOptional()
  @IsString()
    situationDescriptionCs?: string;

  @ApiPropertyOptional({ description: 'Setting in Czech' })
  @IsOptional()
  @IsString()
    settingCs?: string;
}

export class UpdateScenarioDto {
  @ApiPropertyOptional({ description: 'Personality ID' })
  @IsOptional()
  @IsInt()
    involvedPersonalityId?: number;

  @ApiPropertyOptional({ description: 'Situation description in English' })
  @IsOptional()
  @IsString()
    situationDescriptionEn?: string;

  @ApiPropertyOptional({ description: 'Setting in English' })
  @IsOptional()
  @IsString()
    settingEn?: string;

  @ApiPropertyOptional({ description: 'Situation description in Czech' })
  @IsOptional()
  @IsString()
    situationDescriptionCs?: string;

  @ApiPropertyOptional({ description: 'Setting in Czech' })
  @IsOptional()
  @IsString()
    settingCs?: string;
}

export class ScenarioPersonalityRefDto {
  @ApiProperty({ description: 'Personality ID' })
    id!: number;

  @ApiProperty({ description: 'Personality name' })
    name!: string;

  @ApiProperty({ description: 'Avatar URL', type: String, nullable: true })
    avatarUrl!: string | null;
}

export class ScenarioWithPersonalityDto {
  @ApiProperty({ description: 'Scenario ID' })
    id!: number;

  @ApiProperty({ description: 'Created at timestamp' })
    createdAt!: string;

  @ApiProperty({ description: 'Involved personality ID', type: Number, nullable: true })
    involvedPersonalityId!: number | null;

  @ApiProperty({ description: 'Situation description in English' })
    situationDescriptionEn!: string;

  @ApiProperty({ description: 'Setting in English' })
    settingEn!: string;

  @ApiProperty({ description: 'Situation description in Czech' })
    situationDescriptionCs!: string;

  @ApiProperty({ description: 'Setting in Czech' })
    settingCs!: string;

  @ApiProperty({ description: 'Associated personality', type: ScenarioPersonalityRefDto, nullable: true })
    personality!: ScenarioPersonalityRefDto | null;
}

export class ScenarioMessageResponseDto {
  @ApiProperty({ description: 'Response message' })
    message!: string;
}
