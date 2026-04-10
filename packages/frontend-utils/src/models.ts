import {
  ConversationType,
  OpenAiVoiceName,
  RealtimeModelProvider, ResponseModelProvider,
  Sex, TimestampedTranscriptionModelProvider,
  TranscriptionModelProvider, TtsModelProvider,
  UserRole,
} from '@repo/shared/types/generated/enums';
import type { ApiKey } from '@repo/shared/enums/ApiKey';

export interface MessageModel {
    message: string
}

export interface PersonalityRefModel {
    id: number
    name: string
    avatarUrl: string | null
}

export interface ScenarioRefModel {
    id: number
    situationDescriptionEn: string
    situationDescriptionCs: string
}

export interface ScenarioModel {
    id: number
    createdAt: Date
    involvedPersonalityId: number | null
    situationDescriptionEn: string
    settingEn: string
    situationDescriptionCs: string
    settingCs: string
}

export interface ScenarioWithPersonalityModel extends ScenarioModel {
    personality: PersonalityRefModel | null
}

export interface AppConfigModel {
    id: number
    validFrom: Date
    validTo: Date | null
    userId: string | null
    responseModelId: number | null
    ttsModelId: number | null
    realtimeModelId: number | null
    silenceTimeoutInSeconds: number
    allowedDomains: string[]
    appName: string
    realtimeTranscriptionModelId: number | null
    timestampedTranscriptionModelId: number | null
    maxConversationDurationInSeconds: number
}

export interface PersonalityModel {
    id: number
    createdAt: Date
    name: string
    age: number | null
    avatarUrl: string | null
    gender: string
    sex: Sex
    voiceInstructions: string | null
    elevenlabsVoiceId: string | null
    openaiVoiceName: OpenAiVoiceName
    problemSummaryEn: string
    personalityDescriptionEn: string
    problemSummaryCs: string
    personalityDescriptionCs: string
    isHidden: boolean
}

export interface InitialConversationOptionsModel {
    personalities: PersonalityModel[];
    scenarios: ScenarioWithPersonalityModel[];
    conversationRoles: ConversationRoleModel[];
    appConfig: AppConfigModel;
}

export interface ConversationRoleModel {
    id: number
    createdAt: Date
    nameEn: string
    nameCs: string
}


export interface RealtimeModelModel {
    id: number
    createdAt: Date
    friendlyName: string
    apiName: string
    docsUrl: string | null
    isEnabled: boolean
    provider: RealtimeModelProvider
}

export interface RealtimeTranscriptionModelModel {
    id: number
    createdAt: Date
    friendlyName: string
    provider: TranscriptionModelProvider
    apiName: string
    docsUrl: string | null
    isEnabled: boolean | null
    allowsWordLevelTimestamps: boolean
}

export interface ResponseModelModel {
    id: number
    createdAt: Date
    friendlyName: string
    apiName: string
    docsUrl: string | null
    isEnabled: boolean
    provider: ResponseModelProvider
}

export interface TimestampedTranscriptionModelModel {
    id: number
    createdAt: Date
    friendlyName: string
    provider: TimestampedTranscriptionModelProvider
    apiName: string
    docsUrl: string | null
    isEnabled: boolean
}

export interface TtsModelModel {
    id: number
    createdAt: Date
    friendlyName: string
    apiName: string
    sampleRate: number
    docsUrl: string
    isEnabled: boolean
    provider: TtsModelProvider
    allowsWordLevelTimestampedTranscript: boolean
}

export interface CustomSelectionWithModelsModel {
    userId: string
    createdAt: Date
    responseModelId: number | null
    ttsModelId: number | null
    realtimeModelId: number | null
    realtimeTranscriptionModelId: number | null
    timestampedTranscriptionModelId: number | null
    responseModel: ResponseModelModel | null
    ttsModel: TtsModelModel | null
    realtimeModel: RealtimeModelModel | null
    realtimeTranscriptionModel: RealtimeTranscriptionModelModel | null
    timestampedTranscriptionModel: TimestampedTranscriptionModelModel | null
}

export interface ProfileModel {
    id: string
    createdAt: Date
    updatedAt: Date
    fullName: string
    gender: string
    userRole: UserRole
    conversationRole: string
    bio: string
    email: string
    confirmedAt: Date | null
}

export interface ConversationMessageModel {
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

export type ConversationLogLevelModel = 'log' | 'error' | 'warn';

export interface ConversationLogModel {
    timestamp: Date
    level: ConversationLogLevelModel
    message: string
    data?: Record<string, unknown> | null
}

export interface ConversationModel {
    id: number
    createdAt: Date
    userId: string
    personalityId: number | null
    scenarioId: number | null
    startTime: Date
    endTime: Date
    endedReason: string
    messages: ConversationMessageModel[] | null
    logs: ConversationLogModel[] | null
    conversationType: ConversationType
    personality: PersonalityRefModel | null
    scenario: ScenarioRefModel | null
}

export interface AuthSessionModel {
    access_token: string
    user: ProfileModel
}

export interface AuthenticatedUserModel {
    user: ProfileModel
    session: AuthSessionModel
}

export interface AuthTokensModel {
    accessToken: string
    refreshToken: string
}

export interface SpeechAudioModel {
    blob: Blob
    objectUrl: string
    buffer: ArrayBuffer
    sampleRate: number
}

export interface TimestampedSpeechAudioModel {
    audio: ArrayBuffer[]
    words: string[]
    wtimes: number[]
    wdurations: number[]
}

export interface FullReplyPlainModel {
    text: string
    speech: SpeechAudioModel
}

export interface FullReplyTimestampedModel {
    text: string
    speech: TimestampedSpeechAudioModel
}

export interface WebRtcAnswerModel {
    sdp: string
}

export interface TurnDetectionModel {
    type: string
    threshold: number
    prefix_padding_ms: number
    silence_duration_ms: number
}

export interface InputAudioTranscriptionModel {
    model: string
    language: string | null
    prompt: string
}

export interface ClientSecretModel {
    expires_at: string
    value: string
}

export interface TranscriptionSessionModel {
    id: string
    object: string
    modalities: string[]
    turn_detection: TurnDetectionModel
    input_audio_format: string
    input_audio_transcription: InputAudioTranscriptionModel
    client_secret?: ClientSecretModel | null
    expires_at?: number
}

export interface AiProviderStatusModel {
    apiKey: ApiKey
    isAvailable: boolean
}

