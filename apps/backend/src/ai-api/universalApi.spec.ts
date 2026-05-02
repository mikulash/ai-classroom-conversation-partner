import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { InternalServerErrorException } from '@nestjs/common';
import { OpenAiVoiceName } from '../generated/prisma/enums';
import { LanguageDto } from '../dtos/replies.dto';
import { GetResponseParams, GetResponseParamsWithModelName } from '../types/universalApi.types';
import { ConfigProvider } from '../utils/configProvider';
import { AnthropicApiService } from './anthropicApi';
import { ElevenLabsApiService } from './elevenLabsApi';
import { OpenAiApiService } from './openAiApi';
import { UniversalApiService } from './universalApi';
import { XAiApiService } from './xAiApi';

const language: LanguageDto = {
  BCP47: 'en-US',
  ISO639: 'en',
  ENGLISH_NAME: 'English',
  NATIVE_NAME: 'English',
};

function responseParams(): GetResponseParams {
  return {
    inputText: 'Hello',
    previousMessages: [],
    personality: {
      id: 1,
      name: 'Guide',
      openaiVoiceName: OpenAiVoiceName.alloy,
    },
    conversationRole: 'student',
    language,
    scenario: null,
    userProfile: {
      id: 'user-1',
      userRole: 'basic',
    },
  };
}

function createUniversalApiService(args: {
  configProvider: object;
  openAiApi?: object;
  anthropicApi?: object;
  xAiApi?: object;
  elevenLabsApi?: object;
}): UniversalApiService {
  return new UniversalApiService(
    args.configProvider as unknown as ConfigProvider,
    (args.openAiApi ?? {}) as unknown as OpenAiApiService,
    (args.anthropicApi ?? {}) as unknown as AnthropicApiService,
    (args.xAiApi ?? {}) as unknown as XAiApiService,
    (args.elevenLabsApi ?? {}) as unknown as ElevenLabsApiService,
  );
}

describe('UniversalApiService', () => {
  it('dispatches text generation to the configured provider', async () => {
    let selectedModel = '';
    const service = createUniversalApiService({
      configProvider: {
        getModelsForUser: async (): Promise<object> => ({
          responseModel: {
            provider: 'OpenAi',
            apiName: 'gpt-test',
          },
        }),
      },
      openAiApi: {
        getResponse: async (params: GetResponseParamsWithModelName): Promise<string> => {
          selectedModel = params.modelApiName;
          return 'reply';
        },
      },
    });

    const response = await service.getResponse(responseParams(), 'user-1');

    assert.equal(response, 'reply');
    assert.equal(selectedModel, 'gpt-test');
  });

  it('throws a Nest exception for unsupported configured providers', async () => {
    const service = createUniversalApiService({
      configProvider: {
        getModelsForUser: async (): Promise<object> => ({
          responseModel: {
            provider: 'UnknownProvider',
            apiName: 'bad-model',
          },
        }),
      },
    });

    await assert.rejects(
      () => service.getResponse(responseParams(), 'user-1'),
      InternalServerErrorException,
    );
  });
});
