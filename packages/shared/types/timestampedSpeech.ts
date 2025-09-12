import { Language } from './language.js';
import { Personality } from './supabase/supabaseTypeHelpers.js';

export interface TextToSpeechTimestampedRequest {
  inputMessage: string;
  personality: Personality;
  language: Language;
}

export interface GetTimestampedAudioParamsWithModelName
  extends TextToSpeechTimestampedRequest {
  model_api_name: string;
    sample_rate: number;
}
