import { getOpenAIClient } from '../clients/clientOpenAi';
import { GetResponseParamsWithModelName } from '@repo/shared/types/apiClient';
import { createPersonalityPrompt } from '@repo/shared/utils/createPersonalityPrompt';

export const getOpenAiResponse = async ({
  input_text,
  previousMessages,
  personality,
  conversationRole,
  language,
  scenario,
  model_api_name,
  userProfile,
}: GetResponseParamsWithModelName): Promise<string> => {
  const openai = await getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: model_api_name,
    messages: [
      {
        role: 'system',
        content: createPersonalityPrompt({ personality, conversationRole, language, scenario, userProfile }),
      },
      ...previousMessages,
      { role: 'user', content: input_text },
    ],
  });

  return completion.choices[0]?.message.content ?? '';
};
