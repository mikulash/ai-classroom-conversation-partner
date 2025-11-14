import {
  ConversationType,
  OpenAiVoiceName,
  RealtimeModelProvider, ResponseModelProvider, Sex, TimestampedTranscriptionModelProvider,
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

export interface AppConfigCreate {
    responseModelId?: number | null
    ttsModelId?: number | null
    realtimeModelId?: number | null
    silenceTimeoutInSeconds?: number
    allowedDomains?: string[]
    appName?: string
    realtimeTranscriptionModelId?: number | null
    timestampedTranscriptionModelId?: number | null
    maxConversationDurationInSeconds?: number
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

export interface AdminUserCustomModelSelectionCreate {
    userId: string
    createdAt?: Date | string
    responseModelId?: number | null
    ttsModelId?: number | null
    realtimeModelId?: number | null
    realtimeTranscriptionModelId?: number | null
    timestampedTranscriptionModelId?: number | null
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

export interface ConversationCreate {
    createdAt?: Date | string
    userId: string
    personalityId?: number | null
    scenarioId?: number | null
    startTime: Date | string
    endTime?: Date | string
    endedReason?: string
    messages?: object | null
    logs?: object | null
    conversationType: ConversationType
    usedConfig?: object | null
}

export interface ConversationRole {
    id: number
    createdAt: Date
    nameEn: string
    nameCs: string
}

export interface ConversationRoleCreate {
    createdAt?: Date | string
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

export interface PersonalityCreate {
    createdAt?: Date | string
    name: string
    age?: number | null
    avatarUrl?: string | null
    gender?: string
    sex?: Sex
    voiceInstructions?: string | null
    elevenlabsVoiceId?: string | null
    openaiVoiceName: OpenAiVoiceName
    problemSummaryEn?: string
    personalityDescriptionEn?: string
    problemSummaryCs?: string
    personalityDescriptionCs?: string
    isHidden?: boolean
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

export interface ScenarioCreate {
    createdAt?: Date | string
    involvedPersonalityId?: number | null
    situationDescriptionEn?: string
    settingEn?: string
    situationDescriptionCs?: string
    settingCs?: string
}

export interface User {
    id: string
    createdAt: Date
    updatedAt: Date
    email: string
    password: string
    userRole: UserRole
}

export interface UserCreate {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    email: string
    password: string
    userRole?: UserRole
}

export interface Profile {
    id: string
    createdAt: Date
    updatedAt: Date
    fullName: string | null
    gender: string | null
    userRole: UserRole
    conversationRole: string
    bio: string | null
}

export interface ProfileCreate {
    id?: string
    userId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    fullName?: string | null
    gender?: string | null
    conversationRole?: string
    bio?: string | null
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

export interface RealtimeModelCreate {
    createdAt?: Date | string
    friendlyName: string
    apiName: string
    docsUrl?: string | null
    isEnabled?: boolean
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

export interface RealtimeTranscriptionModelCreate {
    createdAt?: Date | string
    friendlyName: string
    provider: TranscriptionModelProvider
    apiName: string
    docsUrl?: string | null
    isEnabled?: boolean | null
    allowsWordLevelTimestamps?: boolean
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

export interface ResponseModelCreate {
    createdAt?: Date | string
    friendlyName: string
    apiName: string
    docsUrl?: string | null
    isEnabled?: boolean
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

export interface TimestampedTranscriptionModelCreate {
    createdAt?: Date | string
    friendlyName: string
    provider: TimestampedTranscriptionModelProvider
    apiName: string
    docsUrl?: string | null
    isEnabled?: boolean
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

export interface TtsModelCreate {
    createdAt?: Date | string
    friendlyName: string
    apiName: string
    sampleRate: number
    docsUrl: string
    isEnabled?: boolean
    provider: TtsModelProvider
    allowsWordLevelTimestampedTranscript?: boolean
}
