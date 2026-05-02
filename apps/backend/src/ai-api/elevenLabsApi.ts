import { Injectable } from '@nestjs/common';
import { API_KEY } from '@repo/shared/enums/ApiKey';
import { TextToSpeechTimestampedResponseDto } from '../dtos/replies.dto';
import { ConfigProvider } from '../utils/configProvider';
import { EnvConfigService } from '../core/config/env-config.service';
import {
  GetTimestampedAudioParamsWithModelName,
  GetTTSAudioParamsWithModelName,
  SpeechAudioResult,
} from '../types/universalApi.types';
import { ElevenLabsTimestampedResponse } from '../types/elevenlabs.types';
import { HttpStatusError } from '../utils/httpStatusError';

@Injectable()
export class ElevenLabsApiService {
  constructor(
    private readonly configProvider: ConfigProvider,
    private readonly envConfig: EnvConfigService,
  ) {}

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

    const outputFormat =
            responseFormat === 'pcm' ? `pcm_${sampleRate}` : `mp3_${sampleRate}_32`;
    let voiceId = personality.elevenlabsVoiceId;
    voiceId ??= this.getFallbackVoiceId(personality.sex);

    let response: Response;
    try {
      response = await fetch(
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
              speed: 1,
            },
          }),
        },
      );
    } catch {
      throw new HttpStatusError('Error converting text to speech using ElevenLabs', 502);
    }

    if (!response.ok) {
      throw new HttpStatusError(`ElevenLabs API failed: ${response.statusText}`, response.status);
    }

    const arrayBuffer = await response.arrayBuffer();

    return {
      buffer: arrayBuffer,
      sampleRate: sampleRate,
    };
  }

  public async getTextToSpeechTimestamped(
    params: GetTimestampedAudioParamsWithModelName,
  ): Promise<TextToSpeechTimestampedResponseDto> {
    const { inputMessage, personality, language, modelApiName, sampleRate } = params;

    const elevenLabsApiKey = this.configProvider.getApiKey(API_KEY.ELEVENLABS);

    let voiceId = personality.elevenlabsVoiceId;
    voiceId ??= this.getFallbackVoiceId(personality.sex);

    let response: Response;
    try {
      response = await fetch(
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
              speed: 1,
            },
          }),
        },
      );
    } catch {
      throw new HttpStatusError('Error converting text to speech using ElevenLabs', 502);
    }

    if (!response.ok) {
      throw new HttpStatusError(`ElevenLabs API failed: ${response.statusText}`, response.status);
    }

    const jsonResponse =
            (await response.json()) as ElevenLabsTimestampedResponse;
    const timestampedSpeech: TextToSpeechTimestampedResponseDto = {
      audio: [],
      words: [],
      wtimes: [],
      wdurations: [],
    };

    if (jsonResponse.audio_base64) {
      timestampedSpeech.audio.push(jsonResponse.audio_base64);
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
          timestampedSpeech.words.push(word);
          timestampedSpeech.wtimes.push(time);
          timestampedSpeech.wdurations.push(duration);
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
        timestampedSpeech.words.push(word);
        timestampedSpeech.wtimes.push(time);
        timestampedSpeech.wdurations.push(duration);
      }
    }

    return timestampedSpeech;
  }

  private getFallbackVoiceId(sex?: string | null): string {
    const voiceId = sex === 'F' ?
      this.envConfig.elevenLabsFallbackVoiceIdFemale :
      this.envConfig.elevenLabsFallbackVoiceIdMale;
    if (!voiceId) {
      throw new HttpStatusError('No ElevenLabs fallback voice configured', 500);
    }
    return voiceId;
  }
}
