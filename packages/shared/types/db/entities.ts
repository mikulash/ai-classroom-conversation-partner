import {
  ConversationType,
  Gender,
  OpenAiVoice,
  RealtimeModelProvider, ResponseModelProvider, TimestampedTranscriptionModelProvider,
  TranscriptionModelProvider, TtsModelProvider,
  UserRole,
} from './enums';

export interface AppConfig {
    id: number
    editedAt: Date
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

export interface AdminUserCustomModelSelection {
    userId: string
    createdAt: Date
    responseModelId: number | null
    ttsModelId: number | null
    realtimeModelId: number | null
    realtimeTranscriptionModelId: number | null
    timestampedTranscriptionModelId: number | null
}

export interface Conversation {
    id: number
    createdAt: Date
    userId: string
    personalityId: number | null
    scenarioId: number | null
    startTime: Date
    endTime: Date
    endedReason: string
    messages: object | null
    logs: object | null
    conversationType: ConversationType
    usedConfig: object | null
}

export interface ConversationRole {
    id: number
    createdAt: Date
    nameEn: string
    nameCs: string
}

export interface Personality {
    id: number
    createdAt: Date
    name: string
    age: number | null
    avatarUrl: string | null
    gender: string
    sex: Gender
    voiceInstructions: string | null
    elevenlabsVoiceId: string | null
    openaiVoiceName: OpenAiVoice
    problemSummaryEn: string
    personalityDescriptionEn: string
    problemSummaryCs: string
    personalityDescriptionCs: string
    isHidden: boolean
}

export interface Personality {
    id: number
    createdAt: Date
    name: string
    age: number | null
    avatarUrl: string | null
    gender: string
    sex: Gender
    voiceInstructions: string | null
    elevenlabsVoiceId: string | null
    openaiVoiceName: OpenAiVoice
    problemSummaryEn: string
    personalityDescriptionEn: string
    problemSummaryCs: string
    personalityDescriptionCs: string
    isHidden: boolean
}

export interface Scenario {
    id: number
    createdAt: Date
    involvedPersonalityId: number | null
    situationDescriptionEn: string
    settingEn: string
    situationDescriptionCs: string
    settingCs: string
}

export interface Profile {
    id: string
    createdAt: Date
    updatedAt: Date
    email: string | null
    fullName: string | null
    gender: string | null
    conversationRole: string
    bio: string | null
    userRole: UserRole
}

export interface RealtimeModel {
    id: number
    createdAt: Date
    friendlyName: string
    apiName: string
    docsUrl: string | null
    isEnabled: boolean
    provider: RealtimeModelProvider
}

export interface RealtimeTranscriptionModel {
    id: number
    createdAt: Date
    friendlyName: string
    provider: TranscriptionModelProvider
    apiName: string
    docsUrl: string | null
    isEnabled: boolean | null
    allowsWordLevelTimestamps: boolean
}

export interface ResponseModel {
    id: number
    createdAt: Date
    friendlyName: string
    apiName: string
    docsUrl: string | null
    isEnabled: boolean
    provider: ResponseModelProvider
}

export interface TimestampedTranscriptionModel {
    id: number
    createdAt: Date
    friendlyName: string
    provider: TimestampedTranscriptionModelProvider
    apiName: string
    docsUrl: string | null
    isEnabled: boolean
}

export interface TtsModel {
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
