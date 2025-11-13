export const UserRole = {
  basic: 'basic',
  admin: 'admin',
  owner: 'owner',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const ConversationType = {
  VoiceOnly: 'VoiceOnly',
  Video: 'Video',
  TextOnly: 'TextOnly',
  TextWithAudio: 'TextWithAudio',
} as const;

export type ConversationType = (typeof ConversationType)[keyof typeof ConversationType]


export const OpenAiVoiceName = {
  alloy: 'alloy',
  ash: 'ash',
  ballad: 'ballad',
  coral: 'coral',
  echo: 'echo',
  fable: 'fable',
  onyx: 'onyx',
  nova: 'nova',
  sage: 'sage',
  shimmer: 'shimmer',
  verse: 'verse',
} as const;

export type OpenAiVoiceName = (typeof OpenAiVoiceName)[keyof typeof OpenAiVoiceName]

export const Sex = {
  F: 'F',
  M: 'M',
} as const;

export type Sex = (typeof Sex)[keyof typeof Sex]


export const ResponseModelProvider = {
  OpenAi: 'OpenAi',
  xAi: 'xAi',
  Anthropic: 'Anthropic',
} as const;

export type ResponseModelProvider = (typeof ResponseModelProvider)[keyof typeof ResponseModelProvider]


export const TtsModelProvider = {
  OpenAi: 'OpenAi',
  ElevenLabs: 'ElevenLabs',
} as const;

export type TtsModelProvider = (typeof TtsModelProvider)[keyof typeof TtsModelProvider]


export const RealtimeModelProvider = {
  OpenAi: 'OpenAi',
} as const;

export type RealtimeModelProvider = (typeof RealtimeModelProvider)[keyof typeof RealtimeModelProvider]


export const TranscriptionModelProvider = {
  OpenAi: 'OpenAi',
} as const;

export type TranscriptionModelProvider = (typeof TranscriptionModelProvider)[keyof typeof TranscriptionModelProvider]


export const TimestampedTranscriptionModelProvider = {
  OpenAi: 'OpenAi',
} as const;

export type TimestampedTranscriptionModelProvider = (typeof TimestampedTranscriptionModelProvider)[keyof typeof TimestampedTranscriptionModelProvider]
