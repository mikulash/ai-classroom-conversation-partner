import {
  OpenAiVoiceName,
  RealtimeModelProvider,
  ResponseModelProvider,
  Sex,
  TimestampedTranscriptionModelProvider,
  TranscriptionModelProvider,
  TtsModelProvider,
  UserRole,
} from '../generated/enums';

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
    involvedPersonalityId: number | null
    situationDescriptionEn?: string
    settingEn?: string
    situationDescriptionCs?: string
    settingCs?: string
}

export interface Profile {
    id: string
    createdAt: Date
    updatedAt: Date
    fullName: string
    gender: string
    userRole: UserRole
    conversationRole: string
    bio: string
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
