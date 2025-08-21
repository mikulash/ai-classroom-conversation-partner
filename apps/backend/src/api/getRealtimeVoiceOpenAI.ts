import { ConfigProvider } from '../utils/configProvider';
import { EphemeralTokenResponse, WebRtcAnswerResponse } from '@repo/shared/types/api/webRTC';
import { API_KEY } from '@repo/shared/enums/ApiKey';
import { GetRealtimeVoiceParamsWithModelName } from '@repo/shared/types/apiClient';
import { createPersonalityPrompt } from '@repo/shared/utils/createPersonalityPrompt';

const realtimeBaseUrl = 'https://api.openai.com/v1/realtime';

export const getRealtimeVoiceOpenAi = async (
  params: GetRealtimeVoiceParamsWithModelName, userId: string,
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
    sessionBody.instructions =createPersonalityPrompt({
      personality,
      conversationRole,
      language,
      scenario,
      userProfile,
    });
    sessionBody.input_audio_transcription= {
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
  // get ephemeral token
  const sessionResp = await fetch(`${realtimeBaseUrl}/sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sessionBody),
  });
  console.log('RTC SPEECH RESPONSE', sessionResp);

  if (!sessionResp.ok) {
    const errorPayload = await sessionResp.text();
    console.error('OpenAI session error:', errorPayload);
    throw new Error(`Failed to create Realtime session: ${sessionResp.status}`);
  }

  const ephemeralTokenResponse = await sessionResp.json() as EphemeralTokenResponse;
  const ephemeralToken = ephemeralTokenResponse.client_secret.value;

  // Submit SDP offer
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
