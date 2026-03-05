import { Language } from '@repo/shared/enums/Language';
import { ChatMessage } from '@repo/shared/types/chatMessage';
import { PersonalityModel, ProfileModel, ScenarioModel } from './models';

export interface TextToSpeechRequest {
    inputMessage: string;
    personality: PersonalityModel;
    language: Language;
    responseFormat: 'pcm' | 'mp3';
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
    personality: PersonalityModel;
    conversationRole: string;
    language: Language;
    scenario: ScenarioModel | null;
    userProfile: ProfileModel
    sdp_offer: string,
}

export interface TextToSpeechTimestampedRequest {
    inputMessage: string;
    personality: PersonalityModel;
    language: Language;
}

export interface GenerateReplyRequest {
    inputText: string;
    previousMessages: ChatMessage[];
    personality: PersonalityModel;
    conversationRole: string;
    language: Language;
    scenario: ScenarioModel | null;
    userProfile: ProfileModel;
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

    [key: string]: unknown; // additional properties
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
        value: string;
    } | null;
    expires_at?: number;
}

