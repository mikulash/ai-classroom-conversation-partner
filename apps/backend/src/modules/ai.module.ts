import { Module } from '@nestjs/common';
import { AnthropicApiService } from '../ai-api/anthropicApi';
import { ElevenLabsApiService } from '../ai-api/elevenLabsApi';
import { OpenAiApiService } from '../ai-api/openAiApi';
import { UniversalApiService } from '../ai-api/universalApi';
import { XAiApiService } from '../ai-api/xAiApi';
import { ClaudeClientProvider } from '../clients/claude';
import { GrokClientProvider } from '../clients/grok';
import { OpenAiClientProvider } from '../clients/openAi';

@Module({
  providers: [
    OpenAiClientProvider,
    ClaudeClientProvider,
    GrokClientProvider,
    OpenAiApiService,
    AnthropicApiService,
    XAiApiService,
    ElevenLabsApiService,
    UniversalApiService,
  ],
  exports: [UniversalApiService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AiModule {}
