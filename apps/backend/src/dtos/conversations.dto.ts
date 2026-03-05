import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsInt, IsOptional, IsString } from 'class-validator';
import { ConversationType } from '@repo/shared/types/generated/enums';

export class CreateConversationDto {
    @ApiPropertyOptional({ description: 'Personality ID', type: Number, nullable: true })
    @IsOptional()
    @IsInt()
      personalityId?: number | null;

    @ApiPropertyOptional({ description: 'Scenario ID', type: Number, nullable: true })
    @IsOptional()
    @IsInt()
      scenarioId?: number | null;

    @ApiProperty({ description: 'Conversation start time' })
    @IsDateString()
      startTime!: string;

    @ApiPropertyOptional({ description: 'Conversation end time', type: String, nullable: true })
    @IsOptional()
    @IsDateString()
      endTime?: string | null;

    @ApiPropertyOptional({ description: 'Reason conversation ended', type: String, nullable: true })
    @IsOptional()
    @IsString()
      endedReason?: string | null;

    @ApiPropertyOptional({ description: 'Conversation messages', type: [Object] })
    @IsOptional()
    @IsArray()
      messages?: unknown[];

    @ApiPropertyOptional({ description: 'Conversation logs', type: [Object] })
    @IsOptional()
    @IsArray()
      logs?: unknown[];

    @ApiProperty({ description: 'Conversation type', enum: ConversationType })
    @IsString()
      conversationType!: ConversationType;
}

// ============================================================
// Response DTOs
// ============================================================

export class ConversationPersonalityRefDto {
    @ApiProperty({ description: 'Personality ID' })
      id!: number;

    @ApiProperty({ description: 'Personality name' })
      name!: string;

    @ApiProperty({ description: 'Avatar URL', type: String, nullable: true })
      avatarUrl!: string | null;
}

export class ConversationScenarioRefDto {
    @ApiProperty({ description: 'Scenario ID' })
      id!: number;

    @ApiProperty({ description: 'Situation description in English' })
      situationDescriptionEn!: string;

    @ApiProperty({ description: 'Situation description in Czech' })
      situationDescriptionCs!: string;
}

export class ConversationWithPersonalityDto {
    @ApiProperty({ description: 'Conversation ID' })
      id!: number;

    @ApiProperty({ description: 'Created at timestamp' })
      createdAt!: string;

    @ApiProperty({ description: 'User ID' })
      userId!: string;

    @ApiPropertyOptional({ description: 'Personality ID', type: Number, nullable: true })
      personalityId!: number | null;

    @ApiPropertyOptional({ description: 'Scenario ID', type: Number, nullable: true })
      scenarioId!: number | null;

    @ApiProperty({ description: 'Conversation start time' })
      startTime!: string;

    @ApiProperty({ description: 'Conversation end time' })
      endTime!: string;

    @ApiProperty({ description: 'Ended reason' })
      endedReason!: string;

    @ApiPropertyOptional({ description: 'Conversation messages', type: [Object], nullable: true })
      messages!: unknown[] | null;

    @ApiPropertyOptional({ description: 'Conversation logs', type: [Object], nullable: true })
      logs!: unknown[] | null;

    @ApiProperty({ description: 'Conversation type', enum: ConversationType })
      conversationType!: ConversationType;

    @ApiPropertyOptional({ description: 'Personality reference', type: ConversationPersonalityRefDto, nullable: true })
      personality!: ConversationPersonalityRefDto | null;

    @ApiPropertyOptional({ description: 'Scenario reference', type: ConversationScenarioRefDto, nullable: true })
      scenario?: ConversationScenarioRefDto | null;
}

export class ConversationMessageResponseDto {
    @ApiProperty({ description: 'Response message' })
      message!: string;
}
