import { Language } from '@repo/shared/types/language';
import { apiClient } from '@repo/api-client/src/figurantClient';
import { RealtimeConnection, RealtimeEvent } from '@repo/shared/types/realtimeConnection';

export async function initRealtimeTranscriptionConnection(
  onEvent: (e: RealtimeEvent) => void,
  language: Language,
): Promise<RealtimeConnection> {
  const response = await apiClient.getTranscriptionEphemeralToken(
    'pcm16',
    language,
  );
  console.log('[Realtime] Ephemeral response received', response);

  const pc = new RTCPeerConnection();
  const audioStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      sampleRate: 16000,
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
    },
  });
  audioStream.getTracks().forEach((track) => pc.addTrack(track, audioStream));

  const dc = pc.createDataChannel('oai-events');
  dc.addEventListener('open', () => console.log('[Realtime] Data channel open'));
  dc.addEventListener('message', (e) => {
    try {
      const ev = JSON.parse(e.data);
      onEvent(ev);
    } catch {
      console.log('[Realtime] Non‑JSON message', e.data);
    }
  });

  await pc.setLocalDescription(await pc.createOffer());
  const url = 'https://api.openai.com/v1/realtime?intent=transcription';
  const sdpResp = await fetch(url, {
    method: 'POST',
    body: pc.localDescription?.sdp ?? '',
    headers: {
      'Authorization': `Bearer ${response.client_secret?.value}`,
      'Content-Type': 'application/sdp',
    },
  });
  if (!sdpResp.ok) {
    throw new Error(`Realtime API error ${sdpResp.status}: ${await sdpResp.text()}`);
  }
  const answerSdp = await sdpResp.text();
  await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });
  console.log('[Realtime] WebRTC connection established');

  return {
    pc,
    dc,
    audioStream,
    close: () => {
      dc.close();
      pc.close();
      audioStream.getTracks().forEach((t) => t.stop());
    },
  };
}
