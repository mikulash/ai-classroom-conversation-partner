import { ApiKey } from '../enums/ApiKey.js';

export interface AiProviderStatus {
    apiKey: ApiKey;
    available: boolean;
}
