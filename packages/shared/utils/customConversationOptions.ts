import { ConversationRole, Personality, Scenario } from '../types/supabase/supabaseTypeHelpers.js';
import { LANGUAGE } from '../enums/Language.js';
import { Language } from '../enums/Language.js';

export type PersonalityTabKey = 'predefined' | 'custom';
export type ScenarioTabKey = 'none' | 'predefined' | 'custom';
export const DEFAULT_PERSONALITY: Omit<Personality, 'created_at'> = {
  id: 0,
  name: '',
  personality_description_cs: '',
  personality_description_en: '',
  problem_summary_cs: '',
  problem_summary_en: '',
  sex: 'M' as const,
  age: 30,
  gender: 'M' as const,
  avatar_url: '',
  voice_instructions: null,
  openai_voice_name: 'alloy' as const,
  elevenlabs_voice_id: null,
  is_hidden: false,
};


export const createCustomPersonality = (customData: Partial<Personality>): Personality => ({
  ...DEFAULT_PERSONALITY,
  ...customData,
  created_at: new Date().toISOString(),
});

const createCustomScenario = (customData: Partial<Scenario>): Scenario => ({
  id: customData.id ?? 0,
  involved_personality_id: customData.involved_personality_id ?? null,
  setting_cs: customData.setting_cs ?? '',
  setting_en: customData.setting_en ?? '',
  situation_description_cs: customData.situation_description_cs ?? '',
  situation_description_en: customData.situation_description_en ?? '',
  created_at: customData.created_at ?? new Date().toISOString(),
});

export const getUserRoleName = (
  selectedRole: ConversationRole | undefined,
  customName: string,
  currentLanguage: Language,
): string => {
  if (!selectedRole) return customName;
  return currentLanguage === LANGUAGE.EN ? selectedRole.name_en : selectedRole.name_cs;
};

export const getScenario = (
  activeTab: ScenarioTabKey,
  selectedScenario: Scenario | undefined,
  customScenario: Partial<Scenario>,
): Scenario | null => {
  if (activeTab === 'none') return null;
  if (activeTab === 'predefined' && selectedScenario) return selectedScenario;
  return createCustomScenario(customScenario);
};
