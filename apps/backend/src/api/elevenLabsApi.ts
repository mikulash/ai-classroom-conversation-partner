import { API_KEY } from '@repo/shared/enums/ApiKey';
import { ConfigProvider } from '../utils/configProvider';
import { ElevenLabsTimestampedResponse, GetTTSAudioResponse } from '@repo/shared/types/apiFigurantClient';
import { LipSyncAudio } from '@repo/shared/types/talkingHead';
import { b64ToArrayBuffer } from '../utils/lipsyncUtils';
import { GetTimestampedAudioParamsWithModelName, GetTTSAudioParamsWithModelName } from '../types/api';

const getTextToSpeech = async (
  params: GetTTSAudioParamsWithModelName,
): Promise<GetTTSAudioResponse> => {
  const {
    inputMessage,
    personality,
    language,
    response_format,
    model_api_name,
    sample_rate,
  } = params;

  const apiKeysProvider = await ConfigProvider.getInstance();
  const ELEVENLABS_API_KEY = apiKeysProvider.getApiKey(API_KEY.ELEVENLABS);

  try {
    const output_format =
      response_format === 'pcm' ? `pcm_${sample_rate}` : `mp3_${sample_rate}_32`;
    let voice_id = personality.elevenlabs_voice_id;
    if (!voice_id) {
      if (personality.sex == 'F') {
        voice_id = process.env.ELEVENLABS_FALLBACK_VOICE_ID_FEMALE || '';
      } else {
        voice_id = process.env.ELEVENLABS_FALLBACK_VOICE_ID_MALE || '';
      }
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}?output_format=${output_format}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: inputMessage,
          model_id: model_api_name,
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
        blob: new Blob([], { type: `audio/${response_format}` }),
        objectUrl: '',
        buffer: new ArrayBuffer(0),
        sampleRate: 0,
      };
    }

    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: `audio/${response_format}` });
    const objectUrl = URL.createObjectURL(blob);

    return {
      blob,
      objectUrl,
      buffer: arrayBuffer,
      sampleRate: sample_rate,
    };
  } catch (error) {
    console.error('Error converting text to speech using ElevenLabs:', error);

    return {
      blob: new Blob([], { type: `audio/${response_format}` }),
      objectUrl: '',
      buffer: new ArrayBuffer(0),
      sampleRate: 0,
    };
  }
};

const getTextToSpeechTimestamped = async (
  params: GetTimestampedAudioParamsWithModelName,
): Promise<LipSyncAudio> => {
  const { inputMessage, personality, language, model_api_name, sample_rate } = params;

  const apiKeysProvider = await ConfigProvider.getInstance();
  const ELEVENLABS_API_KEY = apiKeysProvider.getApiKey(API_KEY.ELEVENLABS);

  try {
    let voice_id = personality.elevenlabs_voice_id;
    if (!voice_id) {
      // female and male fallback voice ids
      if (personality.sex == 'F') {
        voice_id = process.env.ELEVENLABS_FALLBACK_VOICE_ID_FEMALE || '';
      } else {
        voice_id = process.env.ELEVENLABS_FALLBACK_VOICE_ID_MALE || '';
      }
    }
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}/with-timestamps?output_format=pcm_${sample_rate}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: inputMessage,
          model_id: model_api_name,
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

    // For the timestamped endpoint, the response is a JSON object
    // mapping into lipsync object for talking head based on TalkingHead usage examples
    // based on example of TalkingHead connection with ElevenLabs; from https://github.com/met4citizen/TalkingHead/blob/main/index.html by Mika Suominen
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
      jsonResponse?.alignment || jsonResponse?.normalized_alignment;

    if (alignment) {
      // Parse characters into words
      let word = '';
      let time = 0;
      let duration = 0;

      for (let i = 0; i < alignment.characters.length; i++) {
        const startTime = alignment.character_start_times_seconds?.[i] ?? 0;
        const char = alignment.characters[i];
        // If this is the start of a new word, record the start time
        if (word.length === 0) {
          // Convert from seconds to milliseconds

          time = startTime * 1000;
        }
        // If we encounter a space, and we have accumulated characters, we've found a word
        if (word.length > 0 && char === ' ') {
          lipSyncAudio.words.push(word);
          lipSyncAudio.wtimes.push(time);
          lipSyncAudio.wdurations.push(duration);
          // Reset for the next word
          word = '';
          duration = 0;
        } else if (char !== ' ') {
          // Calculate the duration of this character in milliseconds
          const endTime = alignment.character_end_times_seconds?.[i] ?? 0;
          const charDuration = (endTime - startTime) * 1000;
          duration += charDuration;
          word += char;
        }
      }

      // Add the last word if there is one
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
};

export const elevenLabsApi = { textToSpeech: getTextToSpeech, getTextToSpeechTimestamped };
