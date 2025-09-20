import type { LipSyncAudio as BaseLipSyncAudio } from '@repo/shared/types/talkingHead';
import type { Vector3 } from 'three';

export interface TalkingHeadOptions {
  jwtGet?: (() => string | Promise<string>) | null;
  ttsEndpoint?: string | null;
  ttsApikey?: string | null;
  ttsTrimStart?: number;
  ttsTrimEnd?: number;
  ttsLang?: string;
  ttsVoice?: string;
  ttsRate?: number;
  ttsPitch?: number;
  ttsVolume?: number;
  mixerGainSpeech?: number | null;
  mixerGainBackground?: number | null;
  lipsyncLang?: string;
  lipsyncModules?: string[];
  pcmSampleRate?: number;
  modelRoot?: string;
  modelPixelRatio?: number;
  modelFPS?: number;
  modelMovementFactor?: number;
  cameraView?: 'full' | 'mid' | 'upper' | 'head';
  cameraDistance?: number;
  cameraX?: number;
  cameraY?: number;
  cameraRotateX?: number;
  cameraRotateY?: number;
  cameraRotateEnable?: boolean;
  cameraPanEnable?: boolean;
  cameraZoomEnable?: boolean;
  lightAmbientColor?: number;
  lightAmbientIntensity?: number;
  lightDirectColor?: number;
  lightDirectIntensity?: number;
  lightDirectPhi?: number;
  lightDirectTheta?: number;
  lightSpotIntensity?: number;
  lightSpotColor?: number;
  lightSpotPhi?: number;
  lightSpotTheta?: number;
  lightSpotDispersion?: number;
  avatarMood?: string;
  avatarMute?: boolean;
  avatarIdleEyeContact?: number;
  avatarIdleHeadMove?: number;
  avatarSpeakingEyeContact?: number;
  avatarSpeakingHeadMove?: number;
  avatarIgnoreCamera?: boolean;
  listeningSilenceThresholdLevel?: number;
  listeningSilenceThresholdMs?: number;
  listeningSilenceDurationMax?: number;
  listeningActiveThresholdLevel?: number;
  listeningActiveThresholdMs?: number;
  listeningActiveDurationMax?: number;
  statsNode?: HTMLElement | null;
  statsStyle?: string | null;
}

export interface AvatarBaseline {
  [morphTarget: string]: number;
}

export interface AvatarConfig {
  url: string;
  body?: string;
  lipsyncLang?: string;
  ttsLang?: string;
  ttsVoice?: string;
  ttsRate?: number;
  ttsPitch?: number;
  ttsVolume?: number;
  avatarMood?: string;
  avatarMute?: boolean;
  avatarIdleEyeContact?: number;
  avatarIdleHeadMove?: number;
  avatarSpeakingEyeContact?: number;
  avatarSpeakingHeadMove?: number;
  avatarIgnoreCamera?: boolean;
  baseline?: AvatarBaseline;
  modelDynamicBones?: unknown;
}

export interface ProgressEvent {
  lengthComputable: boolean;
  loaded: number;
  total: number;
}

export type ProgressCallback = (event: ProgressEvent) => void;

export type SubtitleCallback = (element: HTMLElement) => void;

export type MarkerCallback = () => void;

export interface AnimationTemplate {
  name: string;
  [key: string]: unknown;
}

export type AudioBufferSource = ArrayBuffer | ArrayBuffer[] | AudioBuffer;

export interface LipSyncAudioInput extends Omit<BaseLipSyncAudio, 'audio'> {
  audio: AudioBufferSource;
  visemes?: string[];
  vtimes?: number[];
  vdurations?: number[];
  markers?: (MarkerCallback | string)[];
  mtimes?: number[];
  anim?: AnimationTemplate;
}

export interface SpeakTextOptions {
  lipsyncLang?: string;
  avatarMute?: boolean;
  avatarMood?: string;
  ttsLang?: string;
  ttsVoice?: string;
  ttsRate?: number;
  ttsPitch?: number;
  ttsVolume?: number;
}

export interface SpeakAudioOptions {
  lipsyncLang?: string;
}

