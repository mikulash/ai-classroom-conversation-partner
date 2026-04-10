import { LANGUAGE, Language } from '@repo/frontend-utils/src/enums/Language';
import { PersonalityModel, ScenarioModel } from '@repo/frontend-utils/src/models';

export const universalDescriptionForScenario = (s: ScenarioModel, lang: Language): {
    situationDescription: string;
    setting: string;
} => {
  const situationDescription =
        lang === LANGUAGE.EN ?
          s.situationDescriptionEn :
          s.situationDescriptionCs;
  const setting = lang === LANGUAGE.EN ? s.settingEn : s.settingCs;
  return {
    situationDescription,
    setting,
  };
};

export const universalDescriptionForPersonality = (p: PersonalityModel, lang: Language): {
    problemSummary: string,
    personalityDescription: string,

} => {
  const problemSummary = lang === LANGUAGE.EN ? p.problemSummaryEn : p.problemSummaryCs;
  const personalityDescription = lang === LANGUAGE.EN ? p.personalityDescriptionEn : p.personalityDescriptionCs;
  return {
    problemSummary,
    personalityDescription,
  };
};
