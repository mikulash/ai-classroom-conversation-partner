import { LanguageDto, ReplyPersonalityDto, ReplyProfileDto, ReplyScenarioDto } from '../dtos/replies.dto';

interface GetPersonalityPromptParams {
    personality: ReplyPersonalityDto;
    conversationRole: string;
    language: LanguageDto;
    scenario: ReplyScenarioDto | null;
    userProfile: ReplyProfileDto;
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
    const situationDescription = scenario.situationDescriptionEn ?? '';
    const setting = scenario.settingEn ?? '';
    prompt += `The situation is as follows: "${situationDescription}". It happened here "${setting}". `;
  }

  const ageText = personality.age != null ? `, a ${personality.age.toString()}-year-old` : '';
  prompt += `You are roleplaying as ${personality.name}${ageText}. Your gender is ${personality.gender} with the following problem: "${personality.problemSummaryEn}". 
            Additional context about you: "${personality.personalityDescriptionEn}". 
            Respond in first person as if you are ${personality.name}. Keep your messages brief and conversational, like in a chat.
            You will output only the spoken dialogue without any additional stage directions, descriptions, or actions. `;

  prompt += `You are talking to a user whose is acting as your ${conversationRole}. `;
  if (userProfile.fullName) prompt += `The user's name is ${userProfile.fullName}. `;
  if (userProfile.gender) prompt += `The user's gender is ${userProfile.gender} so use appropriate pronouns. `;

  prompt += `You will speak only in ${language.ENGLISH_NAME} language.`;
  return prompt;
}
