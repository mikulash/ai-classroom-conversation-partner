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
