import { LipSyncAudio } from '@repo/shared/types/talkingHead';
import { encodeWAV } from '@repo/shared/utils/encodeWav';
import { getTimestampedTranscription } from '../api_universal/getTimestampedTranscription';
import { Language } from '@repo/shared/types/language';

/**
 * Converts a raw PCM ArrayBuffer into a WAV file format.
 * based on example of TalkingHead connection with ElevenLabs; from https://github.com/met4citizen/TalkingHead/blob/main/index.html by Mika Suominen
 * creates approximate timings for each word
 * @param arrayBuffer
 * @param response
 * @param sampleRate
 * @param bytesPerSample
 * @returns
 */
export function getLipSyncAudioApproximately(
  arrayBuffer: ArrayBuffer,
  response: string,
  sampleRate: number,
  bytesPerSample: number = 2,
): LipSyncAudio {
  const words = response.split(/\s+/);
  const totalDuration =
        (arrayBuffer.byteLength / bytesPerSample / sampleRate) * 1000; // ms

  let currentTime = 0;
  const avgWordDuration = totalDuration / words.length;

  const wtimes: number[] = [];
  const wdurations: number[] = [];

  // Generate approximate timings for each word
  for (const word of words) {
    if (word.trim()) {
      const wordDuration = Math.max(200, avgWordDuration * (word.length / 5));
      wtimes.push(currentTime);
      wdurations.push(wordDuration);
      currentTime += wordDuration;
    }
  }

  return {
    audio: [arrayBuffer],
    words,
    wtimes,
    wdurations,
  };
}

/**
 * Converts a raw PCM ArrayBuffer into a WAV file format and uses OpenAI's Whisper API to get precise word-level timings.
 * @param arrayBuffer
 * @param sampleRate
 * @param bytesPerSample
 * @param channels
 * @param userId
 * @param language
 */
export async function getPreciseLipSyncAudio(
  arrayBuffer: ArrayBuffer,
  sampleRate: number,
  bytesPerSample: number = 2,
  channels: number = 1,
  userId: string,
  language: Language,
): Promise<LipSyncAudio> {
  // Convert the raw PCM ArrayBuffer into a WAV file
  const wavBuffer = encodeWAV(
    arrayBuffer,
    sampleRate,
    channels,
    bytesPerSample,
  );
  const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
  const audioFile = new File([wavBlob], 'audio.wav', { type: 'audio/wav' });

  // The transcription API is called with word-level granularity for precise timings.
  const transcription = await getTimestampedTranscription({
    audioFile: audioFile,
    language: language,
  }, userId);

  // Prepare arrays to store words and timing data.
  const words: string[] = [];
  const wtimes: number[] = [];
  const wdurations: number[] = [];

  // Process the transcription result if word-level timestamps are available.
  if (transcription.words && transcription.words.length > 0) {
    transcription.words.forEach((wordObj) => {
      words.push(wordObj.word);
      // Convert start and end times from seconds to milliseconds.
      const startMs = wordObj.start * 1000;
      const endMs = wordObj.end * 1000;
      wtimes.push(startMs);
      wdurations.push(endMs - startMs);
    });
  } else {
    console.warn(
      'No word-level timestamps were provided by the transcription API.',
    );
  }

  return {
    audio: [arrayBuffer],
    words,
    wtimes,
    wdurations,
  };
}

/**
 * copied from talking head class to avoid necessary reference to the instance passing
 * @param chunk
 */
export function b64ToArrayBuffer(chunk: string) {
  const b64Chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const b64Lookup =
        typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
  for (let i = 0; i < b64Chars.length; i++) {
    b64Lookup[b64Chars.charCodeAt(i)] = i;
  }

  // Calculate the needed total buffer length
  let bufLen = (3 * chunk.length) / 4;
  if (chunk.endsWith('=')) {
    bufLen--;
    if (chunk[chunk.length - 2] === '=') {
      bufLen--;
    }
  }

  // Create the ArrayBuffer
  const arrBuf = new ArrayBuffer(bufLen);
  const arr = new Uint8Array(arrBuf);
  let i;
  let p = 0;
  let c1;
  let c2;
  let c3;
  let c4;

  // Populate the buffer
  for (i = 0; i < chunk.length; i += 4) {
    c1 = b64Lookup[chunk.charCodeAt(i)] ?? 0;
    c2 = b64Lookup[chunk.charCodeAt(i + 1)] ?? 0;
    c3 = b64Lookup[chunk.charCodeAt(i + 2)] ?? 0;
    c4 = b64Lookup[chunk.charCodeAt(i + 3)] ?? 0;
    arr[p++] = (c1 << 2) | (c2 >> 4);
    arr[p++] = ((c2 & 15) << 4) | (c3 >> 2);
    arr[p++] = ((c3 & 3) << 6) | (c4 & 63);
  }

  return arrBuf;
}
