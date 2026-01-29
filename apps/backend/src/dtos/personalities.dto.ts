import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreatePersonalityDto {
    @ApiPropertyOptional({ description: 'Personality name' })
    @IsString()
    name?: string;

    @ApiPropertyOptional({ description: 'Age of the personality' })
    @IsOptional()
    @IsInt()
    age?: number;

    @ApiPropertyOptional({ description: 'Avatar URL' })
    @IsOptional()
    @IsString()
    avatarUrl?: string;

    @ApiPropertyOptional({ description: 'Gender' })
    @IsOptional()
    @IsString()
    gender?: string;

    @ApiPropertyOptional({ description: 'Sex' })
    @IsOptional()
    @IsString()
    sex?: string;

    @ApiPropertyOptional({ description: 'Voice instructions' })
    @IsOptional()
    @IsString()
    voiceInstructions?: string;

    @ApiPropertyOptional({ description: 'ElevenLabs voice ID' })
    @IsOptional()
    @IsString()
    elevenlabsVoiceId?: string;

    @ApiPropertyOptional({ description: 'OpenAI voice name' })
    @IsOptional()
    @IsString()
    openaiVoiceName?: string;

    @ApiPropertyOptional({ description: 'Problem summary in English' })
    @IsOptional()
    @IsString()
    problemSummaryEn?: string;

    @ApiPropertyOptional({ description: 'Personality description in English' })
    @IsOptional()
    @IsString()
    personalityDescriptionEn?: string;

    @ApiPropertyOptional({ description: 'Problem summary in Czech' })
    @IsOptional()
    @IsString()
    problemSummaryCs?: string;

    @ApiPropertyOptional({ description: 'Personality description in Czech' })
    @IsOptional()
    @IsString()
    personalityDescriptionCs?: string;

    @ApiPropertyOptional({ description: 'Whether personality is hidden' })
    @IsOptional()
    @IsBoolean()
    isHidden?: boolean;
}

// UpdatePersonalityDto is identical but all fields are optional
export class UpdatePersonalityDto extends CreatePersonalityDto { }
