import { getGrokClient } from '../clients/clientGrok';
import { createPersonalityPrompt } from '@repo/shared/utils/createPersonalityPrompt';
import { GetResponseParamsWithModelName } from '../types/api';

const getResponse = async ({
  input_text,
  previousMessages,
  personality,
  conversationRole,
  language,
  scenario,
  model_api_name,
  userProfile,
}: GetResponseParamsWithModelName): Promise<string> => {
  const grok = await getGrokClient();

  const completion = await grok.chat.completions.create({
    model: model_api_name,
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
      { role: 'user', content: input_text },
    ],
  });

  return completion.choices[0]?.message.content ?? '';
};

export const xAiApi = { getResponse };
