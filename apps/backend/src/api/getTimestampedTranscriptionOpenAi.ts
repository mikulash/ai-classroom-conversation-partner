import { getOpenAIClient } from '../clients/clientOpenAi';
import { GetTimestampedTranscriptionParamsWithModelName } from '@repo/shared/types/apiClient';

export const createTimestampedTranscriptionOpenAi = async (params: GetTimestampedTranscriptionParamsWithModelName) => {
  const openai = await getOpenAIClient();

  return openai.audio.transcriptions.create({
    file: params.audioFile,
    model: params.model_api_name,
    language: params.language.ISO639,
    response_format: 'verbose_json',
    timestamp_granularities: ['word'],
  });
};
