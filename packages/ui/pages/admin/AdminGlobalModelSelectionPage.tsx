import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { modelApi } from '@repo/api-client/src/supabaseService';
import { toast } from 'sonner';
import { useAppStore } from '../../hooks/useAppStore';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ModelOptions, ModelSelection } from '@repo/shared/types/modelSelection';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { ModelSectionConfig, ModelSelectionForm } from '../../components/admin/ModelSelectionForm';

export function AdminGlobalModelSelectionPage() {
  const { t } = useTypedTranslation();
  const setAppConfig = useAppStore((state) => state.setAppConfig);
  const [models, setModels] = useState<ModelOptions>({
    responseModels: [],
    ttsModels: [],
    realtimeModels: [],
    timestampedTranscriptionModels: [],
    realtimeTranscriptionModels: [],
  });

  const app_config = useAppStore((state) => state.appConfig);

  const [state, setState] = useState<Partial<ModelSelection>>({
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
    (async () => {
      const [
        { data: responseModels, error: responseError },
        { data: ttsModels, error: ttsError },
        { data: realtimeModels, error: realtimeError },
        { data: timestampedTranscriptionModels, error: timestampedTranscriptionError },
        { data: realtimeTranscriptionModels, error: realtimeTranscriptionError },
      ] = await Promise.all([
        modelApi.responseModels(),
        modelApi.ttsModels(),
        modelApi.realtimeModels(),
        modelApi.timestampedTranscriptionModels(),
        modelApi.realtimeTranscriptionModels(),
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
        setLoading(false);
        return;
      }

      setModels({
        responseModels: responseModels ?? [],
        ttsModels: ttsModels ?? [],
        realtimeModels: realtimeModels ?? [],
        timestampedTranscriptionModels: timestampedTranscriptionModels ?? [],
        realtimeTranscriptionModels: realtimeTranscriptionModels ?? [],
      });

      // Find selected models based on app_config
      const selectedResponseModel =
        responseModels?.find((m) => m.id === app_config?.response_model_id) || null;
      const selectedTtsModel =
        ttsModels?.find((m) => m.id === app_config?.tts_model_id) || null;
      const selectedRealtimeModel =
        realtimeModels?.find((m) => m.id === app_config?.realtime_model_id) || null;
      const selectedTimestampedTranscriptionModel =
        timestampedTranscriptionModels?.find(
          (m) => m.id === app_config?.timestamped_transcription_model_id,
        ) || null;
      const selectedRealtimeTranscriptionModel =
        realtimeTranscriptionModels?.find(
          (m) => m.id === app_config?.realtime_transcription_model_id,
        ) || null;

      setState({
        responseModel: selectedResponseModel || (responseModels?.[0] || null),
        ttsModel: selectedTtsModel || (ttsModels?.[0] || null),
        realtimeModel: selectedRealtimeModel || (realtimeModels?.[0] || null),
        timestampedTranscriptionModel: selectedTimestampedTranscriptionModel || (timestampedTranscriptionModels?.[0] || null),
        realtimeTranscriptionModel: selectedRealtimeTranscriptionModel || (realtimeTranscriptionModels?.[0] || null),
      });

      setLoading(false);
    })();
  }, [app_config]);

  const handleSave = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      t('models.confirmationWarning'),
    );

    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    const { data, error } = await modelApi.updateAppConfigModels({
      response_model_id: state.responseModel?.id,
      tts_model_id: state.ttsModel?.id,
      realtime_model_id: state.realtimeModel?.id,
      timestamped_transcription_model_id: state.timestampedTranscriptionModel?.id,
      realtime_transcription_model_id: state.realtimeTranscriptionModel?.id,
      edited_at: new Date().toISOString(),
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

  const sections: ModelSectionConfig[] = [
    {
      label: t('models.responseModel'),
      modelKey: 'responseModel',
      models: models.responseModels,
    },
    {
      label: t('models.ttsModel'),
      modelKey: 'ttsModel',
      models: models.ttsModels,
    },
    {
      label: t('models.realtimeModel'),
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
        <ModelSelectionForm
          sections={sections}
          state={state}
          setState={setState}
          selectProviderLabel={t('models.selectProvider')}
          selectModelLabel={t('models.selectModel')}
        />
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('models.warningTitle')}</AlertTitle>
          <AlertDescription>
            {t('models.warningDescription')}
          </AlertDescription>
        </Alert>
      </CardContent>

      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving} className='w-full'>
          {isSaving ? t('common.saving') : t('models.saveSettings')}
        </Button>
      </CardFooter>
    </Card>
  );
}
