import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class ErrorResponseDto {
    @ApiProperty({ description: 'Error message' })
      message!: string;
}

export class MessageResponseDto {
    @ApiProperty({ description: 'Response message' })
      message!: string;
}

export class ModelSelectionIdsDto {
  @ApiPropertyOptional({ description: 'Response model ID', type: Number, nullable: true })
  @IsOptional()
  @IsInt()
    responseModelId?: number | null;

  @ApiPropertyOptional({ description: 'TTS model ID', type: Number, nullable: true })
  @IsOptional()
  @IsInt()
    ttsModelId?: number | null;

  @ApiPropertyOptional({ description: 'Realtime model ID', type: Number, nullable: true })
  @IsOptional()
  @IsInt()
    realtimeModelId?: number | null;

  @ApiPropertyOptional({ description: 'Realtime transcription model ID', type: Number, nullable: true })
  @IsOptional()
  @IsInt()
    realtimeTranscriptionModelId?: number | null;

  @ApiPropertyOptional({ description: 'Timestamped transcription model ID', type: Number, nullable: true })
  @IsOptional()
  @IsInt()
    timestampedTranscriptionModelId?: number | null;
}
