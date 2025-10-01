import { ApiKey } from '../enums/ApiKey';

export interface AiProviderStatus {
    apiKey: ApiKey;
    isAvailable: boolean;
}
