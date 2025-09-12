import { ChatMessage } from '../chatMessage.js';
import { Language } from '../language.js';
import { Personality, Profile, Scenario } from '../supabase/supabaseTypeHelpers.js';
import { TextToSpeechResponse } from '../apiClient.js';
import { TextToSpeechTimestampedResponse } from '../talkingHead.js';

export interface GenerateReplyRequest {
  input_text: string;
  previousMessages: ChatMessage[];
  personality: Personality;
  conversationRole: string;
  language: Language;
  scenario: Scenario | null;
  userProfile: Profile;
}


export interface FullReplyTimestampedResponse {
  text: string;
  speech: TextToSpeechTimestampedResponse;
}

export interface FullReplyPlainResponse {
  text: string;
  speech: TextToSpeechResponse;
}
