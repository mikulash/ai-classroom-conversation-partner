import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

import type { ApiKey } from '@repo/shared/enums/ApiKey';

export class GenerateReplyDto {
  @ApiProperty({ description: 'User input text' })
  @IsString()
    inputText!: string;

  @ApiPropertyOptional({ description: 'Previous conversation messages', type: [Object] })
  @IsOptional()
  @IsArray()
    previousMessages?: unknown[];

  @ApiPropertyOptional({ description: 'Personality configuration' })
  @IsOptional()
  @IsObject()
    personality?: unknown;

  @ApiPropertyOptional({ description: 'Conversation role' })
  @IsOptional()
    conversationRole?: unknown;

  @ApiPropertyOptional({ description: 'Language setting' })
  @IsOptional()
  @IsString()
    language?: string;

  @ApiPropertyOptional({ description: 'Scenario configuration' })
  @IsOptional()
  @IsObject()
    scenario?: unknown;

  @ApiPropertyOptional({ description: 'User profile information' })
  @IsOptional()
  @IsObject()
    userProfile?: unknown;
}

export class TextToSpeechDto {
  @ApiProperty({ description: 'Text to convert to speech' })
  @IsString()
    inputMessage!: string;

  @ApiPropertyOptional({ description: 'Personality for voice settings' })
  @IsOptional()
  @IsObject()
    personality?: unknown;

  @ApiPropertyOptional({ description: 'Language setting' })
  @IsOptional()
  @IsString()
    language?: string;

  @ApiPropertyOptional({ description: 'Audio response format' })
  @IsOptional()
  @IsString()
    responseFormat?: string;
}

export class TextToSpeechTimestampedDto {
  @ApiProperty({ description: 'Text to convert to speech' })
  @IsString()
    inputMessage!: string;

  @ApiPropertyOptional({ description: 'Personality for voice settings' })
  @IsOptional()
  @IsObject()
    personality?: unknown;

  @ApiPropertyOptional({ description: 'Language setting' })
  @IsOptional()
  @IsString()
    language?: string;
}

export class RealtimeVoiceDto {
  @ApiProperty({ description: 'SDP offer for WebRTC' })
  @IsString()
    sdpOffer!: string;

  @ApiPropertyOptional({ description: 'Personality configuration' })
  @IsOptional()
  @IsObject()
    personality?: unknown;

  @ApiPropertyOptional({ description: 'Conversation role' })
  @IsOptional()
    conversationRole?: unknown;

  @ApiPropertyOptional({ description: 'Language setting' })
  @IsOptional()
  @IsString()
    language?: string;

  @ApiPropertyOptional({ description: 'Scenario configuration' })
  @IsOptional()
  @IsObject()
    scenario?: unknown;

  @ApiPropertyOptional({ description: 'User profile information' })
  @IsOptional()
  @IsObject()
    userProfile?: unknown;
}

export class RealtimeTranscriptionDto {
  @ApiPropertyOptional({ description: 'Language setting' })
  @IsOptional()
  @IsString()
    language?: string;
}

// ============================================================
// Response DTOs
// ============================================================

export class TextToSpeechResponseDto {
  @ApiProperty({ description: 'Base64 encoded audio' })
    audioBase64!: string;

  @ApiProperty({ description: 'Sample rate of the audio' })
    sampleRate!: number;
}

export class TextToSpeechTimestampedResponseDto {
  @ApiProperty({ description: 'Array of base64 encoded audio chunks', type: [String] })
    audio!: string[];

  @ApiProperty({ description: 'Array of words spoken', type: [String] })
    words!: string[];

  @ApiProperty({ description: 'Array of start times for words', type: [Number] })
    wtimes!: number[];

  @ApiProperty({ description: 'Array of durations for words', type: [Number] })
    wdurations!: number[];
}

export class FullReplyPlainResponseDto {
  @ApiProperty({ description: 'Text reply from assistant' })
    text!: string;

  @ApiProperty({ description: 'Generated speech audio response', type: TextToSpeechResponseDto })
    speech!: TextToSpeechResponseDto;
}

export class FullReplyTimestampedResponseDto {
  @ApiProperty({ description: 'Text reply from assistant' })
    text!: string;

  @ApiProperty({ description: 'Generated timestamped speech audio response', type: TextToSpeechTimestampedResponseDto })
    speech!: TextToSpeechTimestampedResponseDto;
}

export class WebRtcAnswerResponseDto {
  @ApiProperty({ description: 'WebRTC SDP answer' })
    sdp!: string;
}

class TurnDetectionDto {
  @ApiProperty()
    type!: string;

  @ApiProperty()
    threshold!: number;

  @ApiProperty()
    prefix_padding_ms!: number;

  @ApiProperty()
    silence_duration_ms!: number;
}

class InputAudioTranscriptionDto {
  @ApiProperty()
    model!: string;

  @ApiProperty({ nullable: true, type: String })
    language!: string | null;

  @ApiProperty()
    prompt!: string;
}

class ClientSecretDto {
  @ApiProperty()
    expires_at!: string;

  @ApiProperty()
    value!: string;
}

export class TranscriptionSessionCreateResponseDto {
  @ApiProperty()
    id!: string;

  @ApiProperty()
    object!: string;

  @ApiProperty({ type: [String] })
    modalities!: string[];

  @ApiProperty({ type: TurnDetectionDto })
    turn_detection!: TurnDetectionDto;

  @ApiProperty()
    input_audio_format!: string;

  @ApiProperty({ type: InputAudioTranscriptionDto })
    input_audio_transcription!: InputAudioTranscriptionDto;

  @ApiPropertyOptional({ nullable: true, type: ClientSecretDto })
    client_secret!: ClientSecretDto | null;

  @ApiPropertyOptional()
    expires_at?: number;
}

export class AiProviderStatusDto {
  @ApiProperty({ description: 'API Key enumerator', type: String })
    apiKey!: ApiKey;

  @ApiProperty({ description: 'Whether the API is available / configured' })
    isAvailable!: boolean;
}
