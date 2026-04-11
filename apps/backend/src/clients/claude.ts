import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { API_KEY } from '@repo/shared/enums/ApiKey';
import { ConfigProvider } from '../utils/configProvider';

@Injectable()
export class ClaudeClientProvider {
  private claudeInstance: Anthropic | null = null;

  constructor(private readonly configProvider: ConfigProvider) {}

  public getClient(): Anthropic {
    if (!this.claudeInstance) {
      const apiKey = this.configProvider.getApiKey(API_KEY.CLAUDE);

      this.claudeInstance = new Anthropic({
        apiKey,
        dangerouslyAllowBrowser: true,
      });
    }

    return this.claudeInstance;
  }

  public resetClient(): void {
    this.claudeInstance = null;
  }
}
