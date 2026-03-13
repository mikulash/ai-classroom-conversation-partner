import {
    RealtimeModel,
    RealtimeTranscriptionModel,
    ResponseModel,
    TimestampedTranscriptionModel,
    TtsModel,
} from '@repo/shared/types/db/entities';
import { WithAvailability } from '../filterModelsByApiKeyStatus';

export interface ModelOptions {
    responseModels: ResponseModel[];
    ttsModels: TtsModel[];
    realtimeModels: RealtimeModel[];
    timestampedTranscriptionModels: TimestampedTranscriptionModel[];
    realtimeTranscriptionModels: RealtimeTranscriptionModel[];
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
    responseModel: ResponseModel;
    ttsModel: TtsModel;
    realtimeModel: RealtimeModel;
    timestampedTranscriptionModel: TimestampedTranscriptionModel;
    realtimeTranscriptionModel: RealtimeTranscriptionModel;
}
