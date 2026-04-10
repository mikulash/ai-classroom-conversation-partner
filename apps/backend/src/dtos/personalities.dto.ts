import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { OpenAiVoiceName, Sex } from '../generated/prisma/enums';

export class CreatePersonalityDto {
  @ApiProperty({ description: 'Personality name' })
  @IsString()
    name!: string;

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

  @ApiPropertyOptional({ description: 'Sex', enum: Sex, enumName: 'Sex' })
  @IsOptional()
  @IsEnum(Sex)
    sex?: Sex;

  @ApiPropertyOptional({ description: 'Voice instructions' })
  @IsOptional()
  @IsString()
    voiceInstructions?: string;

  @ApiPropertyOptional({ description: 'ElevenLabs voice ID' })
  @IsOptional()
  @IsString()
    elevenlabsVoiceId?: string;

  @ApiPropertyOptional({
    description: 'OpenAI voice name',
    enum: OpenAiVoiceName,
    enumName: 'OpenAiVoiceName',
  })
  @IsOptional()
  @IsEnum(OpenAiVoiceName)
    openaiVoiceName?: OpenAiVoiceName;

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

export class UpdatePersonalityDto extends PartialType(CreatePersonalityDto) { }

export class PersonalityRefDto {
  @ApiProperty({ description: 'Personality ID' })
    id!: number;

  @ApiProperty({ description: 'Personality name' })
    name!: string;

  @ApiProperty({ description: 'Avatar URL', type: String, nullable: true })
    avatarUrl!: string | null;
}

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
    sex!: Sex;

  @ApiProperty({ description: 'Voice instructions', type: String, nullable: true })
    voiceInstructions!: string | null;

  @ApiProperty({ description: 'ElevenLabs voice ID', type: String, nullable: true })
    elevenlabsVoiceId!: string | null;

  @ApiProperty({ description: 'OpenAI voice name', enum: OpenAiVoiceName })
    openaiVoiceName!: OpenAiVoiceName;

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


