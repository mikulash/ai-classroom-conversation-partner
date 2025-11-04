import { Language } from '../enums/Language';
import {Personality, Profile, Scenario} from "../generated/prisma/client";

interface GetPersonalityPromptParams {
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
    prompt += 'The situation is as follows: "' + scenario.situationDescriptionEn + '". It happened here "' + scenario.settingEn + '". ';
  }
  prompt += `You are roleplaying as ${personality.name}, a ${personality.age}-year-old. Your gender is ${personality.gender} with the following problem: "${personality.problemSummaryEn}". 
            Additional context about you: "${personality.personalityDescriptionEn}". 
            Respond in first person as if you are ${personality.name}. Keep your messages brief and conversational, like in a chat.
            You will output only the spoken dialogue without any additional stage directions, descriptions, or actions`;

  prompt += `You are talking to a user whose is acting as your ${conversationRole}. `;
  if (userProfile?.fullName) prompt += `The user's name is ${userProfile.fullName}. `;
  if (userProfile?.gender) prompt += `The user's gender is ${userProfile.gender} so use appropriate pronouns. `;

  prompt += `You will speak only in ${language.ENGLISH_NAME} language.`;
  return prompt;
}
