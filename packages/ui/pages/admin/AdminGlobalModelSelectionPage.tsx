import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { modelApi } from '@repo/api-client/src/supabaseService';
import { toast } from 'sonner';
import { useAppStore } from '../../hooks/useAppStore';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ModelOptions, ModelSelection } from '@repo/shared/types/modelSelection';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';

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
        responseModels?.find((m: any) => m.id === app_config?.response_model_id) || null;
      const selectedTtsModel =
        ttsModels?.find((m: any) => m.id === app_config?.tts_model_id) || null;
      const selectedRealtimeModel =
        realtimeModels?.find((m: any) => m.id === app_config?.realtime_model_id) || null;
      const selectedTimestampedTranscriptionModel =
        timestampedTranscriptionModels?.find(
          (m: any) => m.id === app_config?.timestamped_transcription_model_id,
        ) || null;
      const selectedRealtimeTranscriptionModel =
        realtimeTranscriptionModels?.find(
          (m: any) => m.id === app_config?.realtime_transcription_model_id,
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

  const getProviders = <T extends { provider: string }>(models: T[]): string[] =>
      Array.from(new Set(models.map((m) => m.provider).filter(Boolean))) as string[];

  const getModelsForProvider = <T extends { provider: string }>(
    providerName: string,
    models: T[],
  ): T[] => models.filter((m) => m.provider === providerName);

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

  const renderSection = <T extends { id: number; provider: string; friendly_name?: string; api_name: string }>(
    label: string,
    modelKey: keyof ModelSelection,
    modelArray: T[],
  ) => {
    const currentModel = state[modelKey] as T | undefined;
    const currentProvider = currentModel?.provider || '';

    return (
      <div className='grid gap-4'>
        <h3 className='text-xl font-semibold'>{label}</h3>

        <Select
          value={currentProvider}
          onValueChange={(value) => {
            const modelsForProvider = getModelsForProvider(value, modelArray);
            if (modelsForProvider.length > 0) {
              setState((prev) => ({
                ...prev,
                [modelKey]: modelsForProvider[0],
              }));
            }
          }}
        >
          <SelectTrigger className='w-full'>
            <SelectValue placeholder={t('models.selectProvider')}/>
          </SelectTrigger>
          <SelectContent>
            {getProviders(modelArray).map((provider) => (
              <SelectItem key={provider} value={provider}>
                {provider}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentModel?.id ? String(currentModel.id) : ''}
          onValueChange={(value) => {
            const selectedModel = modelArray.find((m) => m.id === Number(value));
            if (selectedModel) {
              setState((prev) => ({
                ...prev,
                [modelKey]: selectedModel,
              }));
            }
          }}
        >
          <SelectTrigger className='w-full'>
            <SelectValue placeholder={t('models.selectModel')}/>
          </SelectTrigger>
          <SelectContent className='max-h-60 overflow-y-auto'>
            {getModelsForProvider(currentProvider, modelArray).map((model) => (
              <SelectItem key={model.id} value={String(model.id)}>
                <div className='flex flex-col'>
                  <span>{model.friendly_name ?? model.api_name}</span>
                  {model.api_name && model.friendly_name && (
                    <span className='text-xs text-muted-foreground'>
                      {model.api_name}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

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
        {renderSection(
          t('models.responseModel'),
          'responseModel',
          models.responseModels,
        )}
        {renderSection(
          t('models.ttsModel'),
          'ttsModel',
          models.ttsModels,
        )}
        {renderSection(
          t('models.realtimeModel'),
          'realtimeModel',
          models.realtimeModels,
        )}
        {renderSection(
          t('models.timestampedTranscriptionModel'),
          'timestampedTranscriptionModel',
          models.timestampedTranscriptionModels,
        )}
        {renderSection(
          t('models.realtimeTranscriptionModel'),
          'realtimeTranscriptionModel',
          models.realtimeTranscriptionModels,
        )}
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
