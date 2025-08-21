import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { supabase } from '@repo/api-client/src/supabase';
import { toast } from 'sonner';
import { useAppStore } from '../../hooks/useAppStore';
import { ModelOptions, ModelSelection } from '@repo/shared/types/modelSelection';
import { useSession } from '../../hooks/useSession';
import { Loading } from '../../components/Loading';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';

export default function AdminCustomModelSelectionPage() {
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
      ] = await Promise.all([
        supabase.from('response_models').select('*'),
        supabase.from('tts_models').select('*'),
        supabase.from('realtime_models').select('*'),
        supabase.from('timestamped_transcription_models').select('*'),
        supabase.from('realtime_transcription_models').select('*'),
        supabase.from('admin_users_custom_model_selection').select('*').eq('user_id', session?.user.id),
      ]);

      const errors = [responseError, ttsError, realtimeError, timestampedError, realtimeTransError].filter(Boolean);

      if (errors.length > 0) {
        console.error('error loading models:', errors[0]?.message);
        toast.error(t('failedToLoadData'), {
          description: errors[0]?.message,
        });
        setLoading(false);
        return;
      }

      const userSelection = userCustomSettings?.[0];

      setModels({
        responseModels: responseModels ?? [],
        ttsModels: ttsModels ?? [],
        realtimeModels: realtimeModels ?? [],
        timestampedTranscriptionModels: timestampedTranscriptionModels ?? [],
        realtimeTranscriptionModels: realtimeTranscriptionModels ?? [],
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
          responseModels ?? [],
          userSelection?.response_model_id,
          app_config?.response_model_id,
        ),
        ttsModel: findSelectedModel(
          ttsModels ?? [],
          userSelection?.tts_model_id,
          app_config?.tts_model_id,
        ),
        realtimeModel: findSelectedModel(
          realtimeModels ?? [],
          userSelection?.realtime_model_id,
          app_config?.realtime_model_id,
        ),
        timestampedTranscriptionModel: findSelectedModel(
          timestampedTranscriptionModels ?? [],
          userSelection?.timestamped_transcription_model_id,
          app_config?.timestamped_transcription_model_id,
        ),
        realtimeTranscriptionModel: findSelectedModel(
          realtimeTranscriptionModels ?? [],
          userSelection?.realtime_transcription_model_id,
          app_config?.realtime_transcription_model_id,
        ),
      });

      setLoading(false);
    })();
  }, [session?.user, t]);

  const getProviders = <T extends { provider: string }>(models: T[]): string[] =>
      Array.from(new Set(models.map((m) => m.provider).filter(Boolean))) as string[];

  const getModelsForProvider = <T extends { provider: string }>(
    providerName: string,
    models: T[],
  ): T[] => models.filter((m) => m.provider === providerName);

  const handleSave = async () => {
    if (!session?.user) {
      toast.error(t('loginRequiredToSave'));
      return;
    }

    setIsSaving(true);

    const { error, data } = await supabase
      .from('admin_users_custom_model_selection')
      .upsert({
        user_id: session?.user.id,
        response_model_id: selection.responseModel?.id ?? null,
        tts_model_id: selection.ttsModel?.id ?? null,
        realtime_model_id: selection.realtimeModel?.id ?? null,
        timestamped_transcription_model_id: selection.timestampedTranscriptionModel?.id ?? null,
        realtime_transcription_model_id: selection.realtimeTranscriptionModel?.id ?? null,
      })
      .select()
      .single();

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

  const renderSection = <T extends { id: number; provider: string; friendly_name?: string; api_name: string }>(
    label: string,
    modelKey: keyof ModelSelection,
    modelArray: T[],
  ) => {
    const currentModel = selection[modelKey] as T | undefined;
    const currentProvider = currentModel?.provider || '';

    return (
      <div className='grid gap-4'>
        <h3 className='text-xl font-semibold'>{label}</h3>

        <Select
          value={currentProvider}
          onValueChange={(value) => {
            const modelsForProvider = getModelsForProvider(value, modelArray);
            if (modelsForProvider.length > 0) {
              setSelection((prev) => ({
                ...prev,
                [modelKey]: modelsForProvider[0],
              }));
            }
          }}
        >
          <SelectTrigger className='w-full'>
            <SelectValue placeholder={t('selectProvider')}/>
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
              setSelection((prev) => ({
                ...prev,
                [modelKey]: selectedModel,
              }));
            }
          }}
        >
          <SelectTrigger className='w-full'>
            <SelectValue placeholder={t('selectModel')}/>
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
        <span className='text-muted-foreground'>{t('loading')}</span>
      </div>
    );
  }

  return (
    <Card className='max-w-3xl mx-auto p-6'>
      <CardHeader>
        <CardTitle>{t('customModelPreferences')}</CardTitle>
      </CardHeader>
      <CardContent className='grid gap-8'>
        {renderSection(
          t('responseModel'),
          'responseModel',
          models.responseModels,
        )}
        {renderSection(
          t('ttsModel'),
          'ttsModel',
          models.ttsModels,
        )}
        {renderSection(
          t('realtimeModel'),
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
