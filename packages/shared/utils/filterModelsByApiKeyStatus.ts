import { ApiKeysStatus } from '../types/apiKeyStatus.js';
import { API_KEY } from '../enums/ApiKey.js';

// Mapping between provider name used in model tables and the corresponding API key env name
export const providerToApiKeyMap: Record<string, keyof ApiKeysStatus> = {
  OpenAi: API_KEY.OPENAI,
  ElevenLabs: API_KEY.ELEVENLABS,
  Anthropic: API_KEY.CLAUDE,
  xAi: API_KEY.GROK,
};

/**
 * Filters an array of models to include only those whose provider has an available API key.
 */
export function filterModelsByApiKeyStatus<T extends { provider: string }>(
  models: T[],
  status: ApiKeysStatus,
): T[] {
  return models.filter((model) => {
    const key = providerToApiKeyMap[model.provider];
    return key ? status[key] : false;
  });
}
