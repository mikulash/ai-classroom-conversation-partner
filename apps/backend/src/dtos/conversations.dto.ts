import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsInt, IsOptional, IsString } from 'class-validator';
import type { ConversationType } from '@repo/shared/types/generated/enums';

export class CreateConversationDto {
    @ApiPropertyOptional({ description: 'Personality ID' })
    @IsOptional()
    @IsInt()
    personalityId?: number | null;

    @ApiPropertyOptional({ description: 'Scenario ID' })
    @IsOptional()
    @IsInt()
    scenarioId?: number | null;

    @ApiProperty({ description: 'Conversation start time' })
    @IsDateString()
    startTime!: string;

    @ApiPropertyOptional({ description: 'Conversation end time' })
    @IsOptional()
    @IsDateString()
    endTime?: string | null;

    @ApiPropertyOptional({ description: 'Reason conversation ended' })
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

    @ApiProperty({ description: 'Conversation type' })
    @IsString()
    conversationType!: ConversationType;
}
