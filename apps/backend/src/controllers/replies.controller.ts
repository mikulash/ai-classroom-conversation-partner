import { Controller, Get, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { universalApi } from '../ai-api/universalApi';
import type {
  ErrorResponse,
} from '@repo/shared/types/figurantClient.types';
import { AuthGuard } from '../common/guards/auth.guard';
import { getUserId } from '../utils/getUserId';
import { API_KEY } from '@repo/shared/enums/ApiKey';
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

@ApiTags('replies')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('api/replies')
export class RepliesController {
  @Post('text')
  @ApiBody({ type: GenerateReplyDto })
  @ApiOkResponse({ description: 'AI-generated text response', type: String })
  async generateText(
    @Body() body: GenerateReplyDto,
    @Req() req: Request,
    @Res() res: Response<string | ErrorResponse>,
  ): Promise<void> {
    try {
      const { inputText, previousMessages, personality, conversationRole, language, scenario, userProfile } = body;
      const userId = getUserId(req);

      const response = await universalApi.getResponse({
        inputText,
        previousMessages: previousMessages as never[],
        personality: personality as never,
        conversationRole: conversationRole as never,
        language: language as never,
        scenario: scenario as never,
        userProfile: userProfile as never,
      }, userId);

      res.json(response);
    } catch (error) {
      console.error('Error getting response:', error);
      res.status(500).json({ message: 'Failed to get response' });
    }
  }

  @Post('speech')
  @ApiBody({ type: TextToSpeechDto })
  @ApiOkResponse({ description: 'Speech audio in Base64', type: TextToSpeechResponseDto })
  async generateSpeech(
    @Body() body: TextToSpeechDto,
    @Req() req: Request,
    @Res() res: Response<TextToSpeechResponseDto | ErrorResponse>,
  ): Promise<void> {
    try {
      const { inputMessage, personality, language, responseFormat } = body;
      const userId = getUserId(req);

      const result = await universalApi.getSpeechAudio({
        inputMessage,
        personality: personality as never,
        language: language as never,
        responseFormat: (responseFormat ?? 'pcm') as 'pcm' | 'mp3',
      }, userId);

      const audioBase64 = Buffer
        .from(new Uint8Array(result.buffer))
        .toString('base64');

      const payload: TextToSpeechResponseDto = {
        audioBase64,
        sampleRate: result.sampleRate,
      };

      res.json(payload);
    } catch (error) {
      console.error('Error getting speech:', error);
      res.status(500).json({ message: 'Failed to get response' });
    }
  }

  @Post('speech/timestamped')
  @ApiBody({ type: TextToSpeechTimestampedDto })
  @ApiOkResponse({ description: 'Timestamped audio with Base64 encoding', type: TextToSpeechTimestampedResponseDto })
  async generateTimestampedSpeech(
    @Body() body: TextToSpeechTimestampedDto,
    @Req() req: Request,
    @Res() res: Response<TextToSpeechTimestampedResponseDto | ErrorResponse>,
  ): Promise<void> {
    try {
      const { inputMessage, personality, language } = body;
      const userId = getUserId(req);

      const speechAudio = await universalApi.getTimestampedSpeechAudio({
        inputMessage,
        personality: personality as never,
        language: language as never,
      }, userId);

      const speechAudioForWire: TextToSpeechTimestampedResponseDto = {
        ...speechAudio,
        audio: speechAudio.audio.map((ab) =>
          Buffer.from(new Uint8Array(ab)).toString('base64'),
        ),
      };

      res.json(speechAudioForWire);
    } catch (error) {
      console.error('Error getting speech:', error);
      res.status(500).json({ message: 'Failed to get response' });
    }
  }

  @Post('full/plain')
  @ApiBody({ type: GenerateReplyDto })
  @ApiOkResponse({ description: 'Text and TTS audio', type: FullReplyPlainResponseDto })
  async generateFullPlain(
    @Body() body: GenerateReplyDto,
    @Req() req: Request,
    @Res() res: Response<FullReplyPlainResponseDto | ErrorResponse>,
  ): Promise<void> {
    try {
      const userId = getUserId(req);

      const text = await universalApi.getResponse({
        inputText: body.inputText,
        previousMessages: body.previousMessages as never[],
        personality: body.personality as never,
        conversationRole: body.conversationRole as never,
        language: body.language as never,
        scenario: body.scenario as never,
        userProfile: body.userProfile as never,
      }, userId);

      const result = await universalApi.getSpeechAudio({
        inputMessage: text,
        personality: body.personality as never,
        language: body.language as never,
        responseFormat: 'pcm',
      }, userId);

      const speech: TextToSpeechResponseDto = {
        audioBase64: Buffer.from(new Uint8Array(result.buffer)).toString('base64'),
        sampleRate: result.sampleRate,
      };

      const payload: FullReplyPlainResponseDto = { text, speech };

      res.json(payload);
    } catch (error) {
      console.error('Error generating full reply:', error);
      res.status(500).json({ message: 'Failed to generate reply' });
    }
  }

  @Post('full/timestamped')
  @ApiBody({ type: GenerateReplyDto })
  @ApiOkResponse({ description: 'Text and timestamped speech', type: FullReplyTimestampedResponseDto })
  async generateFullTimestamped(
    @Body() body: GenerateReplyDto,
    @Req() req: Request,
    @Res() res: Response<FullReplyTimestampedResponseDto | ErrorResponse>,
  ): Promise<void> {
    try {
      const userId = getUserId(req);

      const text = await universalApi.getResponse({
        inputText: body.inputText,
        previousMessages: body.previousMessages as never[],
        personality: body.personality as never,
        conversationRole: body.conversationRole as never,
        language: body.language as never,
        scenario: body.scenario as never,
        userProfile: body.userProfile as never,
      }, userId);

      const result = await universalApi.getTimestampedSpeechAudio({
        inputMessage: text,
        personality: body.personality as never,
        language: body.language as never,
      }, userId);

      const speech: TextToSpeechTimestampedResponseDto = {
        ...result,
        audio: result.audio.map((ab) => Buffer.from(new Uint8Array(ab)).toString('base64')),
      };

      const payload: FullReplyTimestampedResponseDto = { text, speech };

      res.json(payload);
    } catch (error) {
      console.error('Error generating full reply:', error);
      res.status(500).json({ message: 'Failed to generate reply' });
    }
  }

  @Post('speech/realtime')
  @ApiBody({ type: RealtimeVoiceDto })
  @ApiOkResponse({ description: 'WebRTC answer', type: WebRtcAnswerResponseDto })
  async realtimeVoice(
    @Body() body: RealtimeVoiceDto,
    @Req() req: Request,
    @Res() res: Response<WebRtcAnswerResponseDto | ErrorResponse>,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const answer = await universalApi.getRealtimeVoice({
        openai_voice_name: '',
        personality: body.personality as never,
        conversationRole: body.conversationRole as never,
        language: body.language as never,
        scenario: body.scenario as never,
        userProfile: body.userProfile as never,
        sdp_offer: body.sdpOffer,
      }, userId);
      res.json(answer);
    } catch (error) {
      console.error('Error getting speech:', error);
      res.status(500).json({ message: 'Failed to get response' });
    }
  }

  @Post('transcription/realtime')
  @ApiBody({ type: RealtimeTranscriptionDto })
  @ApiOkResponse({ description: 'Transcription session details', type: TranscriptionSessionCreateResponseDto })
  async realtimeTranscription(
    @Body() body: RealtimeTranscriptionDto,
    @Req() req: Request,
    @Res() res: Response<TranscriptionSessionCreateResponseDto | ErrorResponse>,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const transcriptionSessionCreateResponse = await universalApi.getRealtimeTranscription({
        input_audio_format: 'pcm16',
        language: body.language as never,
      }, userId);
      res.json(transcriptionSessionCreateResponse);
    } catch (err: unknown) {
      console.error(err);
      let status = 500;
      if (typeof err === 'object' && err !== null && 'status' in err && typeof (err as {
        status: unknown
      }).status === 'number') {
        status = (err as { status: number }).status;
      }
      const msg = status === 500 ? 'Internal server error' : 'OpenAI transcription session creation failed';

      res.status(status).json({ message: msg, statusCode: status });
    }
  }

  @Get('providers')
  @ApiOkResponse({ description: 'List of providers with availability status', type: [AiProviderStatusDto] })
  getProviders(@Res() res: Response<AiProviderStatusDto[]>): void {
    const providers: AiProviderStatusDto[] = Object.entries(API_KEY).map(([, envKey]) => ({
      apiKey: envKey,
      isAvailable: Boolean(process.env[envKey]),
    }));

    res.status(200).json(providers);
  }
}
