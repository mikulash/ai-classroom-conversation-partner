import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { modelApi } from '@repo/api-client/src/supabaseService';
import { apiClient } from '@repo/api-client/src/figurantClient';
import { toast } from 'sonner';
import { useAppStore } from '../../hooks/useAppStore';
import { ModelOptions, ModelSelection } from '@repo/shared/types/modelSelection';
import { useSession } from '../../hooks/useSession';
import { Loading } from '../../components/Loading';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { ModelSectionConfig, ModelSelectionForm } from '../../components/admin/ModelSelectionForm';
import {
  getAvailableRealtimeModels, getAvailableRealtimeTranscriptionModels,
  getAvailableResponseModels, getAvailableTimestampedTranscriptionModels,
  getAvailableTtsModels,
} from '@repo/shared/utils/filterModelsByApiKeyStatus';

export function AdminCustomModelSelectionPage() {
  const { t } = useTypedTranslation();
  const { session, ready } = useSession();

  const [models, setModels] = useState<ModelOptions>({
    responseModels: [],
    ttsModels: [],
    realtimeModels: [],
    timestampedTranscriptionModels: [],
    realtimeTranscriptionModels: [],
  });

  const app_config = useAppStore((state) => state.appConfig);

  // Use Partial<ModelSelection> since models might be undefined initially
  const [selection, setSelection] = useState<Partial<ModelSelection>>({
    responseModel: undefined,
    ttsModel: undefined,
    realtimeModel: undefined,
    timestampedTranscriptionModel: undefined,
    realtimeTranscriptionModel: undefined,
  });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  /** Load available models + current config */
  useEffect(() => {
    if (!session?.user) return;

    (async () => {
      const [
        { data: responseModels, error: responseError },
        { data: ttsModels, error: ttsError },
        { data: realtimeModels, error: realtimeError },
        { data: timestampedTranscriptionModels, error: timestampedError },
        { data: realtimeTranscriptionModels, error: realtimeTransError },
        { data: userCustomSettings },
        aiProvidersAvailability,
      ] = await Promise.all([
        modelApi.responseModels(),
        modelApi.ttsModels(),
        modelApi.realtimeModels(),
        modelApi.timestampedTranscriptionModels(),
        modelApi.realtimeTranscriptionModels(),
        modelApi.adminUserSelection(session?.user.id),
        apiClient.getAiProvidersAvailability(),
      ]);

      const errors = [responseError, ttsError, realtimeError, timestampedError, realtimeTransError].filter(Boolean);

      if (responseError || ttsError || realtimeError || timestampedError || realtimeTransError) {
        console.error(
          responseError?.message ??
                ttsError?.message ??
                realtimeError?.message ??
                timestampedError?.message ??
                realtimeTransError?.message,
        );
        toast.error(t('models.loadFailed'), {
          description:
                    responseError?.message ??
                    ttsError?.message ??
                    realtimeError?.message ??
                    timestampedError?.message ??
                    realtimeTransError?.message,
        });
        setLoading(false);
        return;
      }

      const userSelection = userCustomSettings ?? null;

      const filteredResponseModels = getAvailableResponseModels(aiProvidersAvailability, responseModels);
      const filteredTtsModels = getAvailableTtsModels(aiProvidersAvailability, ttsModels);
      const filteredRealtimeModels = getAvailableRealtimeModels(aiProvidersAvailability, realtimeModels);
      const filteredTimestampedTranscriptionModels = getAvailableTimestampedTranscriptionModels(aiProvidersAvailability, timestampedTranscriptionModels);
      const filteredRealtimeTranscriptionModels = getAvailableRealtimeTranscriptionModels(aiProvidersAvailability, realtimeTranscriptionModels);

      setModels({
        responseModels: filteredResponseModels,
        ttsModels: filteredTtsModels,
        realtimeModels: filteredRealtimeModels,
        timestampedTranscriptionModels: filteredTimestampedTranscriptionModels,
        realtimeTranscriptionModels: filteredRealtimeTranscriptionModels,
      });

      // Find models based on user's custom config or global config as fallback
      const findSelectedModel = <T extends { id: number }>(
        modelArray: T[],
        userModelId: number | null | undefined,
        globalModelId: number | null | undefined,
      ): T | undefined => {
        if (userModelId) {
          return modelArray.find((m) => m.id === userModelId);
        }
        if (globalModelId) {
          return modelArray.find((m) => m.id === globalModelId);
        }
        return modelArray[0];
      };

      // Set selection using the complete model objects
      setSelection({
        responseModel: findSelectedModel(
          filteredResponseModels,
          userSelection?.response_model_id,
          app_config?.response_model_id,
        ),
        ttsModel: findSelectedModel(
          filteredTtsModels,
          userSelection?.tts_model_id,
          app_config?.tts_model_id,
        ),
        realtimeModel: findSelectedModel(
          filteredRealtimeModels,
          userSelection?.realtime_model_id,
          app_config?.realtime_model_id,
        ),
        timestampedTranscriptionModel: findSelectedModel(
          filteredTimestampedTranscriptionModels,
          userSelection?.timestamped_transcription_model_id,
          app_config?.timestamped_transcription_model_id,
        ),
        realtimeTranscriptionModel: findSelectedModel(
          filteredRealtimeTranscriptionModels,
          userSelection?.realtime_transcription_model_id,
          app_config?.realtime_transcription_model_id,
        ),
      });

      setLoading(false);
    })();
  }, [session?.user, t]);

  const handleSave = async () => {
    if (!session?.user) {
      toast.error(t('loginRequiredToSave'));
      return;
    }

    setIsSaving(true);

    const { error, data } = await modelApi.upsertAdminUserSelection({
      user_id: session?.user.id,
      response_model_id: selection.responseModel?.id ?? null,
      tts_model_id: selection.ttsModel?.id ?? null,
      realtime_model_id: selection.realtimeModel?.id ?? null,
      timestamped_transcription_model_id:
        selection.timestampedTranscriptionModel?.id ?? null,
      realtime_transcription_model_id:
        selection.realtimeTranscriptionModel?.id ?? null,
    });

    if (error) {
      console.error(error.message);
      toast.error(t('saveFailed'), { description: error.message });
      setIsSaving(false);
      return;
    }

    toast.success(t('settingsSaved'), {
      description: t('customModelPreferencesSaved'),
    });

    // Update selection with data returned from the server
    const updatedSelection = { ...selection };

    if (data.response_model_id && models.responseModels) {
      updatedSelection.responseModel = models.responseModels.find((m) => m.id === data.response_model_id);
    }
    if (data.tts_model_id && models.ttsModels) {
      updatedSelection.ttsModel = models.ttsModels.find((m) => m.id === data.tts_model_id);
    }
    if (data.realtime_model_id && models.realtimeModels) {
      updatedSelection.realtimeModel = models.realtimeModels.find((m) => m.id === data.realtime_model_id);
    }
    if (data.timestamped_transcription_model_id && models.timestampedTranscriptionModels) {
      updatedSelection.timestampedTranscriptionModel = models.timestampedTranscriptionModels.find(
        (m) => m.id === data.timestamped_transcription_model_id,
      );
    }
    if (data.realtime_transcription_model_id && models.realtimeTranscriptionModels) {
      updatedSelection.realtimeTranscriptionModel = models.realtimeTranscriptionModels.find(
        (m) => m.id === data.realtime_transcription_model_id,
      );
    }

    setSelection(updatedSelection);
    setIsSaving(false);
  };

  if (!ready || !session) return <Loading/>;
  const sections: ModelSectionConfig[] = [
    {
      label: t('responseModel'),
      modelKey: 'responseModel',
      models: models.responseModels,
    },
    {
      label: t('ttsModel'),
      modelKey: 'ttsModel',
      models: models.ttsModels,
    },
    {
      label: t('realtimeModel'),
      modelKey: 'realtimeModel',
      models: models.realtimeModels,
    },
    {
      label: t('models.timestampedTranscriptionModel'),
      modelKey: 'timestampedTranscriptionModel',
      models: models.timestampedTranscriptionModels,
    },
    {
      label: t('models.realtimeTranscriptionModel'),
      modelKey: 'realtimeTranscriptionModel',
      models: models.realtimeTranscriptionModels,
    },
  ];

  if (loading) {
    return (
      <div className='flex justify-center items-center h-96'>
        <span className='text-muted-foreground'>{t('loading.general')}</span>
      </div>
    );
  }

  return (
    <Card className='max-w-3xl mx-auto p-6'>
      <CardHeader>
        <CardTitle>{t('customModelPreferences')}</CardTitle>
      </CardHeader>
      <CardContent className='grid gap-8'>
        <ModelSelectionForm
          sections={sections}
          modelSelection={selection}
          setModelSelection={setSelection}
          selectProviderLabel={t('selectProvider')}
          selectModelLabel={t('selectModel')}
        />
      </CardContent>

      <CardFooter className="flex gap-4">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className='flex-1'
        >
          {isSaving ? t('saving') : t('savePreferences')}
        </Button>
      </CardFooter>
    </Card>
  );
}
