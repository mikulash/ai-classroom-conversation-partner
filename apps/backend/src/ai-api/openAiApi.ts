import { ConfigProvider } from '../utils/configProvider';
import { API_KEY } from '@repo/shared/enums/ApiKey';
import { LipSyncAudio } from '@repo/shared/types/talkingHead';
import { getOpenAIClient } from '../clients/openAi';
import { createPersonalityPrompt } from '../utils/createPersonalityPrompt';
import { getPreciseLipSyncAudio } from '../utils/lipsyncUtils';
import { TranscriptionSessionCreateResponseDto, WebRtcAnswerResponseDto } from '../dtos/replies.dto';
import {
  GetRealtimeTranscriptionParamsWithModelName,
  GetRealtimeVoiceParamsWithModelName,
  GetResponseParamsWithModelName,
  GetTimestampedAudioParamsWithModelName,
  GetTimestampedTranscriptionParamsWithModelName,
  GetTTSAudioParamsWithModelName,
  SpeechAudioResult,
} from '../types/universalApi.types';
import { HttpStatusError } from '../utils/httpStatusError';

const realtimeBaseUrl = 'https://api.openai.com/v1/realtime';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isClientSecretEnvelope(
  value: unknown,
): value is { client_secret: { value: string } } {
  return (
    isRecord(value) &&
    isRecord(value.client_secret) &&
    typeof value.client_secret.value === 'string'
  );
}

async function getRealtimeTranscriptionToken(
  params: GetRealtimeTranscriptionParamsWithModelName,
): Promise<TranscriptionSessionCreateResponseDto> {
  const apiKeysProvider = await ConfigProvider.getInstance();
  const apiKey = apiKeysProvider.getApiKey(API_KEY.OPENAI);

  const payload = {
    input_audio_format: params.inputAudioFormat,
    input_audio_transcription: {
      model: params.modelApiName,
      language: params.language.ISO639,
      prompt: '',
    },
    turn_detection: {
      type: 'server_vad',
      threshold: 0.5,
      prefix_padding_ms: 300,
      silence_duration_ms: 500,
    },
  } as const;

  const res = await fetch(`${realtimeBaseUrl}/transcription_sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new HttpStatusError(
      `OpenAI transcription session creation failed (${res.status}): ${text}`,
      res.status,
    );
  }

  return (await res.json()) as TranscriptionSessionCreateResponseDto;
}

const getRealtimeVoice = async (
  params: GetRealtimeVoiceParamsWithModelName,
  userId: string,
): Promise<WebRtcAnswerResponseDto> => {
  const configProvider = await ConfigProvider.getInstance();
  const { realtimeTranscriptionModel } = await configProvider.getModelsForUser(userId);
  if (!realtimeTranscriptionModel) {
    throw new Error('No models loaded');
  }

  const apiKey = configProvider.getApiKey(API_KEY.OPENAI);
  const { personality, language, scenario, userProfile, conversationRole } = params;
  const sessionBody: {
    model: string;
    voice?: string;
    modalities?: string[];
    instructions?: string;
    input_audio_transcription?: {
      model: string;
      language: string;
    };
    output_audio_format?: string;
    turn_detection?: {
      type: string;
      threshold: number;
      prefix_padding_ms: number;
      silence_duration_ms: number;
      create_response: boolean;
    };
  } = { model: params.modelApiName };
  if (params.openaiVoiceName.trim()) {
    sessionBody.voice = params.openaiVoiceName;
    sessionBody.modalities = ['audio', 'text'];
    sessionBody.instructions = createPersonalityPrompt({
      personality,
      conversationRole,
      language,
      scenario,
      userProfile,
    });
    sessionBody.input_audio_transcription = {
      model: realtimeTranscriptionModel.apiName,
      language: language.ISO639,
    };
    sessionBody.output_audio_format = 'pcm16';
    sessionBody.turn_detection = {
      type: 'server_vad',
      threshold: 0.5,
      prefix_padding_ms: 300,
      silence_duration_ms: 500,
      create_response: true,
    };
  }
  const sessionResp = await fetch(`${realtimeBaseUrl}/sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sessionBody),
  });
  if (!sessionResp.ok) {
    const errorPayload = await sessionResp.text();
    console.error('OpenAI session error:', errorPayload);
    throw new Error(`Failed to create Realtime session: ${sessionResp.status}`);
  }

  const ephemeralTokenResponse = await sessionResp.json();
  if (!isClientSecretEnvelope(ephemeralTokenResponse)) {
    throw new Error('OpenAI session response did not include a client secret');
  }
  const ephemeralToken = ephemeralTokenResponse.client_secret.value;

  const sdpResp = await fetch(`${realtimeBaseUrl}?model=${params.modelApiName}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ephemeralToken}`,
      'Content-Type': 'application/sdp',
    },
    body: params.sdpOffer,
  });

  const sdpAnswer = await sdpResp.text();
  if (!sdpResp.ok) {
    console.error('OpenAI SDP error:', sdpAnswer);
    throw new Error(`Failed to get SDP answer: ${sdpResp.status}`);
  }

  return { sdp: sdpAnswer };
};

