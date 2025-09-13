import { Language } from './language.js';
import { Personality, Profile, Scenario } from './supabase/supabaseTypeHelpers.js';
import { ChatMessage } from './chatMessage.js';

export interface TextToSpeechRequest {
    inputMessage: string;
    personality: Personality;
    language: Language;
    response_format: 'pcm' | 'mp3';
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

export interface RealtimeTranscriptionRequest {
    input_audio_format: string;
    language: Language;
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

export interface TextToSpeechTimestampedRequest {
    inputMessage: string;
    personality: Personality;
    language: Language;
}

export interface GenerateReplyRequest {
    input_text: string;
    previousMessages: ChatMessage[];
    personality: Personality;
    conversationRole: string;
    language: Language;
    scenario: Scenario | null;
    userProfile: Profile;
}

export interface TextToSpeechTimestampedResponse {
    audio: string[]; // Base64 encoded strings
    words: string[];
    wtimes: number[];
    wdurations: number[];
}


export interface FullReplyTimestampedResponse {
    text: string;
    speech: TextToSpeechTimestampedResponse;
}

export interface FullReplyPlainResponse {
    text: string;
    speech: TextToSpeechResponse;
}

interface AlignmentInfo {
    characters: string[];
    character_start_times_seconds: number[];
    character_end_times_seconds: number[];
}

export interface ElevenLabsTimestampedResponse {
    audio_base64: string;
    alignment?: AlignmentInfo;
    normalized_alignment?: AlignmentInfo;
}

export interface ErrorResponse {
    message: string;
    statusCode?: number;
    [key: string]: any; // additional properties
}

export interface RegisterUserRequest {
    email: string;
    password: string;
    full_name: string;
    gender: string;
}

export interface WebRtcAnswerResponse {
    sdp: string; // raw SDP ‘answer’
}

export interface EphemeralTokenResponse {
    client_secret: {
        value: string;
    };
}

export interface TranscriptionSessionCreateResponse {
    id: string;
    object: string;
    modalities: string[];
    turn_detection: {
        type: string;
        threshold: number;
        prefix_padding_ms: number;
        silence_duration_ms: number;
    };
    input_audio_format: string;
    input_audio_transcription: {
        model: string;
        language: string | null;
        prompt: string;
    };
    client_secret: {
        expires_at: string;
        value : string;
    } | null;
    expires_at?: number;
}

export interface TranscriptionSessionCreateRequest {
    input_audio_format: string;
    language: string | null;
}
