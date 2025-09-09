import { ApiKey } from './apiKey.js';

export interface AiProviderStatus {
    apiKey: ApiKey;
    available: boolean;
}
