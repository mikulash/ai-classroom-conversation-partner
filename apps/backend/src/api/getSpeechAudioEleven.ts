import { API_KEY } from '@repo/shared/enums/ApiKey';
import { ConfigProvider } from '../utils/configProvider';
import { GetTTSAudioParamsWithModelName, GetTTSAudioResponse } from '@repo/shared/types/apiClient';

export const textToSpeechEleven = async (
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

  const apiKeysProvider = await ConfigProvider.getInstance();
  const ELEVENLABS_API_KEY = apiKeysProvider.getApiKey(API_KEY.ELEVENLABS);
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key is missing');
  }

  try {
    // Determine the output format for ElevenLabs API
    const output_format =
        response_format === 'pcm' ? `pcm_${sample_rate}` : `mp3_${sample_rate}_32`;
    // Default to the voice from the original function, but could be made dynamic based on personality
    let voice_id = personality.elevenlabs_voice_id;
    if (!voice_id) {
      if (personality.sex == 'F') {
        voice_id = process.env.ELEVENLABS_FALLBACK_VOICE_ID_FEMALE || '';
      } else {
        voice_id = process.env.ELEVENLABS_FALLBACK_VOICE_ID_MALE || '';
      }
    }


    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}?output_format=${output_format}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: inputMessage,
          model_id: model_api_name,
          language: language.ISO639,
          voice_settings: {
            stability: 0,
            similarity_boost: 0,
            style: 0,
            speed: 1.0,
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `ElevenLabs API failed: ${response.status} ${response.statusText}`,
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: `audio/${response_format}` });
    const objectUrl = URL.createObjectURL(blob);

    return {
      blob,
      objectUrl,
      buffer: arrayBuffer,
      sampleRate: sample_rate,
    };
  } catch (error) {
    console.error('Error converting text to speech using ElevenLabs:', error);

    return {
      blob: new Blob([], { type: `audio/${response_format}` }),
      objectUrl: '',
      buffer: new ArrayBuffer(0),
      sampleRate: 0,
    };
  }
};
