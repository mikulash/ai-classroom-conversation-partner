import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateScenarioDto {
    @ApiProperty({ description: 'Personality ID' })
    @IsInt()
      involvedPersonalityId!: number;

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
