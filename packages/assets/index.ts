export { TalkingHead } from './TalkingHead-1.4.0/modules/talkinghead.mjs';
export type {
  AnimationTemplate,
  AudioBufferSource,
  AvatarConfig,
  IKSolverConfig,
  IKSolverLink,
  LightingOptions,
  ListeningOptions,
  MarkerCallback,
  ProgressCallback,
  SpeakAudioOptions,
  SpeakTextOptions,
  SubtitleCallback,
  TalkingHeadOptions,
  ViewOptions,
  LipSyncAudioInput,
} from './TalkingHead-1.4.0/modules/talkinghead.mjs';

export const AVATAR_MODELS = {
  FEMALE_TEEN: new URL('./avatars/female_teen.glb', import.meta.url).href,
  MALE_TEEN: new URL('./avatars/male_teen.glb', import.meta.url).href,
};
