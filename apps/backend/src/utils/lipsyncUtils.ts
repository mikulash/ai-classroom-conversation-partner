import { LipSyncAudio } from '@repo/shared/types/talkingHead';
import { LanguageDto } from '../dtos/replies.dto';
import { universalApi } from '../ai-api/universalApi';

/**
 * Encodes raw PCM data as a WAV file.
 * Based on the encode-wav repository: https://github.com/meandavejustice/encodeWAV/tree/master by David Adam Justice.
 * @param samples - The raw PCM audio data as an ArrayBuffer.
 * @param sampleRate - The sample rate of the audio data.
 * @param channels - The number of channels (default is 1 for mono).
 * @param bytesPerSample - The number of bytes per sample (default is 2 for 16-bit audio).
 * @returns An ArrayBuffer containing the WAV file data.
 */
export function encodeWAV(
  samples: ArrayBuffer,
  sampleRate: number,
  channels = 1,
  bytesPerSample = 2,
): ArrayBuffer {
  const headerSize = 44;
  const dataLength = samples.byteLength;
  const totalLength = headerSize + dataLength;
  const buffer = new ArrayBuffer(totalLength);
  const view = new DataView(buffer);
  let offset = 0;

  function writeString(view: DataView, offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  // RIFF identifier.
  writeString(view, offset, 'RIFF');
  offset += 4;
  // File length minus the first 8 bytes.
  view.setUint32(offset, totalLength - 8, true);
  offset += 4;
  // RIFF type.
  writeString(view, offset, 'WAVE');
  offset += 4;
  // fmt chunk identifier.
  writeString(view, offset, 'fmt ');
  offset += 4;
  // fmt chunk length.
  view.setUint32(offset, 16, true);
  offset += 4;
  // Audio format (1 for PCM).
  view.setUint16(offset, 1, true);
  offset += 2;
  // Number of channels.
  view.setUint16(offset, channels, true);
  offset += 2;
  // Sample rate.
  view.setUint32(offset, sampleRate, true);
  offset += 4;
  // Byte rate (sampleRate * channels * bytesPerSample).
  view.setUint32(offset, sampleRate * channels * bytesPerSample, true);
  offset += 4;
  // Block align (channels * bytesPerSample).
  view.setUint16(offset, channels * bytesPerSample, true);
  offset += 2;
  // Bits per sample.
  view.setUint16(offset, bytesPerSample * 8, true);
  offset += 2;
  // Data chunk identifier.
  writeString(view, offset, 'data');
  offset += 4;
  // Data chunk length.
  view.setUint32(offset, dataLength, true);
  offset += 4;

  // Copy the PCM samples.
  const pcmData = new Uint8Array(samples);
  const wavData = new Uint8Array(buffer, offset, dataLength);
  wavData.set(pcmData);

  return buffer;
}

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
  bytesPerSample = 2,
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
  bytesPerSample = 2,
  channels = 1,
  userId: string,
  language: LanguageDto,
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
  const transcription = await universalApi.getTimestampedTranscription({
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
