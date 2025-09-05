import { Language } from '../types/language.js';
import { Personality, Profile, Scenario } from '../types/supabase/supabaseTypeHelpers.js';

export interface GetPersonalityPromptParams {
    personality: Personality;
    conversationRole: string;
    language: Language;
    scenario: Scenario | null | undefined;
    userProfile: Profile;
}

export function createPersonalityPrompt({
  personality,
  conversationRole,
  language,
  scenario,
  userProfile,
}: GetPersonalityPromptParams): string {
  let prompt = '';
  if (scenario) {
    prompt += 'The situation is as follows: "' + scenario.situation_description_en + '". It happened here "' + scenario.setting_en + '". ';
  }
  prompt += `You are roleplaying as ${personality.name}, a ${personality.age}-year-old. Your gender is ${personality.gender} with the following problem: "${personality.problem_summary_en}". 
            Additional context about you: "${personality.personality_description_en}". 
            Respond in first person as if you are ${personality.name}. Keep your initial message brief and conversational, like in a chat.
            You will output only the spoken dialogue without any additional stage directions, descriptions, or actions`;

  prompt += `You are talking to a user whose is acting as your ${conversationRole}. `;
  if (userProfile?.full_name) prompt += `The user's name is ${userProfile.full_name}. `;
  if (userProfile?.gender) prompt += `The user's gender is ${userProfile.gender} so use appropriate pronouns. `;

  prompt += `You will speak only in ${language.ENGLISH_NAME} language.`;
  return prompt;
}
