import { ModelOptions } from './configProvider';
import prisma from '../clients/prisma';

export const fetchAppConfig = async () => {
  const app_config = await prisma.appConfig.findFirst();
  if (!app_config) {
    throw new Error('App Config not found');
  }
  return app_config;
};

export const fetchModelOptions = async () => {
  try {
    const [responseModels, ttsModels, realtimeModels, timestampedTranscriptionModels, realtimeTranscriptionModels] =
            await Promise.all([
              prisma.responseModel.findMany(),
              prisma.ttsModel.findMany(),
              prisma.realtimeModel.findMany(),
              prisma.timestampedTranscriptionModel.findMany(),
              prisma.realtimeTranscriptionModel.findMany(),
            ]);

    const modelOptions: ModelOptions = {
      responseModels,
      ttsModels,
      realtimeModels,
      timestampedTranscriptionModels,
      realtimeTranscriptionModels,
    };

    return modelOptions;
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`Failed to fetch model options: ${error}`);
  }
};

export const fetchUserCustomModelConfig = async (userId: string) => {
  try {
    const data = await prisma.adminUserCustomModelSelection.findUnique({
      where: { userId },
    });

    if (!data) {
      console.warn('Could not fetch user model config for userId:', userId);
      return null;
    }
    return data;
  } catch (error) {
    console.warn('Error fetching user model config:', error);
    return null;
  }
};

