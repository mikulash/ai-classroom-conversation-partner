import { getOpenAIClient } from '../clients/clientOpenAi';
import { GetTTSAudioParamsWithModelName, GetTTSAudioResponse } from '@repo/shared/types/apiClient';

export const textToSpeechOpenAi = async (
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

    // Convert the response into an ArrayBuffer, then wrap it in a Blob.
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
