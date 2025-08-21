import { Language } from '../types/language.js';
import { Personality, Profile, Scenario } from '../types/supabase/supabaseTypeHelpers.js';
import { LANGUAGE } from '../enums/Language.js';

export interface GetPersonalityPromptParams {
    personality: Personality;
    conversationRole: string;
    language: Language;
    scenario: Scenario | null | undefined;
    userProfile: Profile;
}

function createPersonalityPromptInCzech({
  personality,
  conversationRole,
  language,
  scenario, userProfile,
}: GetPersonalityPromptParams): string {
  let prompt = '';
  if (scenario) {
    prompt += 'Situace je následující: "' + scenario.situation_description_cs + '". Stalo se to zde: "' + scenario.setting_cs + '". ';
  }
  prompt += `Hraješ roli ${personality.name}, ${personality.age}-letého člověka. Tvoje pohlaví je ${personality.gender} s následujícím problémem: "${personality.problem_summary_cs}". 
          Další kontext o tobě: "${personality.personality_description_cs}". 
          Odpovídej v první osobě, jako kdybys byl/a ${personality.name}. Udržuj svou úvodní zprávu stručnou a konverzační, jako v chatu.
          Budeš psát pouze mluvený dialog bez jakýchkoliv dodatečných popisů, scénických poznámek nebo akcí`;

  prompt += `Mluvíš s uživatelem, který vystupuje jako tvůj ${conversationRole}. `;
  if (userProfile?.full_name) prompt += `Jméno uživatele je ${userProfile.full_name}. `;
  if (userProfile?.gender) prompt += `Pohlaví uživatele je ${userProfile.gender}, používej proto odpovídající zájmena. `;

  prompt += `Budeš mluvit pouze v ${language.NATIVE_NAME} jazyce.`;

  return prompt;
}

function createPersonalityPromptInSlovak({
  personality,
  conversationRole,
  language,
  scenario, userProfile,
}: GetPersonalityPromptParams): string {
  let prompt = '';
  if (scenario) {
    prompt += 'Situácia je nasledovná: "' + scenario.situation_description_cs + '". Stalo sa to tu: "' + scenario.setting_cs + '". ';
  }
  prompt += `Hráš rolu ${personality.name}, ${personality.age}-ročného človeka. Tvoje pohlavie je ${personality.gender} s nasledujúcim problémom: "${personality.problem_summary_cs}". 
          Ďalší kontext o tebe: "${personality.personality_description_cs}". 
          Odpovedaj v prvej osobe, ako keby si bol/bola ${personality.name}. Udržuj svoju úvodnú správu stručnú a konverzačnú, ako v chate.
          Budeš písať iba hovorený dialóg bez akýchkoľvek dodatočných popisov, scenických poznámok alebo akcií`;

  prompt += `Hovoríš s používateľom, ktorý vystupuje ako tvoj ${conversationRole}. `;
  if (userProfile?.full_name) prompt += `Meno používateľa je ${userProfile.full_name}. `;
  if (userProfile?.gender) prompt += `Pohlavie používateľa je ${userProfile.gender}, používaj preto zodpovedajúce zámená. `;

  prompt += `Budeš hovoriť iba v ${language.NATIVE_NAME} jazyku.`;
  return prompt;
}

function createPersonalityPromptInEnglish({
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

  prompt += `You will speak only in ${language.ENGLISH_NAME}} language.`;
  return prompt;
}

export function createPersonalityPrompt(
  params: GetPersonalityPromptParams,
): string {
  const { language } = params;
  if (language.ISO639 == LANGUAGE.CS.ISO639) {
    return createPersonalityPromptInCzech(params);
  } else if (language.ISO639 == LANGUAGE.SK.ISO639) {
    return createPersonalityPromptInSlovak(params);
  }
  return createPersonalityPromptInEnglish(params);
}
