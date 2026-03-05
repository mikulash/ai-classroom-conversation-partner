import {
  OpenAiVoiceName,
  RealtimeModelProvider, ResponseModelProvider,
  Sex, TimestampedTranscriptionModelProvider,
  TranscriptionModelProvider, TtsModelProvider,
} from '@repo/shared/types/generated/enums';

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
    personality: { id: number; name: string; avatarUrl: string | null } | null
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

export interface InitialConversationOptions {
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
    userRole: string
    conversationRole: string
    bio: string
    email: string
    confirmedAt: Date | null
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
    messages: object[] | null
    logs: object[] | null
    conversationType: string
    personality: { id: number; name: string; avatarUrl: string | null } | null
    scenario: { id: number; situationDescriptionEn: string; situationDescriptionCs: string } | null
}


