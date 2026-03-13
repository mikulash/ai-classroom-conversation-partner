import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { repliesClient } from '@repo/frontend-utils/src/clients/replies.client';
import { toast } from 'sonner';
import { useAppStore } from '../../hooks/useAppStore';
import { ModelOptionsWithAvailability, ModelSelection } from '../../lib/types/modelSelection';
import { useAuth } from '../../hooks/useAuth';
import { Loading } from '../../components/Loading';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { ModelSelectionForm, ModelSelectionSection } from '../../components/admin/ModelSelectionForm';
import {
  getAvailableRealtimeModels,
  getAvailableRealtimeTranscriptionModels,
  getAvailableResponseModels,
  getAvailableTimestampedTranscriptionModels,
  getAvailableTtsModels,
} from '../../lib/filterModelsByApiKeyStatus';
import { modelClient } from '@repo/frontend-utils/src/clients/db/model.client';

export function AdminCustomModelSelectionPage() {
  const { t } = useTypedTranslation();
  const { session, ready } = useAuth();

  const [models, setModels] = useState<ModelOptionsWithAvailability>({
    responseModels: [],
    ttsModels: [],
    realtimeModels: [],
    timestampedTranscriptionModels: [],
    realtimeTranscriptionModels: [],
  });

  const appConfig = useAppStore((state) => state.appConfig);

  // Use Partial<ModelSelection> since models might be undefined initially
  const [selection, setSelection] = useState<Partial<ModelSelection>>({
    responseModel: undefined,
    ttsModel: undefined,
    realtimeModel: undefined,
    timestampedTranscriptionModel: undefined,
    realtimeTranscriptionModel: undefined,
  });

  // Track which fields have explicit user overrides (vs using global defaults)
  const [userOverrides, setUserOverrides] = useState<Set<keyof ModelSelection>>(new Set());

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  /** Load available models + current config */
  useEffect(() => {
    if (!session?.user) return;

    void (async () => {
      const [
        { data: responseModels, error: responseError },
        { data: ttsModels, error: ttsError },
        { data: realtimeModels, error: realtimeError },
        { data: timestampedTranscriptionModels, error: timestampedError },
        { data: realtimeTranscriptionModels, error: realtimeTransError },
        { data: userCustomSettings },
        aiProvidersAvailability,
      ] = await Promise.all([
        modelClient.responseModels(),
        modelClient.ttsModels(),
        modelClient.realtimeModels(),
        modelClient.timestampedTranscriptionModels(),
        modelClient.realtimeTranscriptionModels(),
        modelClient.customModelSelection(session.user.id),
        repliesClient.getAiProvidersAvailability(),
      ]);

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

      // Track which fields have user overrides
      const overrides = new Set<keyof ModelSelection>();
      if (userSelection?.responseModelId != null) overrides.add('responseModel');
      if (userSelection?.ttsModelId != null) overrides.add('ttsModel');
      if (userSelection?.realtimeModelId != null) overrides.add('realtimeModel');
      if (userSelection?.timestampedTranscriptionModelId != null) overrides.add('timestampedTranscriptionModel');
      if (userSelection?.realtimeTranscriptionModelId != null) overrides.add('realtimeTranscriptionModel');
      setUserOverrides(overrides);

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
          userSelection?.responseModelId,
          appConfig.responseModelId,
        ),
        ttsModel: findSelectedModel(
          filteredTtsModels,
          userSelection?.ttsModelId,
          appConfig.ttsModelId,
        ),
        realtimeModel: findSelectedModel(
          filteredRealtimeModels,
          userSelection?.realtimeModelId,
          appConfig.realtimeModelId,
        ),
        timestampedTranscriptionModel: findSelectedModel(
          filteredTimestampedTranscriptionModels,
          userSelection?.timestampedTranscriptionModelId,
          appConfig.timestampedTranscriptionModelId,
        ),
        realtimeTranscriptionModel: findSelectedModel(
          filteredRealtimeTranscriptionModels,
          userSelection?.realtimeTranscriptionModelId,
          appConfig.realtimeTranscriptionModelId,
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

    // Build payload with only the fields that should be stored as overrides
    // Logic: Only send fields where:
    // 1. Selection is undefined (null) → send null to remove override
    // 2. Selection differs from global → send ID to set/update override
    // 3. Selection matches global AND had previous override → send ID to keep explicit override
    // 4. Selection matches global AND no previous override → don't send (use global default)
    const payload: Partial<{
      responseModelId: number | null;
      ttsModelId: number | null;
      realtimeModelId: number | null;
      timestampedTranscriptionModelId: number | null;
      realtimeTranscriptionModelId: number | null;
    }> = {};

    // Response Model
    if (!selection.responseModel) {
      // Cleared - remove override
      payload.responseModelId = null;
    } else if (selection.responseModel.id !== appConfig.responseModelId) {
      // Differs from global - set override
      payload.responseModelId = selection.responseModel.id;
    } else if (userOverrides.has('responseModel')) {
      // Matches global but had previous override - keep explicit override
      payload.responseModelId = selection.responseModel.id;
    }
    // else: matches global and no previous override - don't send

    // TTS Model
    if (!selection.ttsModel) {
      payload.ttsModelId = null;
    } else if (selection.ttsModel.id !== appConfig.ttsModelId) {
      payload.ttsModelId = selection.ttsModel.id;
    } else if (userOverrides.has('ttsModel')) {
      payload.ttsModelId = selection.ttsModel.id;
    }

    // Realtime Model
    if (!selection.realtimeModel) {
      payload.realtimeModelId = null;
    } else if (selection.realtimeModel.id !== appConfig.realtimeModelId) {
      payload.realtimeModelId = selection.realtimeModel.id;
    } else if (userOverrides.has('realtimeModel')) {
      payload.realtimeModelId = selection.realtimeModel.id;
    }

    // Timestamped Transcription Model
    if (!selection.timestampedTranscriptionModel) {
      payload.timestampedTranscriptionModelId = null;
    } else if (selection.timestampedTranscriptionModel.id !== appConfig.timestampedTranscriptionModelId) {
      payload.timestampedTranscriptionModelId = selection.timestampedTranscriptionModel.id;
    } else if (userOverrides.has('timestampedTranscriptionModel')) {
      payload.timestampedTranscriptionModelId = selection.timestampedTranscriptionModel.id;
    }

    // Realtime Transcription Model
    if (!selection.realtimeTranscriptionModel) {
      payload.realtimeTranscriptionModelId = null;
    } else if (selection.realtimeTranscriptionModel.id !== appConfig.realtimeTranscriptionModelId) {
      payload.realtimeTranscriptionModelId = selection.realtimeTranscriptionModel.id;
    } else if (userOverrides.has('realtimeTranscriptionModel')) {
      payload.realtimeTranscriptionModelId = selection.realtimeTranscriptionModel.id;
    }

    const { error, data } = await modelClient.upsertCustomModelSelection(session.user.id, payload);

    if (error) {
      console.error(error.message);
      toast.error(t('saveFailed'), { description: error.message });
      setIsSaving(false);
      return;
    }

    toast.success(t('settingsSaved'), {
      description: t('customModelPreferencesSaved'),
    });

    // Update userOverrides tracking based on what was saved
    const newOverrides = new Set<keyof ModelSelection>();
    if (data.responseModelId != null) newOverrides.add('responseModel');
    if (data.ttsModelId != null) newOverrides.add('ttsModel');
    if (data.realtimeModelId != null) newOverrides.add('realtimeModel');
    if (data.timestampedTranscriptionModelId != null) newOverrides.add('timestampedTranscriptionModel');
    if (data.realtimeTranscriptionModelId != null) newOverrides.add('realtimeTranscriptionModel');
    setUserOverrides(newOverrides);

    // Update selection with data returned from the server
    // If a field is null (removed), fall back to global default for display
    const updatedSelection: Partial<ModelSelection> = {};

    updatedSelection.responseModel = data.responseModelId ?
      models.responseModels.find((m) => m.id === data.responseModelId) :
      models.responseModels.find((m) => m.id === appConfig.responseModelId);

    updatedSelection.ttsModel = data.ttsModelId ?
      models.ttsModels.find((m) => m.id === data.ttsModelId) :
      models.ttsModels.find((m) => m.id === appConfig.ttsModelId);

    updatedSelection.realtimeModel = data.realtimeModelId ?
      models.realtimeModels.find((m) => m.id === data.realtimeModelId) :
      models.realtimeModels.find((m) => m.id === appConfig.realtimeModelId);

    updatedSelection.timestampedTranscriptionModel = data.timestampedTranscriptionModelId ?
      models.timestampedTranscriptionModels.find((m) => m.id === data.timestampedTranscriptionModelId) :
      models.timestampedTranscriptionModels.find((m) => m.id === appConfig.timestampedTranscriptionModelId);

    updatedSelection.realtimeTranscriptionModel = data.realtimeTranscriptionModelId ?
      models.realtimeTranscriptionModels.find((m) => m.id === data.realtimeTranscriptionModelId) :
      models.realtimeTranscriptionModels.find((m) => m.id === appConfig.realtimeTranscriptionModelId);

    setSelection(updatedSelection);
    setIsSaving(false);
  };

  if (!ready || !session) return <Loading/>;
  const overridesDefaultLabel = t('models.overridesDefault');
  const usesGlobalDefaultLabel = t('models.usesGlobalDefault');
  const clearSectionLabel = t('models.clearCustomSelection');
  const clearAllLabel = t('models.clearAllCustomSelections');
  const globalOptionStatus = (modelId?: number | null) =>
    (model: { id: number }, _currentModel?: { id: number }) => {
      void _currentModel;
      return modelId != null && model.id === modelId ? t('models.currentlyUsedGlobally') : null;
    };

  const globalProviderStatus = (modelId?: number | null, modelsList?: { id: number; provider: string }[]) =>
    (provider: string, _currentProvider?: string) => {
      void _currentProvider;
      if (modelId == null || !modelsList) return null;
      const globalModel = modelsList.find((m) => m.id === modelId);
      return globalModel?.provider === provider ? t('models.currentlyUsedGlobally') : null;
    };

  const modelKeys: (keyof ModelSelection)[] = [
    'responseModel',
    'ttsModel',
    'realtimeModel',
    'timestampedTranscriptionModel',
    'realtimeTranscriptionModel',
  ];

  const globalModelIds: Record<keyof ModelSelection, number | null> = {
    responseModel: appConfig.responseModelId ?? null,
    ttsModel: appConfig.ttsModelId ?? null,
    realtimeModel: appConfig.realtimeModelId ?? null,
    timestampedTranscriptionModel: appConfig.timestampedTranscriptionModelId ?? null,
    realtimeTranscriptionModel: appConfig.realtimeTranscriptionModelId ?? null,
  };

  const hasAnyOverride = userOverrides.size > 0;

  const titleStatusForKey = (modelKey: keyof ModelSelection) => {
    const selectedModel = selection[modelKey] as { id?: number } | undefined;
    const selectedId = selectedModel?.id ?? null;
    const globalId = globalModelIds[modelKey];
    const isOverriding = selectedId != null && selectedId !== globalId;
    const statusLabel = isOverriding ? overridesDefaultLabel : usesGlobalDefaultLabel;
    const statusColor = isOverriding ? 'text-yellow-600' : 'text-blue-600';

    return <span className={`text-xs font-medium ${statusColor}`}>{statusLabel}</span>;
  };

  const clearSelectionForKey = (modelKey: keyof ModelSelection) => {
    setSelection((prev) => ({
      ...prev,
      [modelKey]: undefined,
    }));
  };

  const clearAllSelections = () => {
    setSelection(
      Object.fromEntries(modelKeys.map((key) => [key, undefined])) as Partial<ModelSelection>,
    );
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-96'>
        <span className='text-muted-foreground'>{t('loading.general')}</span>
      </div>
    );
  }

  return (
    <Card className='max-w-3xl mx-auto p-6'>
      <CardHeader className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <CardTitle>{t('customModelPreferences')}</CardTitle>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={clearAllSelections}
          disabled={!hasAnyOverride}
        >
          {clearAllLabel}
        </Button>
      </CardHeader>
      <CardContent className='grid gap-8'>
        <ModelSelectionForm>
          <ModelSelectionSection
            label={t('responseModel')}
            modelKey='responseModel'
            models={models.responseModels}
            modelSelection={selection}
            setModelSelection={setSelection}
            selectProviderLabel={t('selectProvider')}
            selectModelLabel={t('selectModel')}
            titleStatus={titleStatusForKey('responseModel')}
            optionStatus={globalOptionStatus(appConfig.responseModelId)}
            providerStatus={globalProviderStatus(appConfig.responseModelId, models.responseModels)}
            clearSelectionLabel={clearSectionLabel}
            onClearSelection={() => {
              clearSelectionForKey('responseModel');
            }}
            hasOverride={userOverrides.has('responseModel')}
          />
          <ModelSelectionSection
            label={t('ttsModel')}
            modelKey='ttsModel'
            models={models.ttsModels}
            modelSelection={selection}
            setModelSelection={setSelection}
            selectProviderLabel={t('selectProvider')}
            selectModelLabel={t('selectModel')}
            titleStatus={titleStatusForKey('ttsModel')}
            optionStatus={globalOptionStatus(appConfig.ttsModelId)}
            providerStatus={globalProviderStatus(appConfig.ttsModelId, models.ttsModels)}
            clearSelectionLabel={clearSectionLabel}
            onClearSelection={() => {
              clearSelectionForKey('ttsModel');
            }}
            hasOverride={userOverrides.has('ttsModel')}
          />
          <ModelSelectionSection
            label={t('realtimeModel')}
            modelKey='realtimeModel'
            models={models.realtimeModels}
            modelSelection={selection}
            setModelSelection={setSelection}
            selectProviderLabel={t('selectProvider')}
            selectModelLabel={t('selectModel')}
            titleStatus={titleStatusForKey('realtimeModel')}
            optionStatus={globalOptionStatus(appConfig.realtimeModelId)}
            providerStatus={globalProviderStatus(appConfig.realtimeModelId, models.realtimeModels)}
            clearSelectionLabel={clearSectionLabel}
            onClearSelection={() => {
              clearSelectionForKey('realtimeModel');
            }}
            hasOverride={userOverrides.has('realtimeModel')}
          />
          <ModelSelectionSection
            label={t('models.timestampedTranscriptionModel')}
            modelKey='timestampedTranscriptionModel'
            models={models.timestampedTranscriptionModels}
            modelSelection={selection}
            setModelSelection={setSelection}
            selectProviderLabel={t('selectProvider')}
            selectModelLabel={t('selectModel')}
            titleStatus={titleStatusForKey('timestampedTranscriptionModel')}
            optionStatus={globalOptionStatus(appConfig.timestampedTranscriptionModelId)}
            providerStatus={globalProviderStatus(appConfig.timestampedTranscriptionModelId, models.timestampedTranscriptionModels)}
            clearSelectionLabel={clearSectionLabel}
            onClearSelection={() => {
              clearSelectionForKey('timestampedTranscriptionModel');
            }}
            hasOverride={userOverrides.has('timestampedTranscriptionModel')}
          />
          <ModelSelectionSection
            label={t('models.realtimeTranscriptionModel')}
            modelKey='realtimeTranscriptionModel'
            models={models.realtimeTranscriptionModels}
            modelSelection={selection}
            setModelSelection={setSelection}
            selectProviderLabel={t('selectProvider')}
            selectModelLabel={t('selectModel')}
            titleStatus={titleStatusForKey('realtimeTranscriptionModel')}
            optionStatus={globalOptionStatus(appConfig.realtimeTranscriptionModelId)}
            providerStatus={globalProviderStatus(appConfig.realtimeTranscriptionModelId, models.realtimeTranscriptionModels)}
            clearSelectionLabel={clearSectionLabel}
            onClearSelection={() => {
              clearSelectionForKey('realtimeTranscriptionModel');
            }}
            hasOverride={userOverrides.has('realtimeTranscriptionModel')}
          />
        </ModelSelectionForm>
      </CardContent>

      <CardFooter className="flex gap-4">
        <Button
          onClick={() => void handleSave()}
          disabled={isSaving}
          className='flex-1'
        >
          {isSaving ? t('saving') : t('savePreferences')}
        </Button>
      </CardFooter>
    </Card>
  );
}
