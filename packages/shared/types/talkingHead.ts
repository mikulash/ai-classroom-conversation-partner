export interface LipSyncAudio {
  audio: ArrayBuffer[];
  words: string[];
  wtimes: number[];
  wdurations: number[];
}

export interface TextToSpeechTimestampedResponse {
    audio: string[]; // Base64 encoded strings
    words: string[];
    wtimes: number[];
    wdurations: number[];
}
