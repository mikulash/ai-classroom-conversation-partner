import {
    RealtimeModelModel,
    RealtimeTranscriptionModelModel,
    ResponseModelModel,
    TimestampedTranscriptionModelModel,
    TtsModelModel,
} from '@repo/frontend-utils/src/models';
import { WithAvailability } from '../filterModelsByApiKeyStatus';

export interface ModelOptions {
    responseModels: ResponseModelModel[];
    ttsModels: TtsModelModel[];
    realtimeModels: RealtimeModelModel[];
    timestampedTranscriptionModels: TimestampedTranscriptionModelModel[];
    realtimeTranscriptionModels: RealtimeTranscriptionModelModel[];
}

/**
 * model options but each model has 'available' property to indicate whether there is api key provided for it to work
 */
export type ModelOptionsWithAvailability = {
    [K in keyof ModelOptions]: ModelOptions[K] extends (infer T)[]
    ? WithAvailability<T>[]
    : ModelOptions[K]
};


export interface ModelSelection {
    responseModel: ResponseModelModel;
    ttsModel: TtsModelModel;
    realtimeModel: RealtimeModelModel;
    timestampedTranscriptionModel: TimestampedTranscriptionModelModel;
    realtimeTranscriptionModel: RealtimeTranscriptionModelModel;
}
