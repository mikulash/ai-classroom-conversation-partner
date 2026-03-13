import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsInt, IsOptional, IsString } from 'class-validator';
import { ConversationType } from '@repo/shared/types/generated/enums';

// ============================================================
// Nested item DTOs
// ============================================================

/** Matches ConversationMessage from @repo/shared/types/conversationMessage */
export class ConversationMessageDto {
    @ApiProperty({ description: 'Role of the message sender', enum: ['user', 'assistant'] })
      role!: 'user' | 'assistant';

    @ApiProperty({ description: 'Message content' })
      content!: string;

    @ApiProperty({ description: 'Message timestamp (ISO 8601)' })
      timestamp!: string;
}

/** Matches logLevel from @repo/shared/types/conversationLog */
export type LogLevel = 'log' | 'error' | 'warn';

/** Matches ConversationLog from @repo/shared/types/conversationLog */
export class ConversationLogDto {
    @ApiProperty({ description: 'Log timestamp (ISO 8601)' })
      timestamp!: string;

    @ApiProperty({ description: 'Log level', enum: ['log', 'error', 'warn'] })
      level!: LogLevel;

    @ApiProperty({ description: 'Log message' })
      message!: string;

    @ApiPropertyOptional({ description: 'Additional log data', type: 'object', additionalProperties: true, nullable: true })
      data?: Record<string, unknown> | null;
}

// ============================================================
// Request DTOs
// ============================================================

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

    @ApiPropertyOptional({ description: 'Conversation messages', type: [ConversationMessageDto] })
    @IsOptional()
    @IsArray()
      messages?: ConversationMessageDto[];

    @ApiPropertyOptional({ description: 'Conversation logs', type: [ConversationLogDto] })
    @IsOptional()
    @IsArray()
      logs?: ConversationLogDto[];

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

    @ApiPropertyOptional({ description: 'Conversation messages', type: [ConversationMessageDto], nullable: true })
      messages!: ConversationMessageDto[] | null;

    @ApiPropertyOptional({ description: 'Conversation logs', type: [ConversationLogDto], nullable: true })
      logs!: ConversationLogDto[] | null;

    @ApiProperty({ description: 'Conversation type', enum: ConversationType })
      conversationType!: ConversationType;

    @ApiPropertyOptional({ description: 'Personality reference', type: ConversationPersonalityRefDto, nullable: true })
      personality!: ConversationPersonalityRefDto | null;

    @ApiPropertyOptional({ description: 'Scenario reference', type: ConversationScenarioRefDto, nullable: true })
      scenario?: ConversationScenarioRefDto | null;
}
