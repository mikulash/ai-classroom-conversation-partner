import { Injectable } from '@nestjs/common';
import { ClaudeClientProvider } from '../clients/claude';
import { createPersonalityPrompt } from '../utils/createPersonalityPrompt';
import { GetResponseParamsWithModelName } from '../types/universalApi.types';

@Injectable()
export class AnthropicApiService {
  constructor(private readonly claudeClientProvider: ClaudeClientProvider) {}

  public async getResponse({
    inputText,
    previousMessages,
    personality,
    conversationRole,
    language,
    scenario,
    modelApiName,
    userProfile,
  }: GetResponseParamsWithModelName): Promise<string> {
    const claude = this.claudeClientProvider.getClient();
    const strippedMessages = previousMessages.map((message) => ({
      role: message.role,
      content: message.content,
    }));
    const message = await claude.messages.create({
      model: modelApiName,
      max_tokens: 1024,
      system: createPersonalityPrompt({
        personality,
        conversationRole,
        language,
        scenario,
        userProfile,
      }),
      messages: [
        ...strippedMessages,
        { role: 'user', content: inputText },
      ],
    });

    const response = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('');

    console.log('claude response text', response);

    return response;
  }
}
