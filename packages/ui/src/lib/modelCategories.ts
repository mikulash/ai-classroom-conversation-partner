import { AppConfigModel } from '@repo/frontend-utils/src/models';
import { ModelOptionsWithAvailability, ModelSelection } from './types/modelSelection';

/**
 * The five model categories that drive both admin model-selection pages.
 *
 * Centralised so a new category is a one-line change instead of editing
 * five duplicated JSX blocks across two pages.
 */
export interface ModelCategory {
  key: keyof ModelSelection;
  /** i18n key used on the admin "global" model selection page. */
  globalLabelKey: string;
  /** i18n key used on the admin "custom" model selection page (translations differ slightly). */
  customLabelKey: string;
  modelsKey: keyof ModelOptionsWithAvailability;
  configIdKey: keyof AppConfigModel;
}

export const MODEL_CATEGORIES: ModelCategory[] = [
  {
    key: 'responseModel',
    globalLabelKey: 'models.responseModel',
    customLabelKey: 'responseModel',
    modelsKey: 'responseModels',
    configIdKey: 'responseModelId',
  },
  {
    key: 'ttsModel',
    globalLabelKey: 'models.ttsModel',
    customLabelKey: 'ttsModel',
    modelsKey: 'ttsModels',
    configIdKey: 'ttsModelId',
  },
  {
    key: 'realtimeModel',
    globalLabelKey: 'models.realtimeModel',
    customLabelKey: 'realtimeModel',
    modelsKey: 'realtimeModels',
    configIdKey: 'realtimeModelId',
  },
  {
    key: 'timestampedTranscriptionModel',
    globalLabelKey: 'models.timestampedTranscriptionModel',
    customLabelKey: 'models.timestampedTranscriptionModel',
    modelsKey: 'timestampedTranscriptionModels',
    configIdKey: 'timestampedTranscriptionModelId',
  },
  {
    key: 'realtimeTranscriptionModel',
    globalLabelKey: 'models.realtimeTranscriptionModel',
    customLabelKey: 'models.realtimeTranscriptionModel',
    modelsKey: 'realtimeTranscriptionModels',
    configIdKey: 'realtimeTranscriptionModelId',
  },
];
