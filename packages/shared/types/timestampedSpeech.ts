import { Language } from './language.js';
import { Personality } from './supabase/supabaseTypeHelpers.js';

export interface GetTimestampedAudioParams {
  inputMessage: string;
  personality: Personality;
  language: Language;
}

export interface GetTimestampedAudioParamsWithModelName
  extends GetTimestampedAudioParams {
  model_api_name: string;
    sample_rate: number;
}
