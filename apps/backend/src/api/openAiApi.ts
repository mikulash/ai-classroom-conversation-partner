import { ConfigProvider } from '../utils/configProvider';
import { API_KEY } from '@repo/shared/enums/ApiKey';
import {
  TranscriptionSessionCreateResponse,
  EphemeralTokenResponse,
  WebRtcAnswerResponse,
} from '@repo/shared/types/api/webRTC';
import {
  GetRealtimeTranscriptionParamsWithModelName,
  GetRealtimeVoiceParamsWithModelName,
  GetResponseParamsWithModelName,
  GetTTSAudioParamsWithModelName,
  GetTTSAudioResponse,
  GetTimestampedTranscriptionParamsWithModelName,
} from '@repo/shared/types/apiClient';
import { GetTimestampedAudioParamsWithModelName } from '@repo/shared/types/timestampedSpeech';
import { LipSyncAudio } from '@repo/shared/types/talkingHead';
import { getOpenAIClient } from '../clients/clientOpenAi';
import { createPersonalityPrompt } from '@repo/shared/utils/createPersonalityPrompt';
import { getPreciseLipSyncAudio } from '../utils/lipsyncUtils';

const realtimeBaseUrl = 'https://api.openai.com/v1/realtime';

async function getRealtimeTranscriptionToken(
  params: GetRealtimeTranscriptionParamsWithModelName,
): Promise<TranscriptionSessionCreateResponse> {
  const apiKeysProvider = await ConfigProvider.getInstance();
  const apiKey = apiKeysProvider.getApiKey(API_KEY.OPENAI);

  const payload = {
    input_audio_format: params.input_audio_format,
    input_audio_transcription: {
      model: params.model_api_name,
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
    const err = new Error(
      `OpenAI transcription session creation failed (${res.status}): ${text}`,
    );
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }

  return (await res.json()) as TranscriptionSessionCreateResponse;
}

const getRealtimeVoice = async (
  params: GetRealtimeVoiceParamsWithModelName,
  userId: string,
): Promise<WebRtcAnswerResponse> => {
  const configProvider = await ConfigProvider.getInstance();
  const { realtimeTranscriptionModel } = await configProvider.getModelsForUser(userId);
  if (!realtimeTranscriptionModel) {
    throw new Error('No models loaded');
  }

  const apiKey = configProvider.getApiKey(API_KEY.OPENAI);
  const { personality, language, scenario, userProfile, conversationRole } = params;
  const sessionBody: Record<string, any> = { model: params.model_api_name };
  if (params.openai_voice_name?.trim()) {
    sessionBody.voice = params.openai_voice_name;
    sessionBody.modalities = ['audio', 'text'];
    sessionBody.instructions = createPersonalityPrompt({
      personality,
      conversationRole,
      language,
      scenario,
      userProfile,
    });
    sessionBody.input_audio_transcription = {
      model: realtimeTranscriptionModel.api_name,
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

  const ephemeralTokenResponse = (await sessionResp.json()) as EphemeralTokenResponse;
  const ephemeralToken = ephemeralTokenResponse.client_secret.value;

  const sdpResp = await fetch(`${realtimeBaseUrl}?model=${params.model_api_name}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ephemeralToken}`,
      'Content-Type': 'application/sdp',
    },
    body: params.sdp_offer,
  });

  const sdpAnswer = await sdpResp.text();
  if (!sdpResp.ok) {
    console.error('OpenAI SDP error:', sdpAnswer);
    throw new Error(`Failed to get SDP answer: ${sdpResp.status}`);
  }

  return { sdp: sdpAnswer };
};

const getResponse = async ({
  input_text,
  previousMessages,
  personality,
  conversationRole,
  language,
  scenario,
  model_api_name,
  userProfile,
}: GetResponseParamsWithModelName): Promise<string> => {
  const openai = await getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: model_api_name,
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
      { role: 'user', content: input_text },
    ],
  });

  return completion.choices[0]?.message.content ?? '';
};

const textToSpeech = async (
  params: GetTTSAudioParamsWithModelName,
): Promise<GetTTSAudioResponse> => {
  const {
    inputMessage,
    personality,
    language,
    response_format,
    model_api_name,
    sample_rate,
  } = params;

  try {
    const openai = await getOpenAIClient();
    const speechResponse = await openai.audio.speech.create({
      model: model_api_name,
      voice: personality.openai_voice_name,
      input: inputMessage,
      instructions:
        personality.voice_instructions + `Speak in ${language.ENGLISH_NAME}.`,
      response_format: response_format,
    });

    const arrayBuffer = await speechResponse.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: `audio/${response_format}` });
    const objectUrl = URL.createObjectURL(blob);
    return {
      blob,
      objectUrl,
      buffer: arrayBuffer,
      sampleRate: sample_rate, // https://platform.openai.com/docs/guides/text-to-speech
    };
  } catch (error) {
    console.error('Error converting text to speech using OpenAI:', error);

    return {
      blob: new Blob([], { type: `audio/${response_format}` }),
      objectUrl: '',
      buffer: new ArrayBuffer(0),
      sampleRate: 0,
    };
  }
};

async function getTimestampedAudio(
  params: GetTimestampedAudioParamsWithModelName,
  userId: string,
): Promise<LipSyncAudio> {
  const { inputMessage, personality, language, model_api_name, sample_rate } = params;
  const audioResponse = await textToSpeech({
    inputMessage,
    personality,
    language,
    response_format: 'pcm',
    model_api_name,
    sample_rate,
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
    model: params.model_api_name,
    language: params.language.ISO639,
    response_format: 'verbose_json',
    timestamp_granularities: ['word'],
  });
};

export const openAiApi = {
  getRealtimeTranscriptionToken,
  getRealtimeVoice,
  getResponse,
  textToSpeech,
  getTimestampedAudio,
  createTimestampedTranscription,
};
