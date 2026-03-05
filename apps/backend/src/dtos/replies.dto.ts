import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsIn, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

import type { ApiKey } from '@repo/shared/enums/ApiKey';

// ============================================================
// Nested input DTOs (personality / scenario / profile shapes
// sent by the frontend as part of reply-generation requests)
// ============================================================

export class ReplyPersonalityDto {
  @ApiProperty({ description: 'Personality ID' })
    id!: number;

  @ApiProperty({ description: 'Personality name' })
    name!: string;

  @ApiPropertyOptional({ description: 'Age', nullable: true, type: Number })
    age?: number | null;

  @ApiPropertyOptional({ description: 'Sex', nullable: true, type: String })
    sex?: string | null;

  @ApiPropertyOptional({ description: 'Gender', type: String })
    gender?: string;

  @ApiPropertyOptional({ description: 'OpenAI voice name', type: String })
    openaiVoiceName?: string;

  @ApiPropertyOptional({ description: 'ElevenLabs voice ID', nullable: true, type: String })
    elevenlabsVoiceId?: string | null;

  @ApiPropertyOptional({ description: 'Voice instructions', nullable: true, type: String })
    voiceInstructions?: string | null;

  @ApiPropertyOptional({ description: 'Personality description in English', type: String })
    personalityDescriptionEn?: string;

  @ApiPropertyOptional({ description: 'Personality description in Czech', type: String })
    personalityDescriptionCs?: string;

  @ApiPropertyOptional({ description: 'Problem summary in English', type: String })
    problemSummaryEn?: string;

  @ApiPropertyOptional({ description: 'Problem summary in Czech', type: String })
    problemSummaryCs?: string;

  @ApiPropertyOptional({ description: 'Avatar URL', nullable: true, type: String })
    avatarUrl?: string | null;

  @ApiPropertyOptional({ description: 'Is hidden flag', type: Boolean })
    isHidden?: boolean;
}

export class ReplyScenarioDto {
  @ApiPropertyOptional({ description: 'Scenario ID', type: Number })
    id?: number;

  @ApiPropertyOptional({ description: 'Involved personality ID', type: Number })
    involvedPersonalityId?: number;

  @ApiPropertyOptional({ description: 'Setting in English', type: String })
    settingEn?: string;

  @ApiPropertyOptional({ description: 'Setting in Czech', type: String })
    settingCs?: string;

  @ApiPropertyOptional({ description: 'Situation description in English', type: String })
    situationDescriptionEn?: string;

  @ApiPropertyOptional({ description: 'Situation description in Czech', type: String })
    situationDescriptionCs?: string;
}

export class ReplyProfileDto {
  @ApiProperty({ description: 'User ID' })
    id!: string;

  @ApiPropertyOptional({ description: 'Full name', type: String })
    fullName?: string;

  @ApiPropertyOptional({ description: 'Gender', type: String })
    gender?: string;

  @ApiPropertyOptional({ description: 'Conversation role', type: String })
    conversationRole?: string;

  @ApiPropertyOptional({ description: 'Bio', type: String })
    bio?: string;

  @ApiPropertyOptional({ description: 'Email address', type: String })
    email?: string;

  @ApiPropertyOptional({ description: 'User role', type: String })
    userRole?: string;
}

// ============================================================
// Request DTOs
// ============================================================

export class GenerateReplyDto {
  @ApiProperty({ description: 'User input text' })
  @IsString()
    inputText!: string;

  @ApiPropertyOptional({ description: 'Previous conversation messages', type: [Object] })
  @IsOptional()
  @IsArray()
    previousMessages?: unknown[];

  @ApiPropertyOptional({ description: 'Personality configuration', type: ReplyPersonalityDto })
  @IsOptional()
  @IsObject()
    personality?: ReplyPersonalityDto;

  @ApiPropertyOptional({ description: 'Conversation role (translated name string)', type: String })
  @IsOptional()
  @IsString()
    conversationRole?: string;

  @ApiPropertyOptional({ description: 'Language setting', type: String })
  @IsOptional()
  @IsString()
    language?: string;

  @ApiPropertyOptional({ description: 'Scenario configuration', type: ReplyScenarioDto, nullable: true })
  @IsOptional()
  @IsObject()
    scenario?: ReplyScenarioDto | null;

  @ApiPropertyOptional({ description: 'User profile information', type: ReplyProfileDto })
  @IsOptional()
  @IsObject()
    userProfile?: ReplyProfileDto;
}

export class TextToSpeechDto {
  @ApiProperty({ description: 'Text to convert to speech' })
  @IsString()
    inputMessage!: string;

  @ApiPropertyOptional({ description: 'Personality for voice settings', type: ReplyPersonalityDto })
  @IsOptional()
  @IsObject()
    personality?: ReplyPersonalityDto;

  @ApiPropertyOptional({ description: 'Language setting', type: String })
  @IsOptional()
  @IsString()
    language?: string;

  @ApiPropertyOptional({ description: 'Audio response format', type: String, enum: ['pcm', 'mp3'] })
  @IsOptional()
  @IsString()
  @IsIn(['pcm', 'mp3'])
    responseFormat?: 'pcm' | 'mp3';
}

export class TextToSpeechTimestampedDto {
  @ApiProperty({ description: 'Text to convert to speech' })
  @IsString()
    inputMessage!: string;

  @ApiPropertyOptional({ description: 'Personality for voice settings', type: ReplyPersonalityDto })
  @IsOptional()
  @IsObject()
    personality?: ReplyPersonalityDto;

  @ApiPropertyOptional({ description: 'Language setting', type: String })
  @IsOptional()
  @IsString()
    language?: string;
}

export class RealtimeVoiceDto {
  @ApiProperty({ description: 'SDP offer for WebRTC' })
  @IsString()
    sdpOffer!: string;

  @ApiPropertyOptional({ description: 'Personality configuration', type: ReplyPersonalityDto })
  @IsOptional()
  @IsObject()
    personality?: ReplyPersonalityDto;

  @ApiPropertyOptional({ description: 'Conversation role (translated name string)', type: String })
  @IsOptional()
  @IsString()
    conversationRole?: string;

  @ApiPropertyOptional({ description: 'Language setting', type: String })
  @IsOptional()
  @IsString()
    language?: string;

  @ApiPropertyOptional({ description: 'Scenario configuration', type: ReplyScenarioDto, nullable: true })
  @IsOptional()
  @IsObject()
    scenario?: ReplyScenarioDto | null;

  @ApiPropertyOptional({ description: 'User profile information', type: ReplyProfileDto })
  @IsOptional()
  @IsObject()
    userProfile?: ReplyProfileDto;
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
  @IsNumber()
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

