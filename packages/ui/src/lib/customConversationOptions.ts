import { LANGUAGE, Language } from '@repo/frontend-utils/src/enums/Language';
import { PersonalityModel, ScenarioModel, ConversationRoleModel } from '@repo/frontend-utils/src/models';

export type PersonalityTabKey = 'predefined' | 'custom';
export type ScenarioTabKey = 'none' | 'predefined' | 'custom';
export const DEFAULT_PERSONALITY: Omit<PersonalityModel, 'createdAt'> = {
  id: 0,
  name: '',
  personalityDescriptionCs: '',
  personalityDescriptionEn: '',
  problemSummaryCs: '',
  problemSummaryEn: '',
  sex: 'M' as const,
  age: 30,
  gender: 'M' as const,
  avatarUrl: '',
  voiceInstructions: null,
  openaiVoiceName: 'alloy' as const,
  elevenlabsVoiceId: null,
  isHidden: false,
};


export const createCustomPersonality = (customData: Partial<PersonalityModel>): PersonalityModel => ({
  ...DEFAULT_PERSONALITY,
  ...customData,
  createdAt: new Date(),
});

const createCustomScenario = (customData: Partial<ScenarioModel>): ScenarioModel => ({
  id: customData.id ?? 0,
  involvedPersonalityId: customData.involvedPersonalityId ?? 0,
  settingCs: customData.settingCs ?? '',
  settingEn: customData.settingEn ?? '',
  situationDescriptionCs: customData.situationDescriptionCs ?? '',
  situationDescriptionEn: customData.situationDescriptionEn ?? '',
  createdAt: customData.createdAt ?? new Date(),
});

export const getUserRoleName = (
  selectedRole: ConversationRoleModel | undefined,
  customName: string,
  currentLanguage: Language,
): string => {
  if (!selectedRole) return customName;
  return currentLanguage === LANGUAGE.EN ? selectedRole.nameEn : selectedRole.nameCs;
};

export const getScenario = (
  activeTab: ScenarioTabKey,
  selectedScenario: ScenarioModel | undefined,
  customScenario: Partial<ScenarioModel>,
): ScenarioModel | null => {
  if (activeTab === 'none') return null;
  if (activeTab === 'predefined' && selectedScenario) return selectedScenario;
  return createCustomScenario(customScenario);
};
