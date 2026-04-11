import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { API_KEY } from '@repo/shared/enums/ApiKey';
import { ConfigProvider } from '../utils/configProvider';

@Injectable()
export class GrokClientProvider {
  private grokInstance: OpenAI | null = null;

  constructor(private readonly configProvider: ConfigProvider) {}

  public getClient(): OpenAI {
    if (!this.grokInstance) {
      const apiKey = this.configProvider.getApiKey(API_KEY.GROK);

      this.grokInstance = new OpenAI({
        apiKey,
        baseURL: 'https://api.x.ai/v1',
        dangerouslyAllowBrowser: true,
      });
    }

    return this.grokInstance;
  }

  public resetClient(): void {
    this.grokInstance = null;
  }
}