export interface ViewOptions {
  cameraX?: number;
  cameraY?: number;
  cameraDistance?: number;
  cameraRotateX?: number;
  cameraRotateY?: number;
}

export interface LightingOptions {
  lightAmbientColor?: number;
  lightAmbientIntensity?: number;
  lightDirectColor?: number;
  lightDirectIntensity?: number;
  lightDirectPhi?: number;
  lightDirectTheta?: number;
  lightSpotIntensity?: number;
  lightSpotColor?: number;
  lightSpotPhi?: number;
  lightSpotTheta?: number;
  lightSpotDispersion?: number;
}

export interface ListeningOptions {
  listeningSilenceThresholdLevel?: number;
  listeningSilenceThresholdMs?: number;
  listeningSilenceDurationMax?: number;
  listeningActiveThresholdLevel?: number;
  listeningActiveThresholdMs?: number;
  listeningActiveDurationMax?: number;
}

export interface IKSolverLink {
  link: string;
  minAngle?: number;
  maxAngle?: number;
  minx?: number;
  miny?: number;
  minz?: number;
  maxx?: number;
  maxy?: number;
  maxz?: number;
}

export interface IKSolverConfig {
  root: string;
  effector: string;
  links: IKSolverLink[];
  iterations?: number;
}

export declare class TalkingHead {
  constructor(node: HTMLElement, options?: TalkingHeadOptions | null);

  readonly nodeAvatar: HTMLElement;
  readonly opt: TalkingHeadOptions;
  avatar?: AvatarConfig;

  showAvatar(avatar: AvatarConfig, onprogress?: ProgressCallback | null): Promise<void>;
  getViewNames(): Array<'full' | 'mid' | 'upper' | 'head'>;
  getView(): 'full' | 'mid' | 'upper' | 'head' | undefined;
  setView(view: 'full' | 'mid' | 'upper' | 'head', options?: ViewOptions | null): void;
  setLighting(options: LightingOptions): void;
  render(): void;
  onResize(): void;

  speakText(
    text: string,
    options?: SpeakTextOptions | null,
    onsubtitles?: SubtitleCallback | null,
    excludes?: Array<[number, number]> | null,
  ): void;
  speakAudio(audio: LipSyncAudioInput, options?: SpeakAudioOptions | null, onsubtitles?: SubtitleCallback | null): void;
  speakEmoji(emoji: string): Promise<void>;
  speakBreak(durationMs: number): Promise<void>;
  speakMarker(onmarker: MarkerCallback): Promise<void>;
  playBackgroundAudio(url: string): Promise<void>;
  stopBackgroundAudio(): void;
  setReverb(url?: string | null): Promise<void>;
  setMixerGain(speech: number | null, background?: number | null, fadeSecs?: number): void;
  pauseSpeaking(): void;
  stopSpeaking(): void;
  makeEyeContact(durationMs: number): void;
  lookAhead(durationMs: number): void;
  lookAtCamera(durationMs: number): void;
  lookAt(x: number, y: number, durationMs: number): void;
  touchAt(x: number, y: number): void;
  speakWithHands(delay?: number, probability?: number): void;
  getSlowdownRate(): number;
  setSlowdownRate(rate: number): void;
  getAutoRotateSpeed(): number;
  setAutoRotateSpeed(speed: number): void;
  start(): void;
  stop(): void;
  startListening(analyzer: AnalyserNode, options?: ListeningOptions, onchange?: (() => void) | null): void;
  stopListening(): void;
  stopAnimation(): void;
  stopPose(): void;
  playGesture(name: string, durationSeconds?: number, mirror?: boolean, transitionMs?: number): void;
  stopGesture(transitionMs?: number): void;
  playAnimation(
    url: string,
    onprogress?: ProgressCallback | null,
    durationSeconds?: number,
    clipIndex?: number,
    scale?: number,
  ): Promise<void>;
  playPose(
    url: string,
    onprogress?: ProgressCallback | null,
    durationSeconds?: number,
    clipIndex?: number,
    scale?: number,
  ): Promise<void>;
  ikSolve(ik: IKSolverConfig, target?: Vector3 | null, relative?: boolean, durationMs?: number | null): void;
}
