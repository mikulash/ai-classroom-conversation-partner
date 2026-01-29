import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

// Using simple types since the actual request types are defined in @repo/shared
// and the controller will handle proper typing through existing function signatures

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
