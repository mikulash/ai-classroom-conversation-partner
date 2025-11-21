import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { repliesClient } from '@repo/frontend-utils/src/clients/replies.client';
import { toast } from 'sonner';
import { useAppStore } from '../../hooks/useAppStore';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ModelOptionsWithAvailability, ModelSelection } from '@repo/shared/types/modelSelection';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { ModelSelectionForm, ModelSelectionSection } from '../../components/admin/ModelSelectionForm';
import {
  getAvailableRealtimeModels,
  getAvailableRealtimeTranscriptionModels,
  getAvailableResponseModels,
  getAvailableTimestampedTranscriptionModels,
  getAvailableTtsModels,
} from '@repo/shared/utils/filterModelsByApiKeyStatus';
import { modelClient } from '@repo/frontend-utils/src/clients/db/model.client';
import { appConfigClient } from '@repo/frontend-utils/src/clients/db/appConfig.client';

export function AdminGlobalModelSelectionPage() {
  const { t } = useTypedTranslation();
  const setAppConfig = useAppStore((state) => state.setAppConfig);
  const [modelOptions, setModelOptions] = useState<ModelOptionsWithAvailability>({
    responseModels: [],
    ttsModels: [],
    realtimeModels: [],
    timestampedTranscriptionModels: [],
    realtimeTranscriptionModels: [],
  });

  const appConfig = useAppStore((state) => state.appConfig);

  const [modelSelectionState, setModelSelectionState] = useState<Partial<ModelSelection>>({
    responseModel: undefined,
    ttsModel: undefined,
    realtimeModel: undefined,
    timestampedTranscriptionModel: undefined,
    realtimeTranscriptionModel: undefined,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  /** Load available models + current config */
  useEffect(() => {
    void (async () => {
      const [
        { data: responseModels, error: responseError },
        { data: ttsModels, error: ttsError },
        { data: realtimeModels, error: realtimeError },
        { data: timestampedTranscriptionModels, error: timestampedTranscriptionError },
        { data: realtimeTranscriptionModels, error: realtimeTranscriptionError },
        aiProvidersAvailability,
      ] = await Promise.all([
        modelClient.responseModels(),
        modelClient.ttsModels(),
        modelClient.realtimeModels(),
        modelClient.timestampedTranscriptionModels(),
        modelClient.realtimeTranscriptionModels(),
        repliesClient.getAiProvidersAvailability(),
      ]);


      if (responseError || ttsError || realtimeError || timestampedTranscriptionError || realtimeTranscriptionError) {
        console.error(
          responseError?.message ??
                    ttsError?.message ??
                    realtimeError?.message ??
                    timestampedTranscriptionError?.message ??
                    realtimeTranscriptionError?.message,
        );
        toast.error(t('models.loadFailed'), {
          description:
                        responseError?.message ??
                        ttsError?.message ??
                        realtimeError?.message ??
                        timestampedTranscriptionError?.message ??
                        realtimeTranscriptionError?.message,
        });
        setIsLoading(false);
        return;
      }

      const filteredResponseModels = getAvailableResponseModels(aiProvidersAvailability, responseModels);
      const filteredTtsModels = getAvailableTtsModels(aiProvidersAvailability, ttsModels);
      const filteredRealtimeModels = getAvailableRealtimeModels(aiProvidersAvailability, realtimeModels);
      const filteredTimestampedTranscriptionModels = getAvailableTimestampedTranscriptionModels(aiProvidersAvailability, timestampedTranscriptionModels);
      const filteredRealtimeTranscriptionModels = getAvailableRealtimeTranscriptionModels(aiProvidersAvailability, realtimeTranscriptionModels);

      setModelOptions({
        responseModels: filteredResponseModels,
        ttsModels: filteredTtsModels,
        realtimeModels: filteredRealtimeModels,
        timestampedTranscriptionModels: filteredTimestampedTranscriptionModels,
        realtimeTranscriptionModels: filteredRealtimeTranscriptionModels,
      });

      // Find selected models based on app_config
      const selectedResponseModel =
                filteredResponseModels.find((m) => m.id === appConfig.responseModelId) ?? null;
      const selectedTtsModel =
                filteredTtsModels.find((m) => m.id === appConfig.ttsModelId) ?? null;
      const selectedRealtimeModel =
                filteredRealtimeModels.find((m) => m.id === appConfig.realtimeModelId) ?? null;
      const selectedTimestampedTranscriptionModel =
                filteredTimestampedTranscriptionModels.find(
                  (m) => m.id === appConfig.timestampedTranscriptionModelId,
                ) ?? null;
      const selectedRealtimeTranscriptionModel =
                filteredRealtimeTranscriptionModels.find(
                  (m) => m.id === appConfig.realtimeTranscriptionModelId,
                ) ?? null;

      setModelSelectionState({
        responseModel: selectedResponseModel ?? filteredResponseModels[0],
        ttsModel: selectedTtsModel ?? filteredTtsModels[0],
        realtimeModel: selectedRealtimeModel ?? filteredRealtimeModels[0],
        timestampedTranscriptionModel:
                    selectedTimestampedTranscriptionModel ?? filteredTimestampedTranscriptionModels[0],
        realtimeTranscriptionModel:
                    selectedRealtimeTranscriptionModel ?? filteredRealtimeTranscriptionModels[0],
      });

      setIsLoading(false);
    })();
  }, [appConfig]);

  const handleSave = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      t('models.confirmationWarning'),
    );

    if (!confirmed) {
      console.warn('User cancelled model selection save');
      return;
    }

    setIsSaving(true);
    const { data, error } = await appConfigClient.updateAppConfigModels({
      responseModelId: modelSelectionState.responseModel?.id,
      ttsModelId: modelSelectionState.ttsModel?.id,
      realtimeModelId: modelSelectionState.realtimeModel?.id,
      timestampedTranscriptionModelId: modelSelectionState.timestampedTranscriptionModel?.id,
      realtimeTranscriptionModelId: modelSelectionState.realtimeTranscriptionModel?.id,
    });


    if (error) {
      console.error(error.message);
      toast.error(t('models.saveFailed'), { description: error.message });
      setIsSaving(false);
      return;
    }

    toast.success(t('models.saveSuccess'), {
      description: t('models.saveSuccessDescription'),
    });
    setAppConfig(data);
    setIsSaving(false);
  };

  const getOptionStatus = (configValue?: number | null) =>
    (model: { id: number }, currentModel?: { id: number }) => {
      if (configValue == null) return null;
      if (!currentModel) return null;
      return currentModel.id === configValue && model.id === currentModel.id ? t('models.currentlyApplied') : null;
    };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-96'>
        <span className='text-muted-foreground'>{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <Card className='max-w-3xl mx-auto p-6'>
      <CardHeader>
        <CardTitle>{t('models.title')}</CardTitle>
      </CardHeader>
      <CardContent className='grid gap-8'>
        <ModelSelectionForm>
          <ModelSelectionSection
            label={t('models.responseModel')}
            modelKey='responseModel'
            models={modelOptions.responseModels}
            modelSelection={modelSelectionState}
            setModelSelection={setModelSelectionState}
            selectProviderLabel={t('models.selectProvider')}
            selectModelLabel={t('models.selectModel')}
            optionStatus={getOptionStatus(appConfig.responseModelId)}
          />
          <ModelSelectionSection
            label={t('models.ttsModel')}
            modelKey='ttsModel'
            models={modelOptions.ttsModels}
            modelSelection={modelSelectionState}
            setModelSelection={setModelSelectionState}
            selectProviderLabel={t('models.selectProvider')}
            selectModelLabel={t('models.selectModel')}
            optionStatus={getOptionStatus(appConfig.ttsModelId)}
          />
          <ModelSelectionSection
            label={t('models.realtimeModel')}
            modelKey='realtimeModel'
            models={modelOptions.realtimeModels}
            modelSelection={modelSelectionState}
            setModelSelection={setModelSelectionState}
            selectProviderLabel={t('models.selectProvider')}
            selectModelLabel={t('models.selectModel')}
            optionStatus={getOptionStatus(appConfig.realtimeModelId)}
          />
          <ModelSelectionSection
            label={t('models.timestampedTranscriptionModel')}
            modelKey='timestampedTranscriptionModel'
            models={modelOptions.timestampedTranscriptionModels}
            modelSelection={modelSelectionState}
            setModelSelection={setModelSelectionState}
            selectProviderLabel={t('models.selectProvider')}
            selectModelLabel={t('models.selectModel')}
            optionStatus={getOptionStatus(appConfig.timestampedTranscriptionModelId)}
          />
          <ModelSelectionSection
            label={t('models.realtimeTranscriptionModel')}
            modelKey='realtimeTranscriptionModel'
            models={modelOptions.realtimeTranscriptionModels}
            modelSelection={modelSelectionState}
            setModelSelection={setModelSelectionState}
            selectProviderLabel={t('models.selectProvider')}
            selectModelLabel={t('models.selectModel')}
            optionStatus={getOptionStatus(appConfig.realtimeTranscriptionModelId)}
          />
        </ModelSelectionForm>
        <Alert variant="default">
          <AlertCircle className="h-4 w-4"/>
          <AlertTitle>{t('models.warningTitle')}</AlertTitle>
          <AlertDescription>
            {t('models.warningDescription')}
          </AlertDescription>
        </Alert>
      </CardContent>

      <CardFooter>
        <Button onClick={() => {
          void handleSave();
        }} disabled={isSaving} className='w-full'>
          {isSaving ? t('common.saving') : t('models.saveSettings')}
        </Button>
      </CardFooter>
    </Card>
  );
}
