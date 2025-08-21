import { getClaudeClient } from '../clients/clientClaude';
import { GetResponseParamsWithModelName } from '@repo/shared/types/apiClient';
import { createPersonalityPrompt } from '@repo/shared/utils/createPersonalityPrompt';

export const getClaudeResponse = async ({
  input_text,
  previousMessages,
  personality,
  conversationRole,
  language,
  scenario,
  model_api_name,
  userProfile,
}: GetResponseParamsWithModelName): Promise<string> => {
  const claude = await getClaudeClient();
  const strippedMessages = previousMessages.map((message) => ({
    role: message.role,
    content: message.content,
  }));
  const message = await claude.messages.create({
    model: model_api_name,
    max_tokens: 1024,
    system: createPersonalityPrompt({ personality, conversationRole, language, scenario, userProfile }),
    messages: [...strippedMessages, { role: 'user', content: input_text }],
  });

  console.log('claude response', message);

  const response = message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('');
  console.log('claude response text', response);
  return response;
};
