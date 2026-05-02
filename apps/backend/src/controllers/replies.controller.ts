import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { RateLimit } from '../common/decorators/rate-limit.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  GenerateReplyDto,
  TextToSpeechDto,
  TextToSpeechTimestampedDto,
  RealtimeVoiceDto,
  RealtimeTranscriptionDto,
  TextToSpeechResponseDto,
  TextToSpeechTimestampedResponseDto,
  FullReplyPlainResponseDto,
  FullReplyTimestampedResponseDto,
  WebRtcAnswerResponseDto,
  TranscriptionSessionCreateResponseDto,
  AiProviderStatusDto,
} from '../dtos/replies.dto';
import { RepliesService } from '../services/replies.service';
import type { JWTPayload } from '../utils/auth';

@ApiTags('replies')
@ApiBearerAuth()
@UseGuards(AuthGuard, RateLimitGuard)
@RateLimit({ limit: 120, windowMs: 60 * 1000 })
@Controller('api/replies')
export class RepliesController {
  constructor(private readonly repliesService: RepliesService) {}

  @Post('text')
  @HttpCode(200)
  @ApiBody({ type: GenerateReplyDto })
  @ApiOkResponse({ description: 'AI-generated text response', type: String })
  generateText(
    @Body() body: GenerateReplyDto,
    @CurrentUser() user: JWTPayload,
  ): Promise<string> {
    return this.repliesService.generateText(body, user);
  }

  @Post('speech')
  @HttpCode(200)
  @ApiBody({ type: TextToSpeechDto })
  @ApiOkResponse({ description: 'Speech audio in Base64', type: TextToSpeechResponseDto })
  generateSpeech(
    @Body() body: TextToSpeechDto,
    @CurrentUser() user: JWTPayload,
  ): Promise<TextToSpeechResponseDto> {
    return this.repliesService.generateSpeech(body, user);
  }

  @Post('speech/timestamped')
  @HttpCode(200)
  @ApiBody({ type: TextToSpeechTimestampedDto })
  @ApiOkResponse({ description: 'Timestamped audio with Base64 encoding', type: TextToSpeechTimestampedResponseDto })
  generateTimestampedSpeech(
    @Body() body: TextToSpeechTimestampedDto,
    @CurrentUser() user: JWTPayload,
  ): Promise<TextToSpeechTimestampedResponseDto> {
    return this.repliesService.generateTimestampedSpeech(body, user);
  }

  @Post('full/plain')
  @HttpCode(200)
  @ApiBody({ type: GenerateReplyDto })
  @ApiOkResponse({ description: 'Text and TTS audio', type: FullReplyPlainResponseDto })
  generateFullPlain(
    @Body() body: GenerateReplyDto,
    @CurrentUser() user: JWTPayload,
  ): Promise<FullReplyPlainResponseDto> {
    return this.repliesService.generateFullPlain(body, user);
  }

  @Post('full/timestamped')
  @HttpCode(200)
  @ApiBody({ type: GenerateReplyDto })
  @ApiOkResponse({ description: 'Text and timestamped speech', type: FullReplyTimestampedResponseDto })
  generateFullTimestamped(
    @Body() body: GenerateReplyDto,
    @CurrentUser() user: JWTPayload,
  ): Promise<FullReplyTimestampedResponseDto> {
    return this.repliesService.generateFullTimestamped(body, user);
  }

  @Post('speech/realtime')
  @HttpCode(200)
  @ApiBody({ type: RealtimeVoiceDto })
  @ApiOkResponse({ description: 'WebRTC answer', type: WebRtcAnswerResponseDto })
  realtimeVoice(
    @Body() body: RealtimeVoiceDto,
    @CurrentUser() user: JWTPayload,
  ): Promise<WebRtcAnswerResponseDto> {
    return this.repliesService.realtimeVoice(body, user);
  }

  @Post('transcription/realtime')
  @HttpCode(200)
  @ApiBody({ type: RealtimeTranscriptionDto })
  @ApiOkResponse({ description: 'Transcription session details', type: TranscriptionSessionCreateResponseDto })
  realtimeTranscription(
    @Body() body: RealtimeTranscriptionDto,
    @CurrentUser() user: JWTPayload,
  ): Promise<TranscriptionSessionCreateResponseDto> {
    return this.repliesService.realtimeTranscription(body, user);
  }

  @Get('providers')
  @ApiOkResponse({ description: 'List of providers with availability status', type: [AiProviderStatusDto] })
  getProviders(): AiProviderStatusDto[] {
    return this.repliesService.getProviders();
  }
}
