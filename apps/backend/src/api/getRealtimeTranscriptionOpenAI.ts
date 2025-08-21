import { ConfigProvider } from '../utils/configProvider';
import { API_KEY } from '@repo/shared/enums/ApiKey';
import { TranscriptionSessionCreateResponse } from '@repo/shared/types/api/webRTC';
import { GetRealtimeTranscriptionParamsWithModelName } from '@repo/shared/types/apiClient';

const realtimeBaseUrl = 'https://api.openai.com/v1/realtime';

export async function getEphemeralTranscriptionTokenOpenAi(
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

  const res = await fetch(
    `${realtimeBaseUrl}/transcription_sessions`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    const err = new Error(
      `OpenAI transcription session creation failed (${res.status}): ${text}`,
    );
    // attach status so caller can pick it up
    ;(err as any).status = res.status;
    throw err;
  }

  return (await res.json()) as TranscriptionSessionCreateResponse;
}
