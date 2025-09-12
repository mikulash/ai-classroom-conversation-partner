import { ChatMessage } from './chatMessage.js';
import { Language } from './language.js';
import { Personality, Profile, Scenario } from './supabase/supabaseTypeHelpers.js';

export interface TextToSpeechRequest {
    inputMessage: string;
    personality: Personality;
    language: Language;
    response_format: 'pcm' | 'mp3';
}

export interface GetTTSAudioParamsWithModelName extends TextToSpeechRequest {
    model_api_name: string;
    sample_rate: number;
}

export interface GetTTSAudioResponse {
    blob: Blob;
    objectUrl: string;
    buffer: ArrayBuffer;
    sampleRate: number;
}

export interface TextToSpeechResponse {
    audioBase64: string;
    sampleRate: number;
}

export interface GetResponseParams {
    input_text: string;
    previousMessages: ChatMessage[];
    personality: Personality;
    conversationRole: string;
    language: Language;
    scenario: Scenario | null;
    userProfile: Profile
}

export interface GetResponseParamsWithModelName extends GetResponseParams {
    model_api_name: string;
}

export interface GetTimestampedTranscriptionParams {
    audioFile: File;
    language: Language;
}

export interface GetTimestampedTranscriptionParamsWithModelName extends GetTimestampedTranscriptionParams {
    model_api_name: string;
}

export interface RealtimeTranscriptionRequest {
    input_audio_format: string;
    language: Language;

}

export interface GetRealtimeTranscriptionParamsWithModelName extends RealtimeTranscriptionRequest {
    model_api_name: string;
}

export interface RealtimeVoiceRequest {
    openai_voice_name: string;
    personality: Personality;
    conversationRole: string;
    language: Language;
    scenario: Scenario | null;
    userProfile: Profile
    sdp_offer: string,
}

export interface GetRealtimeVoiceParamsWithModelName extends RealtimeVoiceRequest {
    model_api_name: string;
}

