import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  RealtimeModelProvider,
  ResponseModelProvider,
  TimestampedTranscriptionModelProvider,
  TranscriptionModelProvider,
  TtsModelProvider,
} from '../generated/prisma/enums';

// ============================================================
// Response DTOs
// ============================================================

export class ResponseModelDto {
  @ApiProperty({ description: 'Model ID' })
    id!: number;

  @ApiProperty({ description: 'Created at timestamp' })
    createdAt!: string;

  @ApiProperty({ description: 'Friendly name' })
    friendlyName!: string;

  @ApiProperty({ description: 'API name' })
    apiName!: string;

  @ApiPropertyOptional({ description: 'Documentation URL', type: String, nullable: true })
    docsUrl!: string | null;

  @ApiProperty({ description: 'Whether model is enabled' })
    isEnabled!: boolean;

  @ApiProperty({ description: 'Model provider', enum: ResponseModelProvider, enumName: 'ResponseModelProvider' })
    provider!: ResponseModelProvider;
}

export class TtsModelDto {
  @ApiProperty({ description: 'Model ID' })
    id!: number;

  @ApiProperty({ description: 'Created at timestamp' })
    createdAt!: string;

  @ApiProperty({ description: 'Friendly name' })
    friendlyName!: string;

  @ApiProperty({ description: 'API name' })
    apiName!: string;

  @ApiProperty({ description: 'Sample rate' })
    sampleRate!: number;

  @ApiProperty({ description: 'Documentation URL' })
    docsUrl!: string;

  @ApiProperty({ description: 'Whether model is enabled' })
    isEnabled!: boolean;

  @ApiProperty({ description: 'Model provider', enum: TtsModelProvider, enumName: 'TtsModelProvider' })
    provider!: TtsModelProvider;

  @ApiProperty({ description: 'Whether model allows word-level timestamped transcripts' })
    allowsWordLevelTimestampedTranscript!: boolean;
}

export class RealtimeModelDto {
  @ApiProperty({ description: 'Model ID' })
    id!: number;

  @ApiProperty({ description: 'Created at timestamp' })
    createdAt!: string;

  @ApiProperty({ description: 'Friendly name' })
    friendlyName!: string;

  @ApiProperty({ description: 'API name' })
    apiName!: string;

  @ApiPropertyOptional({ description: 'Documentation URL', type: String, nullable: true })
    docsUrl!: string | null;

  @ApiProperty({ description: 'Whether model is enabled' })
    isEnabled!: boolean;

  @ApiProperty({ description: 'Model provider', enum: RealtimeModelProvider, enumName: 'RealtimeModelProvider' })
    provider!: RealtimeModelProvider;
}

export class RealtimeTranscriptionModelDto {
  @ApiProperty({ description: 'Model ID' })
    id!: number;

  @ApiProperty({ description: 'Created at timestamp' })
    createdAt!: string;

  @ApiProperty({ description: 'Friendly name' })
    friendlyName!: string;

  @ApiProperty({ description: 'Model provider', enum: TranscriptionModelProvider, enumName: 'TranscriptionModelProvider' })
    provider!: TranscriptionModelProvider;

  @ApiProperty({ description: 'API name' })
    apiName!: string;

  @ApiPropertyOptional({ description: 'Documentation URL', type: String, nullable: true })
    docsUrl!: string | null;

  @ApiPropertyOptional({ description: 'Whether model is enabled', type: Boolean, nullable: true })
    isEnabled!: boolean | null;

  @ApiProperty({ description: 'Whether model allows word-level timestamps' })
    allowsWordLevelTimestamps!: boolean;
}

export class TimestampedTranscriptionModelDto {
  @ApiProperty({ description: 'Model ID' })
    id!: number;

  @ApiProperty({ description: 'Created at timestamp' })
    createdAt!: string;

  @ApiProperty({ description: 'Friendly name' })
    friendlyName!: string;

  @ApiProperty({ description: 'Model provider', enum: TimestampedTranscriptionModelProvider, enumName: 'TimestampedTranscriptionModelProvider' })
    provider!: TimestampedTranscriptionModelProvider;

  @ApiProperty({ description: 'API name' })
    apiName!: string;

  @ApiPropertyOptional({ description: 'Documentation URL', type: String, nullable: true })
    docsUrl!: string | null;

  @ApiProperty({ description: 'Whether model is enabled' })
    isEnabled!: boolean;
}

export class CustomSelectionWithModelsDto {
  @ApiProperty({ description: 'User ID' })
    userId!: string;

  @ApiProperty({ description: 'Created at timestamp' })
    createdAt!: string;

  @ApiPropertyOptional({ description: 'Response model ID', type: Number, nullable: true })
    responseModelId!: number | null;

  @ApiPropertyOptional({ description: 'TTS model ID', type: Number, nullable: true })
    ttsModelId!: number | null;

  @ApiPropertyOptional({ description: 'Realtime model ID', type: Number, nullable: true })
    realtimeModelId!: number | null;

  @ApiPropertyOptional({ description: 'Realtime transcription model ID', type: Number, nullable: true })
    realtimeTranscriptionModelId!: number | null;

  @ApiPropertyOptional({ description: 'Timestamped transcription model ID', type: Number, nullable: true })
    timestampedTranscriptionModelId!: number | null;

  @ApiPropertyOptional({ description: 'Response model', type: ResponseModelDto, nullable: true })
    responseModel!: ResponseModelDto | null;

  @ApiPropertyOptional({ description: 'TTS model', type: TtsModelDto, nullable: true })
    ttsModel!: TtsModelDto | null;

  @ApiPropertyOptional({ description: 'Realtime model', type: RealtimeModelDto, nullable: true })
    realtimeModel!: RealtimeModelDto | null;

  @ApiPropertyOptional({ description: 'Realtime transcription model', type: RealtimeTranscriptionModelDto, nullable: true })
    realtimeTranscriptionModel!: RealtimeTranscriptionModelDto | null;

  @ApiPropertyOptional({ description: 'Timestamped transcription model', type: TimestampedTranscriptionModelDto, nullable: true })
    timestampedTranscriptionModel!: TimestampedTranscriptionModelDto | null;
}
