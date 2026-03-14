import { getGrokClient } from '../clients/grok';
import { createPersonalityPrompt } from '../utils/createPersonalityPrompt';
import { GetResponseParamsWithModelName } from '../types/universalApi.types';

const getResponse = async ({
  inputText,
  previousMessages,
  personality,
  conversationRole,
  language,
  scenario,
  modelApiName,
  userProfile,
}: GetResponseParamsWithModelName): Promise<string> => {
  const grok = await getGrokClient();

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
};

export const xAiApi = { getResponse };
