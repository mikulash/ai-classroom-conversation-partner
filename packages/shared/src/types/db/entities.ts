import {
  ConversationType,
  OpenAiVoiceName,
  RealtimeModelProvider,
  ResponseModelProvider,
  Sex,
  TimestampedTranscriptionModelProvider,
  TranscriptionModelProvider,
  TtsModelProvider,
  UserRole,
} from '../generated/enums';
import { ConversationLog } from '../conversationLog';
import { ConversationMessage } from '../conversationMessage';


export interface Conversation {
    id: number
    createdAt: Date
    userId: string
    personalityId: number | null
    scenarioId: number | null
    startTime: Date
    endTime: Date
    endedReason: string
    messages: ConversationMessage[] | null
    logs: ConversationLog[] | null
    conversationType: ConversationType
}

export interface ConversationCreate {
    createdAt?: Date | string
    userId: string
    personalityId?: number | null
    scenarioId?: number | null
    startTime: Date | string
    endTime?: Date | string
    endedReason?: string
    messages?: ConversationMessage[] | null
    logs?: ConversationLog[] | null
    conversationType: ConversationType
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
    involvedPersonalityId: number | null
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
