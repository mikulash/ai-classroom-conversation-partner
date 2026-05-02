import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { API_KEY } from '@repo/shared/enums/ApiKey';
import { ConfigProvider } from '../utils/configProvider';

@Injectable()
export class OpenAiClientProvider {
  private openaiInstance: OpenAI | null = null;

  constructor(private readonly configProvider: ConfigProvider) {}

  public getClient(): OpenAI {
    if (!this.openaiInstance) {
      const apiKey = this.configProvider.getApiKey(API_KEY.OPENAI);

      this.openaiInstance = new OpenAI({
        apiKey,
      });
    }

    return this.openaiInstance;
  }

  public resetClient(): void {
    this.openaiInstance = null;
  }
}
