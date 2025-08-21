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
  channels: number = 1,
  bytesPerSample: number = 2,
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
