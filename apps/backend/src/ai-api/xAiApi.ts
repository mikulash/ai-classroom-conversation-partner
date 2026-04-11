import { Injectable } from '@nestjs/common';
import { GrokClientProvider } from '../clients/grok';
import { createPersonalityPrompt } from '../utils/createPersonalityPrompt';
import { GetResponseParamsWithModelName } from '../types/universalApi.types';

@Injectable()
export class XAiApiService {
  constructor(private readonly grokClientProvider: GrokClientProvider) {}

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
    const grok = this.grokClientProvider.getClient();

    const completion = await grok.chat.completions.create({
      model: modelApiName,
      messages: [
        {
          role: 'system',
          content: createPersonalityPrompt({
            personality,
            conversationRole,
            language,
            scenario,
            userProfile,
          }),
        },
        ...previousMessages,
        { role: 'user', content: inputText },
      ],
    });

    return completion.choices[0]?.message.content ?? '';
  }
}
