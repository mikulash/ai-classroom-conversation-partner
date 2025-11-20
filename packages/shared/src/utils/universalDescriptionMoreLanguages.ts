import { LANGUAGE, Language } from '../enums/Language';
import { Personality, Scenario } from '../types/db/entities';

export const universalDescriptionForScenario = (s: Scenario, lang: Language): {
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

export const universalDescriptionForPersonality = (p: Personality, lang: Language): {
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
