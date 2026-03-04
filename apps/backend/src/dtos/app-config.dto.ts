import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class UpdateAppConfigDto {
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

export class AppConfigDto {
  @ApiProperty({ description: 'Config ID' })
    id!: number;

  @ApiProperty({ description: 'Valid from timestamp' })
    validFrom!: string;

  @ApiProperty({ description: 'Valid to timestamp', type: String, nullable: true })
    validTo!: string | null;

  @ApiProperty({ description: 'User ID', type: String, nullable: true })
    userId!: string | null;

  @ApiProperty({ description: 'Response model ID', type: Number, nullable: true })
    responseModelId!: number | null;

  @ApiProperty({ description: 'TTS model ID', type: Number, nullable: true })
    ttsModelId!: number | null;

  @ApiProperty({ description: 'Realtime model ID', type: Number, nullable: true })
    realtimeModelId!: number | null;

  @ApiProperty({ description: 'Silence timeout in seconds' })
    silenceTimeoutInSeconds!: number;

  @ApiProperty({ description: 'Allowed email domains', type: [String] })
    allowedDomains!: string[];

  @ApiProperty({ description: 'Application name' })
    appName!: string;

  @ApiProperty({ description: 'Realtime transcription model ID', type: Number, nullable: true })
    realtimeTranscriptionModelId!: number | null;

  @ApiProperty({ description: 'Timestamped transcription model ID', type: Number, nullable: true })
    timestampedTranscriptionModelId!: number | null;

  @ApiProperty({ description: 'Max conversation duration in seconds' })
    maxConversationDurationInSeconds!: number;
}

