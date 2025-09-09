import { Request, Response, Router } from 'express';
import { getSpeechAudio } from '../api_universal/getSpeechAudio';
import { ErrorResponse } from '@repo/shared/types/api/errorResponse';
import { GetTimestampedAudioParams } from '@repo/shared/types/timestampedSpeech';
import { LipSyncAudioWebTransfer } from '@repo/shared/types/talkingHead';
import { getTimestampedSpeechAudio } from '../api_universal/getTimestampedSpeech';
import {
  AvatarReplyRequest,
  FullReplyPlainResponse,
  FullReplyTimestampedResponse,
} from '@repo/shared/types/api/avatarReply';
import { getResponse } from '../api_universal/getResponse';
import {
  GetRealtimeTranscriptionParams,
  GetRealtimeVoiceParams,
  GetTTSAudioParams,
  GetTTSAudioResponseForWebTransfer,
} from '@repo/shared/types/apiClient';
import { TranscriptionSessionCreateResponse, WebRtcAnswerResponse } from '@repo/shared/types/api/webRTC';
import { ParamsDictionary } from 'express-serve-static-core';
import { verifySupabaseAuth } from '../middleware/verifySupabaseAuth';
import { getUserId } from '../utils/getUserId';
import { getRealtimeTranscription } from '../api_universal/getRealtimeTranscription';
import { getRealtimeVoice } from '../api_universal/getRealtimeVoice';
import { API_KEY } from '@repo/shared/enums/ApiKey';
import { AiProviderStatus } from '@repo/shared/types/apiKeyStatus';

const router = Router({ mergeParams: true });

// Apply authentication middleware to all routes
router.use(verifySupabaseAuth);

/**
 * Health check endpoint.
 *
 * @route GET/POST /
 * @returns {object} 200 - A simple hello message
 */
router.all('/', (req, res) => {
  res.status(200).json({ message: 'Hello from replies!' });
});

/**
 * Generate AI text response from user input and conversation context.
 *
 * @route POST /text
 * @param {AvatarReplyRequest} req.body - Request containing input text and conversation context
 * @returns {string|ErrorResponse} 200 - AI-generated text response
 */
router.post(
  '/text',
  async (
    req: Request<ParamsDictionary, string | ErrorResponse, AvatarReplyRequest>,
    res: Response<string | ErrorResponse>,
  ) => {
    try {
      const { input_text, previousMessages, personality, conversationRole, language, scenario, userProfile } =
                req.body;

      const userId = await getUserId(req);

      const response = await getResponse({
        input_text,
        previousMessages,
        personality,
        conversationRole,
        language,
        scenario,
        userProfile,
      }, userId);

      res.json(response);
    } catch (error) {
      console.error('Error getting response:', error);
      res.status(500).json({ message: 'Failed to get response' });
    }
  },
);

/**
 * Generates audio from the text input (TTS) with specified format and voice settings.
 *
 * @route POST /speech
 * @param {GetTTSAudioParams} req.body - TTS request parameters
 * @returns {GetTTSAudioResponseForWebTransfer|ErrorResponse} 200 - Speech audio in Base64
 */
router.post(
  '/speech',
  async (
    req: Request<ParamsDictionary, GetTTSAudioResponseForWebTransfer | ErrorResponse, GetTTSAudioParams>,
    res: Response<GetTTSAudioResponseForWebTransfer | ErrorResponse>,
  ) => {
    try {
      const { inputMessage, personality, language, response_format } = req.body;
      const userId = await getUserId(req);

      const result = await getSpeechAudio({
        inputMessage,
        personality,
        language,
        response_format,
      }, userId);

      const audioBase64 = Buffer
        .from(new Uint8Array(result.buffer))
        .toString('base64');

      const payload: GetTTSAudioResponseForWebTransfer = {
        audioBase64,
        sampleRate: result.sampleRate,
      };

      res.json(payload);
    } catch (error) {
      console.error('Error getting speech:', error);
      res.status(500).json({ message: 'Failed to get response' });
    }
  },
);

/**
 * Generate timestamped speech audio with word-level timing necessary for lip-sync animation.
 *
 * @route POST /speech/timestamped
 * @param {GetTimestampedAudioParams} req.body - Request parameters
 * @returns {LipSyncAudioWebTransfer|ErrorResponse} 200 - Timestamped audio with Base64 encoding
 */
