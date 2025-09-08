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

// Health check endpoint
router.all('/', (req, res) => {
  res.status(200).json({ message: 'Hello from replies!' });
});

// Generate AI text response from user input and conversation context
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

// Convert text to speech audio (TTS) with specified format and voice settings
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

// Generate timestamped speech audio with word-level timing for lip-sync animation
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

// Get complete response with both AI-generated text and standard audio
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

// Get complete response with both AI-generated text and timestamped audio for lip-sync
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

// Establish real-time WebRTC voice connection for live speech interaction
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

// Create real-time transcription session for live speech-to-text conversion
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

// Check the availability status of required API keys (OpenAI, ElevenLabs, Claude, Grok)
router.get(
  '/providers',
  (req: Request, res: Response<AiProviderStatus[]>) => {
    const providers: AiProviderStatus[] = Object.entries(API_KEY).map(([, envKey]) => ({
      apiKey: envKey, // KEY as in KEY:VALUE, not the exact secret key
      available: Boolean(process.env[envKey]),
    }));

    res.status(200).json(providers);
  },
);

export default router;
