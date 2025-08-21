import { ChatMessage } from '../chatMessage.js';
import { Language } from '../language.js';
import { Personality, Profile, Scenario } from '../supabase/supabaseTypeHelpers.js';
import { GetTTSAudioResponseForWebTransfer } from '../apiClient.js';
import { LipSyncAudioWebTransfer } from '../talkingHead.js';

export interface AvatarReplyRequest {
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
  speech: LipSyncAudioWebTransfer;
}

export interface FullReplyPlainResponse {
  text: string;
  speech: GetTTSAudioResponseForWebTransfer;
}
