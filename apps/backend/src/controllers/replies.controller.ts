import { All, Controller, Get, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { universalApi } from '../ai-api/universalApi';
import type {
  ErrorResponse,
  FullReplyPlainResponse,
  FullReplyTimestampedResponse,
  TextToSpeechResponse,
  TextToSpeechTimestampedResponse,
  TranscriptionSessionCreateResponse,
  WebRtcAnswerResponse,
} from '@repo/shared/types/figurantClient.types';
import { AuthGuard } from '../common/guards/auth.guard';
import { getUserId } from '../utils/getUserId';
import { API_KEY } from '@repo/shared/enums/ApiKey';
import type { AiProviderStatus } from '@repo/shared/types/apiKeyStatus';
import {
  GenerateReplyDto,
  TextToSpeechDto,
  TextToSpeechTimestampedDto,
  RealtimeVoiceDto,
  RealtimeTranscriptionDto,
} from '../dtos/replies.dto';

@ApiTags('replies')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('api/replies')
export class RepliesController {
    @All()
    @ApiOkResponse({ description: 'Health check', type: Object })
  healthCheck(@Res() res: Response): void {
    res.status(200).json({ message: 'Hello from replies!' });
  }

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
    @ApiOkResponse({ description: 'Speech audio in Base64', type: Object })
    async generateSpeech(
        @Body() body: TextToSpeechDto,
        @Req() req: Request,
        @Res() res: Response<TextToSpeechResponse | ErrorResponse>,
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

        const payload: TextToSpeechResponse = {
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
    @ApiOkResponse({ description: 'Timestamped audio with Base64 encoding', type: Object })
    async generateTimestampedSpeech(
        @Body() body: TextToSpeechTimestampedDto,
        @Req() req: Request,
        @Res() res: Response<TextToSpeechTimestampedResponse | ErrorResponse>,
    ): Promise<void> {
      try {
        const { inputMessage, personality, language } = body;
        const userId = getUserId(req);

        const speechAudio = await universalApi.getTimestampedSpeechAudio({
          inputMessage,
          personality: personality as never,
          language: language as never,
        }, userId);

        const speechAudioForWire = {
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
    @ApiOkResponse({ description: 'Text and TTS audio', type: Object })
    async generateFullPlain(
        @Body() body: GenerateReplyDto,
        @Req() req: Request,
        @Res() res: Response<FullReplyPlainResponse | ErrorResponse>,
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

        const speech: TextToSpeechResponse = {
          audioBase64: Buffer.from(new Uint8Array(result.buffer)).toString('base64'),
          sampleRate: result.sampleRate,
        };

        const payload: FullReplyPlainResponse = { text, speech };

        res.json(payload);
      } catch (error) {
        console.error('Error generating full reply:', error);
        res.status(500).json({ message: 'Failed to generate reply' });
      }
    }

    @Post('full/timestamped')
    @ApiBody({ type: GenerateReplyDto })
    @ApiOkResponse({ description: 'Text and timestamped speech', type: Object })
    async generateFullTimestamped(
        @Body() body: GenerateReplyDto,
        @Req() req: Request,
        @Res() res: Response<FullReplyTimestampedResponse | ErrorResponse>,
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

        const speech: TextToSpeechTimestampedResponse = {
          ...result,
          audio: result.audio.map((ab) => Buffer.from(new Uint8Array(ab)).toString('base64')),
        };

        const payload: FullReplyTimestampedResponse = { text, speech };

        res.json(payload);
      } catch (error) {
        console.error('Error generating full reply:', error);
        res.status(500).json({ message: 'Failed to generate reply' });
      }
    }

    @Post('speech/realtime')
    @ApiBody({ type: RealtimeVoiceDto })
    @ApiOkResponse({ description: 'WebRTC answer', type: Object })
    async realtimeVoice(
        @Body() body: RealtimeVoiceDto,
        @Req() req: Request,
        @Res() res: Response<WebRtcAnswerResponse | ErrorResponse>,
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
    @ApiOkResponse({ description: 'Transcription session details', type: Object })
    async realtimeTranscription(
        @Body() body: RealtimeTranscriptionDto,
        @Req() req: Request,
        @Res() res: Response<TranscriptionSessionCreateResponse | ErrorResponse>,
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
    @ApiOkResponse({ description: 'List of providers with availability status', type: Object })
    getProviders(@Res() res: Response<AiProviderStatus[]>): void {
      const providers: AiProviderStatus[] = Object.entries(API_KEY).map(([, envKey]) => ({
        apiKey: envKey,
        isAvailable: Boolean(process.env[envKey]),
      }));

      res.status(200).json(providers);
    }
}