const getResponse = async ({
  inputText,
  previousMessages,
  personality,
  conversationRole,
  language,
  scenario,
  modelApiName,
  userProfile,
}: GetResponseParamsWithModelName): Promise<string> => {
  const openai = await getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: modelApiName,
    messages: [
      {
        role: 'system',
        content: createPersonalityPrompt({
          personality,
          conversationRole,
          language,
          scenario,
          userProfile,
        }),
      },
      ...previousMessages,
      { role: 'user', content: inputText },
    ],
  });

  return completion.choices[0]?.message.content ?? '';
};

const getTextToSpeech = async (
  params: GetTTSAudioParamsWithModelName,
): Promise<SpeechAudioResult> => {
  const {
    inputMessage,
    personality,
    language,
    responseFormat,
    modelApiName,
    sampleRate,
  } = params;

  try {
    const openai = await getOpenAIClient();
    const speechResponse = await openai.audio.speech.create({
      model: modelApiName,
      voice: personality.openaiVoiceName,
      input: inputMessage,
      instructions: (personality.voiceInstructions ?? '') + `Speak in ${language.ENGLISH_NAME}.`,
      response_format: responseFormat,
    });

    const arrayBuffer = await speechResponse.arrayBuffer();
    return {
      buffer: arrayBuffer,
      sampleRate: sampleRate, // https://platform.openai.com/docs/guides/text-to-speech
    };
  } catch (error) {
    console.error('Error converting text to speech using OpenAI:', error);

    return {
      buffer: new ArrayBuffer(0),
      sampleRate: 0,
    };
  }
};

async function getTextToSpeechTimestamped(
  params: GetTimestampedAudioParamsWithModelName,
  userId: string,
): Promise<LipSyncAudio> {
  const { inputMessage, personality, language, modelApiName, sampleRate } = params;
  const audioResponse = await getTextToSpeech({
    inputMessage,
    personality,
    language,
    responseFormat: 'pcm',
    modelApiName: modelApiName,
    sampleRate: sampleRate,
  });

  const lipSyncAudio = await getPreciseLipSyncAudio(
    audioResponse.buffer,
    audioResponse.sampleRate,
    2,
    1,
    userId,
    language,
  );

  return lipSyncAudio;
}

const createTimestampedTranscription = async (
  params: GetTimestampedTranscriptionParamsWithModelName,
) => {
  const openai = await getOpenAIClient();

  return openai.audio.transcriptions.create({
    file: params.audioFile,
    model: params.modelApiName,
    language: params.language.ISO639,
    response_format: 'verbose_json',
    timestamp_granularities: ['word'],
  });
};

export const openAiApi = {
  getRealtimeTranscriptionToken,
  getRealtimeVoice,
  getResponse,
  getTextToSpeech,
  getTextToSpeechTimestamped,
  createTimestampedTranscription,
};
