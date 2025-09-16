import { LANGUAGE, Language } from '../enums/Language.js';
import { Personality, Scenario } from '../types/supabase/supabaseTypeHelpers.js';

export const universalDescriptionForScenario = (s: Scenario, lang: Language): {
    situationDescription: string;
    setting: string;
} => {
  const situationDescription =
        lang === LANGUAGE.EN ?
          s.situation_description_en :
          s.situation_description_cs;
  const setting = lang === LANGUAGE.EN ? s.setting_en : s.setting_cs;
  return {
    situationDescription,
    setting,
  };
};

export const universalDescriptionForPersonality = (p: Personality, lang: Language): {
    problemSummary: string,
    personalityDescription: string,

} => {
  const problemSummary = lang === LANGUAGE.EN ? p.problem_summary_en : p.problem_summary_cs;
  const personalityDescription = lang === LANGUAGE.EN ? p.personality_description_en : p.personality_description_cs;
  return {
    problemSummary,
    personalityDescription,
  };
};
