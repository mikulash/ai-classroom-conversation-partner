import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { OpenAiVoiceName, Sex } from '@repo/shared/types/generated/enums';

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

export class PersonalityDto {
  @ApiProperty({ description: 'Personality ID' })
    id!: number;

  @ApiProperty({ description: 'Created at timestamp' })
    createdAt!: string;

  @ApiProperty({ description: 'Personality name' })
    name!: string;

  @ApiProperty({ description: 'Age', type: Number, nullable: true })
    age!: number | null;

  @ApiProperty({ description: 'Avatar URL', type: String, nullable: true })
    avatarUrl!: string | null;

  @ApiProperty({ description: 'Gender' })
    gender!: string;

  @ApiProperty({ description: 'Sex', enum: Sex })
    sex!: string;

  @ApiProperty({ description: 'Voice instructions', type: String, nullable: true })
    voiceInstructions!: string | null;

  @ApiProperty({ description: 'ElevenLabs voice ID', type: String, nullable: true })
    elevenlabsVoiceId!: string | null;

  @ApiProperty({ description: 'OpenAI voice name', enum: OpenAiVoiceName })
    openaiVoiceName!: string;

  @ApiProperty({ description: 'Problem summary in English' })
    problemSummaryEn!: string;

  @ApiProperty({ description: 'Personality description in English' })
    personalityDescriptionEn!: string;

  @ApiProperty({ description: 'Problem summary in Czech' })
    problemSummaryCs!: string;

  @ApiProperty({ description: 'Personality description in Czech' })
    personalityDescriptionCs!: string;

  @ApiProperty({ description: 'Whether personality is hidden' })
    isHidden!: boolean;
}

export class MessageResponseDto {
  @ApiProperty({ description: 'Response message' })
    message!: string;
}
