import { Injectable } from '@nestjs/common';
import { API_KEY } from '@repo/shared/enums/ApiKey';
import { LipSyncAudio } from '@repo/shared/types/talkingHead';
import { ELEVENLABS_FALLBACK_VOICE_ID_FEMALE, ELEVENLABS_FALLBACK_VOICE_ID_MALE } from '../constants/constants';
import { ConfigProvider } from '../utils/configProvider';
import { b64ToArrayBuffer } from '../utils/lipsyncUtils';
import {
  GetTimestampedAudioParamsWithModelName,
  GetTTSAudioParamsWithModelName,
  SpeechAudioResult,
} from '../types/universalApi.types';
import { ElevenLabsTimestampedResponse } from '../types/elevenlabs.types';

@Injectable()
export class ElevenLabsApiService {
  constructor(private readonly configProvider: ConfigProvider) {}

  public async textToSpeech(
    params: GetTTSAudioParamsWithModelName,
  ): Promise<SpeechAudioResult> {
    const {
      inputMessage,
      personality,
      language,
      responseFormat,
      modelApiName,
      sampleRate,
    } = params;

    const elevenLabsApiKey = this.configProvider.getApiKey(API_KEY.ELEVENLABS);

    try {
      const outputFormat =
              responseFormat === 'pcm' ? `pcm_${sampleRate}` : `mp3_${sampleRate}_32`;
      let voiceId = personality.elevenlabsVoiceId;
      if (!voiceId) {
        if (personality.sex == 'F') {
          voiceId = ELEVENLABS_FALLBACK_VOICE_ID_FEMALE;
        } else {
          voiceId = ELEVENLABS_FALLBACK_VOICE_ID_MALE;
        }
      }

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${outputFormat}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': elevenLabsApiKey,
          },
          body: JSON.stringify({
            text: inputMessage,
            model_id: modelApiName,
            language: language.ISO639,
            voice_settings: {
              stability: 0,
              similarity_boost: 0,
              style: 0,
              speed: 1.0,
            },
          }),
        },
      );

      if (!response.ok) {
        console.error('ElevenLabs API failed: ', response.status, response.statusText);

        return {
          buffer: new ArrayBuffer(0),
          sampleRate: 0,
        };
      }

      const arrayBuffer = await response.arrayBuffer();

      return {
        buffer: arrayBuffer,
        sampleRate: sampleRate,
      };
    } catch (error) {
      console.error('Error converting text to speech using ElevenLabs:', error);

      return {
        buffer: new ArrayBuffer(0),
        sampleRate: 0,
      };
    }
  }

  public async getTextToSpeechTimestamped(
    params: GetTimestampedAudioParamsWithModelName,
  ): Promise<LipSyncAudio> {
    const { inputMessage, personality, language, modelApiName, sampleRate } = params;

    const elevenLabsApiKey = this.configProvider.getApiKey(API_KEY.ELEVENLABS);

    try {
      let voiceId = personality.elevenlabsVoiceId;
      if (!voiceId) {
        if (personality.sex == 'F') {
          voiceId = ELEVENLABS_FALLBACK_VOICE_ID_FEMALE;
        } else {
          voiceId = ELEVENLABS_FALLBACK_VOICE_ID_MALE;
        }
      }
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=pcm_${sampleRate}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': elevenLabsApiKey,
          },
          body: JSON.stringify({
            text: inputMessage,
            model_id: modelApiName,
            language: language.ISO639,
            voice_settings: {
              stability: 0,
              similarity_boost: 0,
              style: 0,
              speed: 1.0,
            },
          }),
        },
      );

      if (!response.ok) {
        console.error('ElevenLabs API failed: ', response.status, response.statusText);

        return {
          audio: [],
          words: [],
          wtimes: [],
          wdurations: [],
        };
      }

      const jsonResponse =
              (await response.json()) as ElevenLabsTimestampedResponse;
      const lipSyncAudio: LipSyncAudio = {
        audio: [],
        words: [],
        wtimes: [],
        wdurations: [],
      };

      if (jsonResponse.audio_base64) {
        lipSyncAudio.audio.push(b64ToArrayBuffer(jsonResponse.audio_base64));
      }

      const alignment =
              jsonResponse.alignment ?? jsonResponse.normalized_alignment;

      if (alignment) {
        let word = '';
        let time = 0;
        let duration = 0;

        for (let i = 0; i < alignment.characters.length; i++) {
          const startTime = alignment.character_start_times_seconds[i] ?? 0;
          const char = alignment.characters[i];
          if (word.length === 0) {
            time = startTime * 1000;
          }
          if (word.length > 0 && char === ' ') {
            lipSyncAudio.words.push(word);
            lipSyncAudio.wtimes.push(time);
            lipSyncAudio.wdurations.push(duration);
            word = '';
            duration = 0;
          } else if (char !== ' ') {
            const endTime = alignment.character_end_times_seconds[i] ?? 0;
            const charDuration = (endTime - startTime) * 1000;
            duration += charDuration;
            word += char;
          }
        }

        if (word.length > 0) {
          lipSyncAudio.words.push(word);
          lipSyncAudio.wtimes.push(time);
          lipSyncAudio.wdurations.push(duration);
        }
      }

      return lipSyncAudio;
    } catch (error) {
      console.error('Error converting text to speech using ElevenLabs:', error);

      return {
        audio: [],
        words: [],
        wtimes: [],
        wdurations: [],
      };
    }
  }
}