router.post(
  '/speech/timestamped',
  async (
    req: Request<ParamsDictionary, LipSyncAudioWebTransfer | ErrorResponse, GetTimestampedAudioParams>,
    res: Response<LipSyncAudioWebTransfer | ErrorResponse>,
  ) => {
    try {
      const { inputMessage, personality, language } = req.body;
      const userId = await getUserId(req);

      const speechAudio = await getTimestampedSpeechAudio({
        inputMessage,
        personality,
        language,
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
  },
);

/**
 * Get a complete response with both AI-generated text and standard audio.
 * Basically a combination of endpoints '/text' and '/speech'
 *
 * @route POST /full/plain
 * @param {AvatarReplyRequest} req.body - Request containing input text and context
 * @returns {FullReplyPlainResponse|ErrorResponse} 200 - Text and TTS audio
 */
router.post(
  '/full/plain',
  async (
    req: Request<ParamsDictionary, FullReplyPlainResponse | ErrorResponse, AvatarReplyRequest>,
    res: Response<FullReplyPlainResponse | ErrorResponse>,
  ) => {
    try {
      const userId = await getUserId(req);

      const text = await getResponse(req.body, userId);

      const result = await getSpeechAudio({
        inputMessage: text,
        personality: req.body.personality,
        language: req.body.language,
        response_format: 'pcm',
      }, userId);

      const speech: GetTTSAudioResponseForWebTransfer = {
        audioBase64: Buffer.from(new Uint8Array(result.buffer)).toString('base64'),
        sampleRate: result.sampleRate,
      } satisfies GetTTSAudioResponseForWebTransfer;

      const payload: FullReplyPlainResponse = { text, speech };

      res.json(payload);
    } catch (error) {
      console.error('Error generating full reply:', error);
      res.status(500).json({ message: 'Failed to generate reply' });
    }
  },
);

/**
 * Get a complete response with both AI-generated text and timestamped audio for lip-sync.
 * Basically a combination of endpoints '/text' and '/speech/timestamped'
 * @route POST /full/timestamped
 * @param {AvatarReplyRequest} req.body - Request containing input text and context
 * @returns {FullReplyTimestampedResponse|ErrorResponse} 200 - Text and timestamped speech
 */
router.post(
  '/full/timestamped',
  async (
    req: Request<ParamsDictionary, FullReplyTimestampedResponse | ErrorResponse, AvatarReplyRequest>,
    res: Response<FullReplyTimestampedResponse | ErrorResponse>,
  ) => {
    try {
      const userId = await getUserId(req);

      const text = await getResponse(req.body, userId);

      const result = await getTimestampedSpeechAudio({
        inputMessage: text,
        personality: req.body.personality,
        language: req.body.language,
      }, userId);

      const speech: LipSyncAudioWebTransfer = {
        ...result,
        audio: result.audio.map((ab) => Buffer.from(new Uint8Array(ab)).toString('base64')),
      } satisfies LipSyncAudioWebTransfer;

      const payload: FullReplyTimestampedResponse = { text, speech };

      res.json(payload);
    } catch (error) {
      console.error('Error generating full reply:', error);
      res.status(500).json({ message: 'Failed to generate reply' });
    }
  },
);

/**
 * Establish real-time WebRTC voice connection for live speech interaction.
 *
 * @route POST /speech/realtime
 * @param {GetRealtimeVoiceParams} req.body - WebRTC session parameters
 * @returns {WebRtcAnswerResponse|ErrorResponse} 200 - WebRTC answer
 */
router.post(
  '/speech/realtime',
  async (
    req: Request<ParamsDictionary, WebRtcAnswerResponse | ErrorResponse, GetRealtimeVoiceParams>,
    res: Response<WebRtcAnswerResponse | ErrorResponse>,
  ) => {
    try {
      const userId = await getUserId(req);
      const answer = await getRealtimeVoice(req.body, userId);
      res.json(answer);
    } catch (error) {
      console.error('Error getting speech:', error);
      res.status(500).json({ message: 'Failed to get response' });
    }
  },
);

/**
 * Create a real-time transcription session for live speech-to-text conversion.
 *
 * @route POST /transcription/realtime
 * @param {GetRealtimeTranscriptionParams} req.body - Transcription session parameters
 * @returns {TranscriptionSessionCreateResponse|ErrorResponse} 200 - Transcription session details
 */
router.post(
  '/transcription/realtime',
  async (
    req: Request<
            ParamsDictionary,
            TranscriptionSessionCreateResponse | ErrorResponse,
            GetRealtimeTranscriptionParams
        >,
    res: Response<TranscriptionSessionCreateResponse | ErrorResponse>,
  ) => {
    try {
      const userId = await getUserId(req);
      const transcriptionSessionCreateResponse = await getRealtimeTranscription(req.body, userId);
      console.log('Transcription session created:', transcriptionSessionCreateResponse);
      res.json(transcriptionSessionCreateResponse);
    } catch (err: any) {
      console.error(err);
      const status = typeof err.status === 'number' ? err.status : 500;
      const msg =
                status === 500 ?
                  'Internal server error' :
                  'OpenAI transcription session creation failed';
      res.status(status).json({ message: msg, statusCode: status });
    }
  },
);

/**
 * Check the availability status of required API keys.
 * (OpenAI, ElevenLabs, Claude, Grok)
 *
 * @route GET /providers
 * @returns {AiProviderStatus[]} 200 - List of providers with availability status
 */
router.get(
  '/providers',
  (req: Request, res: Response<AiProviderStatus[]>) => {
    const providers: AiProviderStatus[] = Object.entries(API_KEY).map(([, envKey]) => ({
      apiKey: envKey, // KEY name, not the actual secret
      available: Boolean(process.env[envKey]),
    }));

    res.status(200).json(providers);
  },
);

export default router;
